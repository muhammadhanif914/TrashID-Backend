📋 CHECKLIST SETUP - Integrasi Model Trash Classification
============================================================

## ✅ STEP 1: Siapkan Model File

□ Copy file model dari project model-trashid ke backend:
  - Dari: d:\Semester6\PPL\Project akhir\model trashid fix\model_trashid.keras
  - Ke: D:\Semester6\PPL\Project akhir\TrashID-Backend\model_trashid.keras
  
  Atau create symlink/copy

## ✅ STEP 2: Setup Python ML Service

□ Buka folder: D:\Semester6\PPL\Project akhir\TrashID-Backend\ml\python-service

□ Create & activate virtual environment:
  ```
  python -m venv venv
  venv\Scripts\activate
  ```

□ Copy .env.example ke .env:
  ```
  copy .env.example .env
  ```

□ Install dependencies:
  ```
  pip install -r requirements.txt
  ```
  ⏱️ Proses ini bisa 5-10 menit (TensorFlow download)

□ Test Python service:
  ```
  python app.py
  ```
  ✓ Seharusnya output: "Model loaded successfully"

## ✅ STEP 3: Update Backend Express

□ Buka: D:\Semester6\PPL\Project akhir\TrashID-Backend\.env

□ Tambahkan (atau pastikan sudah ada):
  ```
  ML_SERVICE_URL=http://localhost:5000
  ```

□ Verify dependencies di package.json:
  - axios ✓
  - form-data ✓

□ Kalau belum ada:
  ```
  npm install axios form-data
  ```

## ✅ STEP 4: Test Sistem

□ Terminal 1 - Start Python service:
  ```
  cd ml/python-service
  venv\Scripts\activate
  python app.py
  ```
  ✓ Should see: "Running on http://0.0.0.0:5000"

□ Terminal 2 - Start Express backend:
  ```
  npm run dev
  ```
  ✓ Should see: "Server is running on port 5001"

□ Test dengan Postman/curl:
  ```
  POST http://localhost:5001/api/classification
  Headers: Authorization: Bearer <token>
  Body: form-data
    - image: (select image file)
  ```

## 🎯 Expected Response

```json
{
  "success": true,
  "message": "Classification successful",
  "data": {
    "result": "Organik",
    "confidence": 0.92,
    "probabilities": {
      "Anorganik": 0.05,
      "Organik": 0.92,
      "Residu": 0.03
    }
  }
}
```

## 🐛 Troubleshooting

❌ "ML Service is unavailable"
  → Pastikan Python Flask running di terminal 1
  → Check port 5000 tidak dipakai aplikasi lain

❌ "Model not found"
  → Pastikan model_trashid.keras ada di root backend folder
  → Check file bukan corrupt (size > 100MB)

❌ "Port already in use"
  → Change port di ml/python-service/.env
  → Atau: netstat -ano | findstr :5000 (Windows)

❌ Python dependencies error
  → pip install --upgrade pip
  → pip install -r requirements.txt --force-reinstall

## 📚 Documentation

- Full guide: ML_INTEGRATION_GUIDE.md
- Python service: ml/python-service/README.md
- Code flow: src/services/mlService.js → src/controllers/classificationController.js

## 🚀 File Structure

TrashID-Backend/
├── model_trashid.keras          ← [REQUIRED] Copy model file ke sini
├── .env                         ← Add ML_SERVICE_URL
├── src/
│   ├── services/mlService.js   ← [UPDATED] Service untuk call Python
│   ├── controllers/
│   │   └── classificationController.js  ← [UPDATED] Handle upload & classify
│   └── routes/classificationRoutes.js
└── ml/
    └── python-service/         ← [NEW] Python Flask service
        ├── app.py              ← Main Flask app
        ├── inference.py        ← Model inference logic
        ├── requirements.txt    ← Python dependencies
        ├── .env.example        ← Configuration template
        └── README.md           ← Quick start guide

---

💡 Tips:
✓ Keep both terminals running saat development
✓ Use Postman untuk test API
✓ Check logs di console untuk error details
✓ Model loading first time bisa 1-2 menit

Done! Sistem siap digunakan 🎉
