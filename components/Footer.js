import { FaGithub, FaHeart } from 'react-icons/fa';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 py-6 mt-12">
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-gray-500 text-sm flex items-center gap-1">
                    <span>Dibuat dengan</span>
                    <FaHeart className="text-red-400 w-3 h-3" />
                    <span>oleh</span>
                    <span className="font-semibold text-gray-700">FauzieEste</span>
                </div>

                <a
                    href="https://github.com/FauzieEste/pemha-database"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors text-gray-700 text-sm font-medium border border-gray-200"
                >
                    <FaGithub className="w-5 h-5" />
                    <span>Source Code</span>
                </a>
            </div>
        </footer>
    );
}
