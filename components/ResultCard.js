import { useState } from 'react';

export default function ResultCard({ penduduk, onDelete }) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [pin, setPin] = useState(''); // NEW: PIN State
    const [error, setError] = useState(''); // NEW: Error State

    const handleDelete = async () => {
        if (!pin) {
            setError('Masukkan PIN terlebih dahulu');
            return;
        }

        setDeleting(true);
        setError('');

        try {
            const response = await fetch('/api/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: penduduk.id,
                    photoUrl: penduduk.photoUrl,
                    pin: pin // NEW: Send PIN
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Delete failed');
            }

            // Call parent callback to update UI
            if (onDelete) {
                onDelete(penduduk.id);
            }
            setShowDeleteConfirm(false);
            setPin(''); // Reset PIN
        } catch (error) {
            setError(error.message); // Show error in modal
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            <div className="card hover:scale-105">
                {/* ... existing card content ... */}
                <div className="flex flex-col items-center">
                    <div className="w-full h-48 mb-4 rounded-lg overflow-hidden shadow-lg border-2 border-sky-blue">
                        <img
                            src={penduduk.photoUrl}
                            alt={penduduk.nama}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
                        {penduduk.nama}
                    </h3>

                    <div className="w-full space-y-2 mt-4">
                        <div className="flex justify-between items-center p-2 bg-light-blue rounded-lg">
                            <span className="text-gray-600 font-medium text-sm">NIK:</span>
                            <span className="text-gray-800 font-semibold text-sm">{penduduk.nik}</span>
                        </div>

                        <div className="flex justify-between items-center p-2 bg-light-blue rounded-lg">
                            <span className="text-gray-600 font-medium text-sm">RT:</span>
                            <span className="text-sky-blue font-bold">RT {penduduk.rt}</span>
                        </div>

                        {penduduk.createdAt && (
                            <div className="text-center text-xs text-gray-500 mt-3">
                                Ditambahkan: {new Date(penduduk.createdAt).toLocaleDateString('id-ID')}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4 w-full">
                        <a
                            href={penduduk.photoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-1 no-underline"
                            title="Lihat/Download Foto"
                        >
                            📥 Download
                        </a>
                        <button
                            onClick={() => {
                                setShowDeleteConfirm(true);
                                setPin('');
                                setError('');
                            }}
                            className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-1"
                            title="Hapus Data"
                        >
                            🗑️ Hapus
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-2xl animate-fade-in">
                        <h3 className="text-xl font-bold mb-4 text-gray-800">Konfirmasi Hapus</h3>
                        <p className="mb-4 text-gray-700">
                            Yakin ingin menghapus data <strong>{penduduk.nama}</strong>?
                            <br />
                            <span className="text-sm text-red-600">Tindakan ini tidak dapat dibatalkan.</span>
                        </p>

                        {/* PIN Input */}
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Masukkan PIN Admin:</label>
                            <input
                                type="password"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                                placeholder="******"
                                autoFocus
                            />
                            {error && <p className="text-red-500 text-xs mt-1 font-semibold">{error}</p>}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={deleting}
                                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold transition-colors disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting || !pin}
                                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:bg-red-300"
                            >
                                {deleting ? 'Menghapus...' : 'Hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
