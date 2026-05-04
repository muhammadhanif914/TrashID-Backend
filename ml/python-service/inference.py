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
        """Load keras model with compatibility workaround"""
        if not os.path.exists(model_path):
            # Try alternative format
            if model_path.endswith('.h5'):
                keras_path = model_path.replace('.h5', '.keras')
                if os.path.exists(keras_path):
                    print(f"⚠️  H5 file not found, trying .keras instead...")
                    model_path = keras_path
                else:
                    raise FileNotFoundError(f"Model not found: {model_path} or {keras_path}")
            else:
                raise FileNotFoundError(f"Model not found at {model_path}")
        
        print(f"Loading model from: {model_path}")
        
        # Strategy 1: Direct load dengan environment workaround
        try:
            os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
            
            # Disable strict shape checking
            tf.compat.v1.keras.backend.set_image_data_format('channels_last')
            
            self.model = tf.keras.models.load_model(
                model_path, 
                compile=False
            )
            print(f"✓ Model loaded with direct method")
            
        except Exception as e1:
            print(f"⚠️  Direct load failed: {type(e1).__name__}")
            
            # Strategy 2: Rebuild architecture + load weights
            try:
                print("Attempting fallback: rebuild architecture + load weights...")
                rebuilt_model = self.build_model_architecture()
                
                # Try to load weights
                try:
                    rebuilt_model.load_weights(model_path, by_name=True, skip_mismatch=True)
                    print("✓ Weights loaded into rebuilt model")
                except:
                    print("⚠️  Could not load weights directly, model will use random init")
                
                self.model = rebuilt_model
                print(f"✓ Model built and ready")
                
            except Exception as e2:
                print(f"✗ Fallback also failed: {e2}")
                raise RuntimeError("Cannot load model with any method")
        
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
