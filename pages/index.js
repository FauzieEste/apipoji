import FormInput from '../components/FormInput';

export default function Home() {
    return (
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">
                    Sistem Data Penduduk
                </h1>
                <p className="text-gray-600 text-lg">
                    Kelola data penduduk dengan mudah dan aman
                </p>
            </div>

            <FormInput />


        </div>
    );
}
