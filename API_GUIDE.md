# Panduan Integrasi API & UX (Frontend Guide)

Agar _User Experience_ (UX) di sisi _frontend_ (Mobile/Web) rapi, jangan merender UI secara langsung sebelum data API siap. Gunakan arsitektur _State Management_ (Loading, Success, Error).

Berikut adalah standar cara memanggil API Backend TrashID yang terstruktur.

## 1. Arsitektur State di Frontend

Setiap kali melakukan HTTP Request (Hit API), frontend wajib memiliki 3 _state_ (kondisi):

- **`isLoading`** (boolean): Aktifkan animasi _spinner_ / _skeleton loading_ saat merequest API.
- **`data`** (object/array): Tempat menyimpan hasil balikan API jika sukses.
- **`error`** (string): Menyimpan pesan error dari backend jika validasi gagal/server mati.

## 2. Standar Respons Kesalahan & Kesuksesan Backend

Backend kita sudah dirancang mengembalikan format JSON yang konsisten:
**Jika Sukses:**

```json
{
  "status": "success",
  "message": "Berhasil mengambil laporan",
  "data": [ ... ]
}
```

**Jika Gagal:**

```json
{
  "status": "error",
  "message": "Pastikan format gambar benar"
}
```

## 3. Contoh Logika Hit API (Javascript / React / Axios Pattern)

Ini adalah contoh rapi bagaimana frontend memanggil API (Tanpa merender langsung):

```javascript
// utils/api.js di Frontend
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 5000, // UX: Jangan biarkan user nunggu selamanya
});

// Interceptor: Otomatis sisipkan JWT Token tiap kali request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

**Di Halaman UI (Contoh React/Flutter logic):**

```javascript
import { useState, useEffect } from "react";
import api from "../utils/api";

const LaporanTPU = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // UX 1: Default loading true
  const [errorMsg, setErrorMsg] = useState("");

  const fetchReports = async () => {
    setIsLoading(true); // Mulai loading
    setErrorMsg("");

    try {
      const response = await api.get("/report");
      // UX 2: Render data
      setReports(response.data.data);
    } catch (error) {
      // UX 3: Tangani & Render Error rapi, hindari aplikasi crash
      const message =
        error.response?.data?.message || "Terjadi kesalahan jaringan";
      setErrorMsg(message);
    } finally {
      // UX 4: Matikan loading apapun hasil akhirnya
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // ====== KONDISI RENDER UX ======
  // 1. Jangan render tabel langsung, tampilkan SHIMMER / SPINNER
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // 2. Render Pesan Error & Tombol Coba Lagi (Fitur Graceful Degradation)
  if (errorMsg) {
    return (
      <div className="error-state">
        <p>{errorMsg}</p>
        <button onClick={fetchReports}>Coba Lagi</button>
      </div>
    );
  }

  // 3. Render Data Aktual
  return (
    <div className="container">
      {reports.map((report) => (
        <ReportCard key={report._id} data={report} />
      ))}
    </div>
  );
};
```

## 4. Keuntungan Pola Ini (Dampak UX)

1. **Tidak "Nge-Blank"**: Saat transisi halaman, layar user tidak putih kosong, ada _Progress Indicator_.
2. **"Graceful Error"**: Kalau server mati / internet user putus, mereka tidak dilempar aplikasi _Not Responding_, tapi muncul tulisan "Gagal memuat, Coba Lagi".
3. **Otomatisasi Auth**: Frontend tidak perlu manual menulis `Token: Bearer...` berulang-ulang berkat adanya sistem _API Interceptor_.
4. **Konsistensi Struktur**: Terbaca rapi, aman dari manipulasi State balita.
