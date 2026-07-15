import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, CheckCircle2, MapPin, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import api from '../services/api';
import PrayerTimes from '../components/PrayerTimes';

interface MasjidItem {
  id: number;
  nama_masjid: string;
  alamat: string;
}

interface BalanceData {
  nama_masjid: string;
  alamat: string;
  saldo_akhir: number;
  periode: string;
}

const formatIDR = (val: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0);

const PublicTransparencyPage = () => {
  const [masjids, setMasjids] = useState<MasjidItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/public/masjids');
        const data = res.data?.data || [];
        setMasjids(data);
        if (data.length > 0) {
          setLoadingBalance(true);
          try {
            const balanceRes = await api.get(`/public/balance/${data[0].id}`);
            setBalance(balanceRes.data?.data || null);
          } catch (err) {
            console.error('Error fetching balance:', err);
          } finally {
            setLoadingBalance(false);
          }
        }
      } catch (err) {
        console.error('Error fetching masjids:', err);
        setError('Gagal memuat daftar masjid.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  return (
    <div className="min-h-screen relative">
      {/* Global Background */}
      <div className="fixed inset-0 z-0">
        <img src="/bg.png" alt="Background Masjid" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-slate-100/90"></div>
      </div>

      {/* Main Content Wrapper */}
      <div className="relative z-10">
        {/* Hero / Header */}
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-10 md:py-12 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-white shadow-md border border-slate-100 flex items-center justify-center shrink-0">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover scale-[1.8]" />
              </div>
              <div>
                <p className="text-sm md:text-base text-emerald-600 font-semibold tracking-wide uppercase">Transparansi Keuangan</p>
                <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mt-1">Masjid Agung Sultan Alauddin</h1>
              </div>
            </div>
            <Link to="/masuk" className="hidden md:flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors shadow-md">
              Masuk
            </Link>
          </div>
          <div className="md:hidden flex mt-4">
            <Link to="/masuk" className="w-full flex justify-center items-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-xl font-semibold hover:bg-slate-800 transition-colors shadow-md">
              Masuk
            </Link>
          </div>
        </div>
      </div>

      {/* Search + Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        <PrayerTimes />

        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="loader"></div>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">{error}</div>
        )}

        {!loading && !error && (
          <div className="flex flex-col">
            {masjids.slice(0, 1).map(m => (
              <div key={m.id} className="bg-white border border-slate-200 rounded-2xl p-5 md:p-8 shadow-sm flex flex-col gap-6">
                <div className="flex items-start gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-slate-900 text-2xl md:text-4xl truncate">{m.nama_masjid}</h3>
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                    </div>
                    <p className="text-base md:text-lg text-slate-500 flex items-center gap-2 mt-2"><MapPin className="w-5 h-5 shrink-0" /> {m.alamat}</p>
                  </div>
                </div>

                {/* Summary block */}
                <div className="rounded-2xl border border-slate-200 p-6 md:p-8 bg-slate-50">
                  {loadingBalance && (
                    <div className="flex items-center justify-center gap-3 text-slate-500 py-8"><div className="loader"></div> <span className="text-lg">Memuat ringkasan...</span></div>
                  )}
                  {!loadingBalance && balance && (
                    <div className="space-y-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <span className="text-lg md:text-xl text-slate-500 font-medium">Saldo Kas Saat Ini</span>
                        <span className="text-3xl md:text-5xl font-extrabold text-emerald-600 tracking-tight">{formatIDR(balance.saldo_akhir)}</span>
                      </div>
                      <div className="flex items-center justify-between text-base md:text-lg text-slate-500 border-b border-slate-200 pb-6">
                        <span>Periode Laporan</span>
                        <span className="font-semibold text-slate-700 bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-sm">{balance.periode}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-100">
                          <TrendingUp className="w-6 h-6" /> 
                          <span className="font-medium text-lg">Pemasukan terhimpun</span>
                        </div>
                        <div className="flex items-center gap-3 bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 md:justify-end">
                          <TrendingDown className="w-6 h-6" /> 
                          <span className="font-medium text-lg">Pengeluaran tercatat</span>
                        </div>
                      </div>

                      <div className="pt-4">
                        <Link
                          to={`/kas/${m.id}`}
                          className="w-full flex items-center justify-center gap-3 bg-emerald-600 text-white px-6 py-4 rounded-xl text-lg font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                        >
                          Detail
                        </Link>
                      </div>
                    </div>
                  )}
                  {!loadingBalance && !balance && (
                    <p className="text-lg text-slate-500 text-center py-8">Ringkasan kas belum tersedia untuk masjid ini.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && masjids.length === 0 && (
          <div className="text-center text-slate-500 py-12">Masjid belum terdaftar.</div>
        )}
      </div>
    </div>
  </div>
  );
};

export default PublicTransparencyPage;
