# 🤖 Integrasi Model Trash Classification

Dokumentasi setup untuk mengintegrasikan model Keras Trash Classification ke dalam backend Express.

## 📋 Arsitektur

```
┌─────────────────────────────────────────────────────────┐
│                  Express.js Backend                     │
│  POST /api/classification (multer - upload image)      │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ FormData (axios)
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Python Flask ML Service                    │
│  POST /predict (receive image, return classification)  │
│                                                        │
│  - Load model Keras: model_trashid.keras              │
│  - Classes: Anorganik, Organik, Residu                │
│  - Input size: 224x224                                 │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Setup Python ML Service

### 1. Persiapan Environment

```bash
# Navigate ke folder Python service
cd ml/python-service

# Copy .env.example ke .env
cp .env.example .env

# Buat virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

> **Note**: Instalasi TensorFlow memerlukan waktu. Jika offline, download `.whl` files terlebih dahulu.

### 3. Pastikan Model File Ada

Model harus berada di:
```
model_trashid_fix/
├── model_trashid.keras     ← (Required)
├── model_trashid.h5        (Optional, backup)
├── ml/
│   └── python-service/
│       └── app.py
```

Jika file model tidak di lokasi root project, update path di `ml/python-service/.env`:
```env
MODEL_PATH=../../model_trashid.keras
```

### 4. Test Python Service

```bash
# Dari folder ml/python-service
python app.py
```

Anda akan melihat output seperti:
```
 * Running on http://0.0.0.0:5000
✓ Model loaded successfully from ../../model_trashid.keras
```

### 5. Test Endpoint (Optional)

```bash
# Terminal baru, test health endpoint
curl http://localhost:5000/health

# Output:
# {"status":"ok","model_loaded":true}
```

---

## 🔧 Setup Express Backend

### 1. Update Environment Variables

Buka `.env` di root backend:

```env
# ... existing config ...

# ML Service Configuration
ML_SERVICE_URL=http://localhost:5000
```

### 2. Verifikasi Dependencies

Pastikan `package.json` memiliki `axios` dan `form-data`:

```bash
npm install axios form-data
```

---

## ▶️ Menjalankan Sistem Lengkap

### Terminal 1: Python ML Service

```bash
cd ml/python-service
source venv/bin/activate  # atau venv\Scripts\activate di Windows
python app.py
```

Output:
```
 * Running on http://0.0.0.0:5000
✓ Model loaded successfully
```

### Terminal 2: Express Backend

```bash
npm run dev
# atau
npm start
```

Output:
```
Server is running on port 5000
```

---

## 📡 API Endpoints

### Express Backend

**POST `/api/classification`**
- Upload gambar untuk diklasifikasi
- Auth required: YES (JWT token)

**Request:**
```bash
curl -X POST http://localhost:5000/api/classification \
  -H "Authorization: Bearer <token>" \
  -F "image=@/path/to/image.jpg"
```

**Response:**
```json
{
  "success": true,
  "message": "Classification successful",
  "data": {
    "_id": "6749...",
    "result": "Organik",
    "label": "Organik",
    "confidence": 0.9234,
    "description": "Sampah organik seperti sisa makanan...",
    "probabilities": {
      "Anorganik": 0.0234,
      "Organik": 0.9234,
      "Residu": 0.0532
    },
    "classifiedAt": "2024-11-28T10:30:00.000Z"
  }
}
```

### Python ML Service

**POST `/predict`**
- Receive image, return classification

**GET `/health`**
- Check service status

**GET `/info`**
- Get model information

---

## ⚠️ Troubleshooting

### Error: "ML Service is unavailable"
✅ Pastikan Flask app berjalan di terminal 1
✅ Check port `5000` tidak di-use aplikasi lain
✅ Check firewall/network connectivity

### Error: "Model not found"
✅ Verify `model_trashid.keras` ada di lokasi yang benar
✅ Check path di `.env` di `ml/python-service/.env`
✅ Ensure model file bukan corrupt

### Error: "No image file provided"
✅ Pastikan upload dengan key `image`
✅ File type harus: jpg, jpeg, png, gif, jfif
✅ File size max 10MB

### Python Dependencies Error
✅ Update pip: `pip install --upgrade pip`
✅ Reinstall requirements: `pip install -r requirements.txt --force-reinstall`
✅ Check Python version >= 3.8

---

## 📦 Deployment (Production)

### Option 1: Docker (Recommended)

**Dockerfile untuk Flask Service** (di `ml/python-service/`):
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "app.py"]
```

Build & Run:
```bash
docker build -t trashid-ml-service .
docker run -p 5000:5000 -v /path/to/models:/app/models trashid-ml-service
```

### Option 2: PM2 (Node.js) + Systemd (Python)

**Python Service** - Create `/etc/systemd/system/trashid-ml.service`:
```ini
[Unit]
Description=TrashID ML Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/home/user/ml/python-service
Environment="PATH=/home/user/ml/python-service/venv/bin"
ExecStart=/home/user/ml/python-service/venv/bin/python app.py
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable trashid-ml
sudo systemctl start trashid-ml
```

---

## 🔍 Monitoring

Check service status:
```bash
# Health check
curl http://localhost:5000/health

# Model info
curl http://localhost:5000/info

# Express logs
npm run dev
```

---

## 📚 References

- [TensorFlow/Keras Documentation](https://www.tensorflow.org/api_docs)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Express.js Guide](https://expressjs.com/)
- [Axios HTTP Client](https://axios-http.com/)

---

## 💡 Tips

- ✅ Gunakan environment variable untuk konfigurasi URL
- ✅ Implement error handling & retry logic
- ✅ Cache model prediction untuk performa lebih baik
- ✅ Setup logging untuk monitoring
- ✅ Test dengan berbagai ukuran & format image
- ✅ Load test sebelum go to production

