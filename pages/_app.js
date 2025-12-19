import '../styles/globals.css';
import Navbar from '../components/Navbar';
import Head from 'next/head';
import Footer from '../components/Footer';

export default function App({ Component, pageProps }) {
    return (
        <>
            <Head>
                <title>Penduduk App - Sistem Manajemen Data Penduduk</title>
                <meta name="description" content="Aplikasi manajemen data penduduk dengan Next.js dan Vercel Blob" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow py-8 px-4">
                    <Component {...pageProps} />
                </main>
                <Footer />
            </div>
        </>
    );
}
