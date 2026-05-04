from flask import Flask, request, jsonify
from flask_cors import CORS
from inference import TrashClassifier
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
            'error': 'No image file provided'
        }), 400
    
    file = request.files['image']
    
    if file.filename == '':
        return jsonify({
            'success': False,
            'error': 'No file selected'
        }), 400
    
    if not allowed_file(file.filename):
        return jsonify({
            'success': False,
            'error': f'Invalid file type. Allowed: {", ".join(ALLOWED_EXTENSIONS)}'
        }), 400
    
    # Check file size
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    if file_size > MAX_FILE_SIZE:
        return jsonify({
            'success': False,
            'error': f'File too large. Max size: {MAX_FILE_SIZE / 1024 / 1024}MB'
        }), 400
    file.seek(0)
    
    # Save temporarily and predict
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp:
            file.save(tmp.name)
            result = classifier.predict(tmp.name)
            os.unlink(tmp.name)
        
        return jsonify(result), 200 if result['success'] else 400
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/info', methods=['GET'])
def info():
    """Get model info"""
    return jsonify({
        'model_path': MODEL_PATH,
        'model_loaded': classifier is not None,
        'classes': classifier.class_names if classifier else None,
        'input_size': (224, 224),
        'max_file_size_mb': MAX_FILE_SIZE / 1024 / 1024
    })

if __name__ == '__main__':
    port = int(os.getenv('PYTHON_PORT', 5000))
    debug = os.getenv('FLASK_ENV', 'production') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)
