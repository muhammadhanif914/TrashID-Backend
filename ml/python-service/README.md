# 🧠 Trash Classification ML Service

Python Flask service untuk inference model Keras Trash Classification.

## Quick Start

### 1. Setup Environment

```bash
# Create virtual environment
python -m venv venv

# Activate
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure

```bash
# Copy .env.example
cp .env.example .env

# Edit .env jika perlu (default sudah OK)
```

### 3. Run

```bash
python app.py
```

You should see:
```
 * Running on http://0.0.0.0:5000
✓ Model loaded successfully from ../../model_trashid.keras
```

## API Endpoints

### POST `/predict`
Predict trash classification from image

**Request:**
```bash
curl -X POST http://localhost:5000/predict \
  -F "image=@image.jpg"
```

**Response:**
```json
{
  "success": true,
  "prediction": "Organik",
  "confidence": 0.9234,
  "probabilities": {
    "Anorganik": 0.0234,
    "Organik": 0.9234,
    "Residu": 0.0532
  }
}
```

### GET `/health`
Check service health status

```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "status": "ok",
  "model_loaded": true
}
```

### GET `/info`
Get model information

```bash
curl http://localhost:5000/info
```

## Configuration

Edit `.env`:

```env
FLASK_ENV=development          # development atau production
PYTHON_PORT=5000              # Port untuk Flask service
MODEL_PATH=../../model_trashid.keras  # Path ke model file
```

## Model Info

- **Input Size:** 224x224
- **Classes:** Anorganik, Organik, Residu
- **Model Type:** MobileNetV2 (Transfer Learning)
- **Framework:** TensorFlow 2.15 + Keras 3.0

## Troubleshooting

**Model not found:**
- Pastikan file `model_trashid.keras` ada
- Check path di `.env`

**Port already in use:**
- Change port di `.env` atau kill process yang menggunakan port 5000

**Import errors:**
- Reinstall dependencies: `pip install -r requirements.txt --force-reinstall`

## Development

```bash
# Run dengan auto-reload (debug mode)
python app.py

# Check model performance
python -c "from inference import TrashClassifier; c = TrashClassifier('../../model_trashid.keras')"
```

