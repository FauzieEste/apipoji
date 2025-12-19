import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function Navbar() {
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <h1 className="text-xl sm:text-2xl font-bold text-sky-blue">
                            ☁️ Penduduk App
                        </h1>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex space-x-4">
                        <Link
                            href="/"
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${router.pathname === '/'
                                    ? 'bg-sky-blue text-white'
                                    : 'text-gray-700 hover:bg-light-blue'
                                }`}
                        >
                            Input Data
                        </Link>
                        <Link
                            href="/search"
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${router.pathname === '/search'
                                    ? 'bg-sky-blue text-white'
                                    : 'text-gray-700 hover:bg-light-blue'
                                }`}
                        >
                            Cari Penduduk
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-lg text-gray-700 hover:bg-light-blue transition-colors"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden pb-4 pt-2 space-y-2">
                        <Link
                            href="/"
                            onClick={() => setMobileMenuOpen(false)}
                            className={`block px-4 py-3 rounded-lg font-medium transition-all duration-200 ${router.pathname === '/'
                                    ? 'bg-sky-blue text-white'
                                    : 'text-gray-700 hover:bg-light-blue'
                                }`}
                        >
                            📝 Input Data
                        </Link>
                        <Link
                            href="/search"
                            onClick={() => setMobileMenuOpen(false)}
                            className={`block px-4 py-3 rounded-lg font-medium transition-all duration-200 ${router.pathname === '/search'
                                    ? 'bg-sky-blue text-white'
                                    : 'text-gray-700 hover:bg-light-blue'
                                }`}
                        >
                            🔍 Cari Penduduk
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}
