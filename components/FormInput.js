import { useState, useRef } from 'react';
import { FaCamera, FaImage, FaMagic } from 'react-icons/fa';
import dynamic from 'next/dynamic';
import { scanKTP } from '../lib/ktpOcr';

const ImageEditor = dynamic(() => import('./ImageEditor'), { ssr: false });

export default function FormInput() {
    const [uploadedPhotos, setUploadedPhotos] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [uploadResults, setUploadResults] = useState(null);
    const [processing, setProcessing] = useState(false);

    // Editor State
    const [editorOpen, setEditorOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState(null);
    const [editingPhotoId, setEditingPhotoId] = useState(null);
    const [scanningPhotoId, setScanningPhotoId] = useState(null);
    const cameraInputRef = useRef(null);
    const galleryInputRef = useRef(null);


    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Validation
        const validFiles = [];
        for (const file of files) {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                setMessage({ type: 'error', text: `File ${file.name} bukan JPG/PNG/WebP!` });
                continue;
            }
            if (file.size > 5 * 1024 * 1024) {
                setMessage({ type: 'error', text: `File ${file.name} terlalu besar (max 5MB)!` });
                continue;
            }
            validFiles.push(file);
        }

        if (validFiles.length === 0) return;

        setUploading(true);
        setMessage({ type: '', text: '' });

        // Logic: If SINGLE file -> Open Editor
        // If MULTIPLE files -> Add all directly (skip editor)
        if (validFiles.length === 1) {
            const file = validFiles[0];
            const reader = new FileReader();
            reader.onload = () => {
                setCurrentImage(reader.result);
                setEditingPhotoId(null); // New photo
                setEditorOpen(true);
                // We don't add to uploadedPhotos yet; wait for editor save
                setUploading(false);
            };
            reader.readAsDataURL(file);
        } else {
            // Process multiple files
            const newPhotos = [];
            for (const file of validFiles) {
                try {
                    const reader = new FileReader();
                    const preview = await new Promise((resolve) => {
                        reader.onloadend = () => resolve(reader.result);
                        reader.readAsDataURL(file);
                    });

                    newPhotos.push({
                        id: Date.now() + Math.random(),
                        file,
                        preview,
                        uploaded: false,
                        uploading: false,
                        photoUrl: null,
                        formData: {
                            nama: '',
                            nik: '',
                            rt: '01',
                        },
                        saved: false,
                        saving: false,
                    });
                } catch (error) {
                    console.error('Error reading file:', error);
                }
            }

            setUploadedPhotos(prev => [...prev, ...newPhotos]);
            setUploading(false);
            setMessage({ type: 'success', text: `${validFiles.length} foto berhasil ditambahkan!` });
        }

        // Reset input
        e.target.value = '';
    };

    const handleFormChange = (photoId, field, value) => {
        setUploadedPhotos(uploadedPhotos.map(photo => {
            if (photo.id === photoId) {
                return {
                    ...photo,
                    formData: {
                        ...photo.formData,
                        [field]: value,
                    },
                };
            }
            return photo;
        }));
    };

    const handleUploadPhoto = async (photoId) => {
        const photo = uploadedPhotos.find(p => p.id === photoId);
        if (!photo || photo.uploaded) return;

        setUploadedPhotos(uploadedPhotos.map(p =>
            p.id === photoId ? { ...p, uploading: true } : p
        ));

        try {
            const formData = new FormData();
            formData.append('file', photo.file);

            const uploadRes = await fetch(`/api/upload?rt=${photo.formData.rt}`, {
                method: 'POST',
                body: formData,
            });

            const uploadData = await uploadRes.json();

            if (!uploadRes.ok) {
                throw new Error(uploadData.error || 'Upload failed');
            }

            setUploadedPhotos(uploadedPhotos.map(p =>
                p.id === photoId
                    ? { ...p, uploaded: true, uploading: false, photoUrl: uploadData.url }
                    : p
            ));

            setMessage({ type: 'success', text: 'Foto berhasil diupload!' });
        } catch (error) {
            console.error('Upload error:', error);
            setUploadedPhotos(uploadedPhotos.map(p =>
                p.id === photoId ? { ...p, uploading: false } : p
            ));
            setMessage({ type: 'error', text: error.message || 'Upload gagal!' });
        }
    };

    const handleEditPhoto = (photoId) => {
        const photo = uploadedPhotos.find(p => p.id === photoId);
        if (!photo) return;
        setCurrentImage(photo.preview);
        setEditingPhotoId(photoId);
        setEditorOpen(true);
    };

    const handleSaveData = async (photoId) => {
        const photo = uploadedPhotos.find(p => p.id === photoId);
        if (!photo || !photo.uploaded || photo.saved) return;

        // Validation
        if (!photo.formData.nama.trim()) {
            setMessage({ type: 'error', text: 'Nama harus diisi!' });
            return;
        }

        setUploadedPhotos(uploadedPhotos.map(p =>
            p.id === photoId ? { ...p, saving: true } : p
        ));

        try {
            const saveRes = await fetch('/api/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nama: photo.formData.nama,
                    nik: photo.formData.nik || '-', // Optional NIK
                    rt: photo.formData.rt,
                    photoUrl: photo.photoUrl,
                }),
            });

            const saveData = await saveRes.json();

            if (!saveRes.ok) {
                throw new Error(saveData.error || 'Save failed');
            }

            setUploadedPhotos(uploadedPhotos.map(p =>
                p.id === photoId ? { ...p, saved: true, saving: false } : p
            ));

            setMessage({ type: 'success', text: 'Data berhasil disimpan!' });
        } catch (error) {
            console.error('Save error:', error);
            setUploadedPhotos(uploadedPhotos.map(p =>
                p.id === photoId ? { ...p, saving: false } : p
            ));
            setMessage({ type: 'error', text: error.message || 'Simpan data gagal!' });
        }
    };

    const handleRemovePhoto = (photoId) => {
        setUploadedPhotos(uploadedPhotos.filter(p => p.id !== photoId));
    };

    const handleScanKTP = async (photoId) => {
        const photo = uploadedPhotos.find(p => p.id === photoId);
        if (!photo) return;

        setScanningPhotoId(photoId);
        setMessage({ type: '', text: '' });

        try {
            const result = await scanKTP(photo.preview);

            // Update form data with OCR results
            setUploadedPhotos(prev => prev.map(p => {
                if (p.id === photoId) {
                    return {
                        ...p,
                        formData: {
                            ...p.formData,
                            nama: result.nama || p.formData.nama,
                            nik: result.nik || p.formData.nik,
                            rt: result.rt || p.formData.rt,
                        },
                    };
                }
                return p;
            }));

            // Show result message
            const foundFields = [];
            if (result.nama) foundFields.push('Nama');
            if (result.nik) foundFields.push('NIK');
            if (result.rt) foundFields.push('RT');

            if (foundFields.length > 0) {
                setMessage({
                    type: 'success',
                    text: `Berhasil mendeteksi: ${foundFields.join(', ')}. Silakan periksa dan edit jika perlu.`
                });
            } else {
                setMessage({
                    type: 'error',
                    text: 'Tidak dapat mendeteksi data dari foto. Pastikan foto KTP jelas dan coba lagi.'
                });
            }
        } catch (error) {
            console.error('Scan error:', error);
            setMessage({ type: 'error', text: error.message || 'Gagal scan KTP!' });
        } finally {
            setScanningPhotoId(null);
        }
    };

    const handleUploadAndSaveAll = async () => {
        // Validate all photos have required data
        const invalidPhotos = uploadedPhotos.filter(p => !p.formData.nama.trim());
        if (invalidPhotos.length > 0) {
            setMessage({ type: 'error', text: 'Semua foto harus memiliki nama!' });
            return;
        }

        setProcessing(true);
        setMessage({ type: '', text: '' });

        const results = {
            total: uploadedPhotos.length,
            success: [],
            failed: []
        };

        for (const photo of uploadedPhotos) {
            try {
                // Step 1: Upload photo if not already uploaded
                let photoUrl = photo.photoUrl;
                if (!photo.uploaded) {
                    setUploadedPhotos(prev => prev.map(p =>
                        p.id === photo.id ? { ...p, uploading: true } : p
                    ));

                    const formData = new FormData();
                    formData.append('file', photo.file);

                    const uploadRes = await fetch(`/api/upload?rt=${photo.formData.rt}`, {
                        method: 'POST',
                        body: formData,
                    });

                    const uploadData = await uploadRes.json();
                    if (!uploadRes.ok) {
                        throw new Error(uploadData.error || 'Upload failed');
                    }

                    photoUrl = uploadData.url;

                    setUploadedPhotos(prev => prev.map(p =>
                        p.id === photo.id
                            ? { ...p, uploaded: true, uploading: false, photoUrl }
                            : p
                    ));
                }

                // Step 2: Save data to database
                setUploadedPhotos(prev => prev.map(p =>
                    p.id === photo.id ? { ...p, saving: true } : p
                ));

                const saveRes = await fetch('/api/save', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        nama: photo.formData.nama,
                        nik: photo.formData.nik || '-',
                        rt: photo.formData.rt,
                        photoUrl: photoUrl,
                    }),
                });

                const saveData = await saveRes.json();
                if (!saveRes.ok) {
                    throw new Error(saveData.error || 'Save failed');
                }

                setUploadedPhotos(prev => prev.map(p =>
                    p.id === photo.id ? { ...p, saved: true, saving: false } : p
                ));

                results.success.push({
                    nama: saveData.data.nama,
                    original: photo.formData.nama
                });

            } catch (error) {
                console.error('Upload/Save error:', error);
                setUploadedPhotos(prev => prev.map(p =>
                    p.id === photo.id ? { ...p, uploading: false, saving: false } : p
                ));
                results.failed.push({
                    nama: photo.formData.nama,
                    error: error.message
                });
            }
        }

        setProcessing(false);
        setUploadResults(results);

        // Clear uploaded photos if all succeeded
        if (results.success.length === results.total) {
            setUploadedPhotos([]);
        }
    };

    const handleEditorSave = (blob) => {
        if (!blob) return;

        const file = new File([blob], "edited_image.jpg", { type: "image/jpeg" });

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            if (editingPhotoId) {
                // Update existing photo
                setUploadedPhotos(prev => prev.map(p =>
                    p.id === editingPhotoId
                        ? { ...p, file, preview: reader.result, uploaded: false, photoUrl: null }
                        : p
                ));
                setEditingPhotoId(null);
                setMessage({ type: 'success', text: 'Foto berhasil diedit!' });
            } else {
                // Add new photo
                const newPhoto = {
                    id: Date.now() + Math.random(),
                    file,
                    preview: reader.result,
                    uploaded: false,
                    uploading: false,
                    photoUrl: null,
                    formData: {
                        nama: '',
                        nik: '',
                        rt: '01',
                    },
                    saved: false,
                    saving: false,
                };
                setUploadedPhotos(prev => [...prev, newPhoto]);
                setMessage({ type: 'success', text: 'Foto berhasil ditambahkan!' });
            }

            setEditorOpen(false);
            setCurrentImage(null);

        };
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="card mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Upload Foto KTP</h2>

                {message.text && (
                    <div
                        className={`mb-4 p-4 rounded-lg ${message.type === 'success'
                            ? 'bg-green-100 text-green-700 border border-green-300'
                            : 'bg-red-100 text-red-700 border border-red-300'
                            }`}
                    >
                        {message.text}
                    </div>
                )}

                <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-3 text-center">
                        Ambil Foto atau Pilih dari Galeri
                    </label>

                    {/* Camera Input (Single, Capture) */}
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileSelect}
                        className="hidden"
                        ref={cameraInputRef}
                    />

                    {/* Gallery Input (Multiple, No Capture) */}
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        ref={galleryInputRef}
                    />

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => galleryInputRef.current.click()}
                            disabled={uploading}
                            className="flex flex-col items-center justify-center p-6 bg-white border-2 border-dashed border-sky-300 rounded-xl hover:bg-sky-50 transition-all group w-40 h-40"
                        >
                            <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <FaImage className="w-8 h-8 text-sky-500" />
                            </div>
                            <span className="font-semibold text-gray-600 group-hover:text-sky-600">Galeri</span>
                            <span className="text-xs text-gray-400 mt-1">Multi-Foto</span>
                        </button>

                        <button
                            onClick={() => cameraInputRef.current.click()}
                            disabled={uploading}
                            className="flex flex-col items-center justify-center p-6 bg-white border-2 border-dashed border-sky-300 rounded-xl hover:bg-sky-50 transition-all group w-40 h-40"
                        >
                            <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <FaCamera className="w-8 h-8 text-sky-500" />
                            </div>
                            <span className="font-semibold text-gray-600 group-hover:text-sky-600">Kamera</span>
                            <span className="text-xs text-gray-400 mt-1">Ambil Foto</span>
                        </button>
                    </div>

                    <p className="text-sm text-gray-500 mt-4 text-center">
                        Foto kamera akan dibuka di editor. Foto galeri langsung ditambah.
                    </p>
                </div>


                {uploadedPhotos.length > 0 && (
                    <button
                        onClick={handleUploadAndSaveAll}
                        disabled={processing}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {processing ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Memproses...
                            </span>
                        ) : (
                            `Upload & Simpan Semua (${uploadedPhotos.length} foto)`
                        )}
                    </button>
                )}
            </div>

            {/* Photo Cards */}
            <div className="space-y-6">
                {uploadedPhotos.map((photo) => (
                    <div key={photo.id} className="card">
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Photo Preview */}
                            <div>
                                <div className="relative">
                                    <img
                                        src={photo.preview}
                                        alt="Preview"
                                        className="w-full h-64 object-cover rounded-lg shadow-md"
                                    />
                                    {photo.uploaded && (
                                        <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                            ✓ Uploaded
                                        </div>
                                    )}
                                    {photo.saved && (
                                        <div className="absolute top-2 left-2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                            ✓ Saved
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 flex gap-2">
                                    {!photo.uploaded && (
                                        <button
                                            onClick={() => handleEditPhoto(photo.id)}
                                            className="btn-primary flex-1 bg-yellow-500 hover:bg-yellow-600 border-yellow-500 text-white"
                                        >
                                            Edit Foto
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleRemovePhoto(photo.id)}
                                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
                                    >
                                        Hapus
                                    </button>
                                </div>

                                {/* Scan Button */}
                                {!photo.saved && (
                                    <button
                                        onClick={() => handleScanKTP(photo.id)}
                                        disabled={scanningPhotoId === photo.id}
                                        className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {scanningPhotoId === photo.id ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                <span>Scanning...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FaMagic className="w-5 h-5" />
                                                <span>Scan Otomatis</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                            {/* Form Data */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-4">
                                    Data Penduduk
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Nama Lengkap <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={photo.formData.nama}
                                            onChange={(e) => handleFormChange(photo.id, 'nama', e.target.value)}
                                            className="input-field"
                                            placeholder="Masukkan nama lengkap"
                                            disabled={photo.saved}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            NIK <span className="text-gray-400 text-sm">(opsional)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={photo.formData.nik}
                                            onChange={(e) => handleFormChange(photo.id, 'nik', e.target.value)}
                                            className="input-field"
                                            placeholder="Masukkan NIK (16 digit)"
                                            maxLength="16"
                                            disabled={photo.saved}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            RT <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={photo.formData.rt}
                                            onChange={(e) => handleFormChange(photo.id, 'rt', e.target.value)}
                                            className="input-field"
                                            disabled={photo.saved || photo.uploaded}
                                        >
                                            <option value="01">RT 01</option>
                                            <option value="02">RT 02</option>
                                            <option value="03">RT 03</option>
                                        </select>
                                        {photo.uploaded && (
                                            <p className="text-sm text-gray-500 mt-1">
                                                RT tidak bisa diubah setelah foto diupload
                                            </p>
                                        )}
                                    </div>

                                    {photo.uploaded && !photo.saved && (
                                        <button
                                            onClick={() => handleSaveData(photo.id)}
                                            disabled={photo.saving}
                                            className="btn-primary w-full disabled:opacity-50"
                                        >
                                            {photo.saving ? (
                                                <span className="flex items-center justify-center">
                                                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    Menyimpan...
                                                </span>
                                            ) : (
                                                'Simpan Data'
                                            )}
                                        </button>
                                    )}

                                    {photo.saved && (
                                        <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg text-center font-semibold">
                                            ✓ Data Tersimpan
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>



            {/* Result Modal */}
            {uploadResults && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
                        <h3 className="text-2xl font-bold mb-4 text-gray-800">Hasil Upload & Simpan</h3>

                        <div className="mb-6 space-y-2">
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <span className="text-lg font-medium text-gray-700">✅ Berhasil</span>
                                <span className="text-2xl font-bold text-green-600">{uploadResults.success.length}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                <span className="text-lg font-medium text-gray-700">❌ Gagal</span>
                                <span className="text-2xl font-bold text-red-600">{uploadResults.failed.length}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <span className="text-lg font-medium text-gray-700">📊 Total</span>
                                <span className="text-2xl font-bold text-blue-600">{uploadResults.total}</span>
                            </div>
                        </div>

                        {uploadResults.success.length > 0 && (
                            <div className="mb-4">
                                <h4 className="font-semibold text-green-700 mb-2 text-lg">Data Berhasil Disimpan:</h4>
                                <ul className="space-y-2">
                                    {uploadResults.success.map((item, idx) => (
                                        <li key={idx} className="text-sm bg-green-50 p-2 rounded border-l-4 border-green-500">
                                            <span className="text-green-700 font-medium">✓ {item.nama}</span>
                                            {item.nama !== item.original && (
                                                <span className="text-gray-500 text-xs block ml-4">
                                                    (nama asli: {item.original})
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {uploadResults.failed.length > 0 && (
                            <div className="mb-4">
                                <h4 className="font-semibold text-red-700 mb-2 text-lg">Data Gagal:</h4>
                                <ul className="space-y-2">
                                    {uploadResults.failed.map((item, idx) => (
                                        <li key={idx} className="text-sm bg-red-50 p-2 rounded border-l-4 border-red-500">
                                            <span className="text-red-700 font-medium">✗ {item.nama}</span>
                                            <span className="text-red-600 text-xs block ml-4">
                                                Error: {item.error}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <button
                            onClick={() => setUploadResults(null)}
                            className="btn-primary w-full mt-4"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}

            {editorOpen && (
                <ImageEditor
                    image={currentImage}
                    onSave={handleEditorSave}
                    onCancel={() => setEditorOpen(false)}
                />
            )}
        </div>

    );
}
