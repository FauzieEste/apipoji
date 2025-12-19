# Penduduk App

Aplikasi manajemen data penduduk modern dengan Next.js 14 dan Vercel Blob Storage.

## 🌟 Fitur

- ✅ Input data penduduk (Nama, NIK, RT)
- ✅ Upload foto penduduk (JPG/PNG)
- ✅ Pencarian real-time berdasarkan nama
- ✅ Penyimpanan data di Vercel Blob (gratis)
- ✅ Responsive design (mobile & desktop)
- ✅ Tema sky-blue dengan background cloud aesthetic
- ✅ Font Poppins

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (Pages Router), React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Storage**: Vercel Blob (free tier)
- **Database**: JSON file di Vercel Blob
- **Deployment**: Vercel (free hosting)

## 📦 Instalasi

### 1. Clone atau Download Project

```bash
cd penduduk-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Vercel Blob

1. Buat akun di [Vercel](https://vercel.com) (gratis)
2. Buat Blob Store:
   - Login ke Vercel Dashboard
   - Pilih project Anda atau buat baru
   - Pergi ke **Storage** → **Create Database** → **Blob**
   - Copy token yang diberikan

### 4. Setup Environment Variables

Buat file `.env.local` di root project:

```env
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here
```

Ganti `your_vercel_blob_token_here` dengan token dari Vercel Blob.

### 5. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 🌐 Deploy ke Vercel

### Cara 1: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

### Cara 2: Via GitHub

1. Push code ke GitHub repository
2. Login ke [Vercel Dashboard](https://vercel.com/dashboard)
3. Klik **Add New** → **Project**
4. Import repository GitHub Anda
5. Tambahkan environment variable:
   - Key: `BLOB_READ_WRITE_TOKEN`
   - Value: Token Vercel Blob Anda
6. Klik **Deploy**

## 📁 Struktur Project

```
penduduk-app/
├── pages/
│   ├── index.js              # Halaman input data
│   ├── search.js             # Halaman pencarian
│   ├── _app.js               # App wrapper
│   ├── _document.js          # HTML document
│   └── api/
│       ├── upload.js         # API upload foto
│       ├── save.js           # API simpan data
│       ├── search.js         # API pencarian
│       └── penduduk.js       # API get all data
├── components/
│   ├── Navbar.js             # Navigation bar
│   ├── FormInput.js          # Form input penduduk
│   ├── SearchBar.js          # Search bar
│   └── ResultCard.js         # Card hasil pencarian
├── styles/
│   └── globals.css           # Global styles
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vercel.json
└── README.md
```

## 🎨 Fitur Detail

### 1. Input Data Penduduk

- Form dengan validasi
- Upload foto dengan preview
- Dropdown RT (01, 02, 03)
- Validasi NIK (16 digit)
- Loading state saat submit

### 2. Pencarian

- Real-time search
- Tampilan card dengan foto
- Filter berdasarkan nama
- Responsive grid layout

### 3. Storage

- Foto disimpan di Vercel Blob: `/uploads/rt{XX}/`
- Database JSON di Vercel Blob: `/data/penduduk.json`
- Auto-create file jika belum ada
- Append data baru tanpa overwrite

## 🔧 API Routes

### POST `/api/upload?rt={01|02|03}`

Upload foto penduduk.

**Request**: `multipart/form-data` dengan file

**Response**:
```json
{
  "success": true,
  "url": "https://...",
  "filename": "1234567890-photo.jpg",
  "path": "uploads/rt01/1234567890-photo.jpg"
}
```

### POST `/api/save`

Simpan data penduduk ke database.

**Request**:
```json
{
  "nama": "John Doe",
  "nik": "1234567890123456",
  "rt": "01",
  "photoUrl": "https://..."
}
```

**Response**:
```json
{
  "success": true,
  "message": "Data saved successfully",
  "data": { ... }
}
```

### GET `/api/search?q={query}`

Cari penduduk berdasarkan nama.

**Response**:
```json
{
  "success": true,
  "results": [...],
  "count": 5
}
```

### GET `/api/penduduk`

Ambil semua data penduduk.

**Response**:
```json
{
  "success": true,
  "data": [...],
  "count": 10
}
```

## 🎯 Catatan Penting

1. **Vercel Blob Free Tier**:
   - 500 MB storage
   - 100 GB bandwidth/bulan
   - Cukup untuk ratusan foto

2. **File Upload Limit**:
   - Max 5 MB per foto (bisa diubah di FormInput.js)
   - Format: JPG, PNG

3. **Database**:
   - JSON file, bukan database relational
   - Cocok untuk data kecil-menengah
   - Untuk data besar, pertimbangkan Vercel Postgres

## 🐛 Troubleshooting

### Error: "Upload failed"
- Pastikan `BLOB_READ_WRITE_TOKEN` sudah di-set
- Cek format file (hanya JPG/PNG)
- Cek ukuran file (max 5MB)

### Error: "Method not allowed"
- Pastikan menggunakan method yang benar (POST/GET)
- Cek vercel.json sudah ada

### Data tidak tersimpan
- Cek console browser untuk error
- Pastikan token Vercel Blob valid
- Cek network tab untuk response API

## 📝 License

MIT

## 👨‍💻 Author

Built with ❤️ using Next.js and Vercel
