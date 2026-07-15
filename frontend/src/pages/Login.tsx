import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Lock, Loader2, ArrowLeft } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(formData.username, formData.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login gagal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-8 relative">
        <button 
          onClick={() => navigate('/transparansi')}
          className="absolute top-4 left-4 md:top-6 md:left-6 text-gray-400 hover:text-emerald-600 transition-colors flex items-center gap-1 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Kembali</span>
        </button>

        <div className="text-center mb-6 md:mb-8 pt-6 sm:pt-0">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-2xl overflow-hidden bg-white shadow-md border border-slate-100 shrink-0">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover scale-[1.8]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-2 tracking-tight">SIMAD</h1>
          <p className="text-sm md:text-base text-slate-500">Sistem Informasi Manajemen Masjid</p>
        </div>

        {error && (
          <div className="mb-4 md:mb-6 p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Username atau email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 text-white py-2.5 md:py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2 text-sm md:text-base"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Memproses...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div className="mt-4 md:mt-6 text-center">
          <p className="text-sm md:text-base text-gray-600">
            <span className="text-sm text-slate-600">Belum punya akun?</span>
            <a href="/register" className="ml-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700">
              Daftar sekarang
            </a>
          </p>
        </div>

        {/* <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-200">
          <div className="text-xs md:text-sm text-gray-500 text-center">
            <p className="font-semibold mb-2">Demo Account:</p>
            <p>Admin: admin / admin123</p>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Login;
