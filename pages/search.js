import { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import ResultCard from '../components/ResultCard';

export default function Search() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    // Load all data on mount
    useEffect(() => {
        handleSearch('');
    }, []);

    const handleSearch = async (query) => {
        setLoading(true);
        setError('');
        setHasSearched(true);

        try {
            const url = query
                ? `/api/search?q=${encodeURIComponent(query)}`
                : '/api/penduduk';

            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Search failed');
            }

            setResults(data.results || data.data || []);
        } catch (err) {
            console.error('Search error:', err);
            setError(err.message || 'Terjadi kesalahan saat mencari data');
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (deletedId) => {
        setResults(results.filter(r => r.id !== deletedId));
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">
                    Cari Data Penduduk
                </h1>
                <p className="text-gray-600 text-lg mb-8">
                    Temukan data penduduk berdasarkan nama
                </p>

                <SearchBar onSearch={handleSearch} loading={loading} />
            </div>

            {error && (
                <div className="max-w-2xl mx-auto mb-6">
                    <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                </div>
            )}

            <div className="mt-12">
                {loading && !hasSearched ? (
                    <div className="text-center py-12">
                        <div className="inline-block">
                            <svg className="animate-spin h-12 w-12 text-sky-blue" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <p className="mt-4 text-gray-600">Memuat data...</p>
                        </div>
                    </div>
                ) : results.length > 0 ? (
                    <>
                        <div className="text-center mb-6">
                            <p className="text-gray-600">
                                Ditemukan <span className="font-bold text-sky-blue">{results.length}</span> data penduduk
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {results.map((penduduk) => (
                                <ResultCard
                                    key={penduduk.id}
                                    penduduk={penduduk}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    </>
                ) : hasSearched ? (
                    <div className="text-center py-12">
                        <div className="inline-block bg-white rounded-lg shadow-md p-8">
                            <svg
                                className="mx-auto h-16 w-16 text-gray-400 mb-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                Tidak ada data ditemukan
                            </h3>
                            <p className="text-gray-500">
                                Coba gunakan kata kunci lain atau tambahkan data baru
                            </p>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
