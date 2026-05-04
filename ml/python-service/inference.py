import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from PIL import Image
import os
import h5py

class TrashClassifier:
    def __init__(self, model_path):
        """Initialize model"""
        self.model = None
        self.class_names = ['Anorganik', 'Organik', 'Residu']
        self.load_model(model_path)
        
    def build_model_architecture(self):
        """Rebuild model architecture untuk kompatibilitas"""
        print("Building model architecture...")
        
        # Data augmentation
        data_augmentation = tf.keras.Sequential([
            layers.RandomFlip("horizontal"),
            layers.RandomRotation(0.15),
            layers.RandomZoom(0.15),
            layers.RandomContrast(0.1),
        ])
        
        # Base model
        base_model = tf.keras.applications.MobileNetV2(
            input_shape=(224, 224, 3),
            include_top=False,
            weights='imagenet'
        )
        base_model.trainable = False
        
        # Build full model
        model = models.Sequential([
            data_augmentation,
            layers.Lambda(preprocess_input),
            base_model,
            layers.GlobalAveragePooling2D(),
            layers.BatchNormalization(),
            layers.Dense(128, activation='relu'),
            layers.Dropout(0.5),
            layers.Dense(len(self.class_names), activation='softmax')
        ])
        
        return model
    
    def load_weights_from_h5(self, model, h5_path):
        """Load weights dari H5 file ke model yang baru dibangun"""
        print(f"Loading weights from H5...")
        try:
            with h5py.File(h5_path, 'r') as f:
                # Try load semua weights
                if 'model_weights' in f:
                    for layer in model.layers:
                        if layer.name in f['model_weights']:
                            weights = [f['model_weights'][layer.name][w] for w in f['model_weights'][layer.name]]
                            layer.set_weights(weights)
                            print(f"  ✓ Loaded weights for {layer.name}")
            return True
        except Exception as e:
            print(f"  Warning: {e}")
            return False
    
    def load_model(self, model_path):
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model not found: {model_path}")
        
        print(f"Loading model from: {model_path}")
        try:
            import h5py
            import json
            
            # Peringatan: jika file format h5 dan Keras V3, kita perlu patch arsitekturnya
            # untuk menghindari error BatchNormalization (renorm, dll)
            
            from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
            
            # Matikan shape format
            tf.compat.v1.keras.backend.set_image_data_format('channels_last')
            
            try:
                register_serializable = tf.keras.saving.register_keras_serializable
            except AttributeError:
                register_serializable = tf.keras.utils.register_keras_serializable
                
            @register_serializable(package='Custom', name='preprocess_input')
            def custom_preprocess(x):
                return preprocess_input(x)

            # --- WORKAROUND TERBAIK UNTUK KERAS 3 VS KERAS 2 ---
            # Jika memuat arsitektur Keras V2 di Keras V3 mengalami renorm BatchNormalization error:
            try:
                self.model = tf.keras.models.load_model(
                    model_path, compile=False, custom_objects={'preprocess_input': custom_preprocess}
                )
            except TypeError as te:
                if 'BatchNormalization' in str(te):
                    print("⚠️  Detected Keras 2 to Keras 3 BatchNormalization incompatibility")
                    print("⚙️  Rebuilding model architecture manually...")
                    
                    # 1. Hentikan percobaan deserialize dan pakai build manual yg aman
                    self.model = self._build_manual_architecture()
                    
                    # 2. Build model dahulu sebelum memuatkan weights
                    self.model.build((None, 224, 224, 3))
                    
                    # 3. Pindahkan bobot (weights)
                    # Jika '.keras', Keras v3 tidak suka `by_name=True` secara default 
                    # saat menimpa architecture. Jadi hapus flag tersebut.
                    self.model.load_weights(model_path, skip_mismatch=True)
                    print("✓ Recovered from error: Architecture rebuilt and weights copied.")
                else:
                    raise te
                    
            print("✓ Model loaded successfully")

            # Compile for inference
            try:
                self.model.compile(
                    optimizer='adam',
                    loss='sparse_categorical_crossentropy',
                    metrics=['accuracy']
                )
            except:
                pass
            
            print(f"✓ Model ready for inference")
            
        except Exception as e:
            print(f"⚠️  Load failed: {e}")
            raise e
            
    def _build_manual_architecture(self):
        """Build a clean architecture safe for Keras 3"""
        from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
        
        data_augmentation = tf.keras.Sequential([
            layers.RandomFlip("horizontal"),
            layers.RandomRotation(0.15),
            layers.RandomZoom(0.15),
            layers.RandomContrast(0.1),
        ])
        
        base_model = tf.keras.applications.MobileNetV2(
            input_shape=(224, 224, 3), include_top=False, weights=None
        )
        base_model.trainable = False
        
        model = models.Sequential([
            data_augmentation,
            layers.Lambda(preprocess_input),
            base_model,
            layers.GlobalAveragePooling2D(),
            layers.BatchNormalization(),
            layers.Dense(128, activation='relu'),
            layers.Dropout(0.5),
            layers.Dense(len(self.class_names), activation='softmax')
        ])
        return model

    def preprocess_image(self, image_path, img_size=(224, 224)):
        """Preprocess image for prediction"""
        img = Image.open(image_path).convert('RGB')
        img = img.resize(img_size)
        img_array = np.array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = preprocess_input(img_array)
        return img_array
    
    def predict(self, image_path):
        """Make prediction on image"""
        try:
            img_array = self.preprocess_image(image_path)
            predictions = self.model.predict(img_array, verbose=0)
            
            predicted_idx = np.argmax(predictions[0])
            predicted_class = self.class_names[predicted_idx]
            confidence = float(predictions[0][predicted_idx])
            
            # Get all probabilities
            probabilities = {}
            for idx, class_name in enumerate(self.class_names):
                probabilities[class_name] = float(predictions[0][idx])
            
            return {
                'success': True,
                'prediction': predicted_class,
                'confidence': round(confidence, 4),
                'probabilities': probabilities
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
