from fastapi import FastAPI, File, HTTPException, UploadFile
from pathlib import Path
import os
from dotenv import load_dotenv
import tempfile
from werkzeug.utils import secure_filename

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
MODEL_PATH = os.getenv('MODEL_PATH', '../../model_trashid.keras')
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif', 'jfif'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# Initialize classifier
try:
    classifier = TrashClassifier(MODEL_PATH)
except FileNotFoundError as e:
    print(f"ERROR: {e}")
    classifier = None

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'model_loaded': classifier is not None
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Main prediction endpoint"""
    
    if classifier is None:
        return jsonify({
            'success': False,
            'error': 'Model not loaded'
        }), 500
    
    # Check if image file is in request
    if 'image' not in request.files:
        return jsonify({
            'success': False,
            from fastapi import FastAPI, File, HTTPException, UploadFile
            from pathlib import Path
            import os
            import numpy as np
            from PIL import Image
            import tensorflow as tf
            import io
            import uvicorn

            app = FastAPI()

            BASE_DIR = Path(__file__).resolve().parent
            MODEL_CANDIDATES = []
            model_path_env = os.getenv("MODEL_PATH")
            if model_path_env:
                MODEL_CANDIDATES.append(Path(model_path_env))
            MODEL_CANDIDATES.extend([
                BASE_DIR / "model_trashid.h5",
                BASE_DIR / "model_trashid.keras",
                BASE_DIR.parent / "model_trashid.keras",
            ])

            model = None
            model_path = None
            for candidate in MODEL_CANDIDATES:
                if candidate and candidate.exists():
                    model_path = candidate
                    model = tf.keras.models.load_model(str(candidate))
                    break

            if model is None:
                raise RuntimeError("Model file not found. Set MODEL_PATH or place model_trashid.h5/.keras next to app.py")

            classes = ["organik", "anorganik", "b3"]

            def preprocess(image):
                image = image.resize((224, 224))
                image = np.array(image) / 255.0
                image = np.expand_dims(image, axis=0)
                return image


            def format_probabilities(prediction_array):
                flat = prediction_array[0].tolist()
                return {classes[i]: float(flat[i]) for i in range(len(classes))}


            @app.get("/")
            def home():
                return {"status": "ok", "message": "ML API running", "model_loaded": True}


            @app.get("/health")
            def health():
                return {"status": "ok", "model_loaded": True}

            @app.get("/info")
            def info():
                return {
                    "status": "ok",
                    "model_loaded": True,
                    "model_path": str(model_path),
                    "classes": classes,
                }


            @app.post("/predict")
            async def predict(image: UploadFile = File(None), file: UploadFile = File(None)):
                try:
                    upload = image or file
                    if upload is None:
                        raise HTTPException(status_code=400, detail="image file is required")

                    contents = await upload.read()
                    image = Image.open(io.BytesIO(contents)).convert("RGB")

                    img = preprocess(image)
                    prediction = model.predict(img)

                    idx = int(np.argmax(prediction))
                    confidence = float(np.max(prediction))
                    predicted_class = classes[idx]

                    return {
                        "success": True,
                        "prediction": predicted_class,
                        "confidence": confidence,
                        "probabilities": format_probabilities(prediction),
                        "scores": prediction.tolist(),
                        "model_loaded": True,
                    }

                except Exception as e:
                    raise HTTPException(status_code=500, detail=str(e))


            if __name__ == "__main__":
                port = int(os.getenv("PYTHON_PORT", "5000"))
                uvicorn.run(app, host="0.0.0.0", port=port)
