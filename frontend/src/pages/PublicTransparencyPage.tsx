import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Building2, CheckCircle2, MapPin, Wallet, TrendingUp, TrendingDown, Loader2, ArrowRight, BarChart3, Info, Shield, Sparkles } from 'lucide-react';
import api from '../services/api';

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
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  useEffect(() => {
    const fetchMasjids = async () => {
      try {
        const res = await api.get('/public/masjids');
        setMasjids(res.data?.data || []);
      } catch (err) {
        console.error('Error fetching masjids:', err);
        setError('Gagal memuat daftar masjid.');
      } finally {
        setLoading(false);
      }
    };
    fetchMasjids();
  }, []);

  const filteredMasjids = useMemo(() => {
    if (!search) return masjids;
    return masjids.filter(m =>
      m.nama_masjid.toLowerCase().includes(search.toLowerCase()) ||
      m.alamat.toLowerCase().includes(search.toLowerCase())
    );
  }, [masjids, search]);

  const loadBalance = async (id: number) => {
    setSelectedId(id);
    setLoadingBalance(true);
    setBalance(null);
    try {
      const res = await api.get(`/public/balance/${id}`);
      setBalance(res.data?.data || null);
    } catch (err) {
      console.error('Error fetching balance:', err);
      setBalance(null);
    } finally {
      setLoadingBalance(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero / Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">ISAK</div>
              <div>
                <p className="text-xs text-slate-500">Transparansi Keuangan Masjid</p>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Akses Publik Laporan Ringkas</h1>
              </div>
            </div>
            <Link to="/masuk" className="hidden md:flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-sm">
              <Shield className="w-4 h-4" /> Masuk Pengurus
            </Link>
          </div>
          <div className="md:hidden flex">
            <Link to="/masuk" className="w-full flex justify-center items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-sm mb-2">
              <Shield className="w-4 h-4" /> Masuk Pengurus
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
              <Shield className="w-8 h-8 text-emerald-600" />
              <div>
                <p className="text-xs text-emerald-700">Standar ISAK 35</p>
                <p className="text-sm font-semibold text-emerald-900">Akuntabel & Teruji</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-xs text-blue-700">Laporan Ringkas</p>
                <p className="text-sm font-semibold text-blue-900">Saldo & Periode</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-amber-600" />
              <div>
                <p className="text-xs text-amber-700">Tanpa Login</p>
                <p className="text-sm font-semibold text-amber-900">Akses Publik</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center gap-3">
              <Info className="w-8 h-8 text-emerald-300" />
              <div>
                <p className="text-xs text-slate-300">Klik untuk detail</p>
                <p className="text-sm font-semibold">Lihat halaman masjid</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search + Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari masjid berdasarkan nama atau alamat..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-800"
              />
            </div>
            <div className="text-sm text-slate-500">Total: <span className="font-semibold text-slate-700">{masjids.length}</span> masjid terdaftar</div>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">{error}</div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMasjids.map(m => (
              <div key={m.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-lg truncate">{m.nama_masjid}</h3>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-sm text-slate-500 flex items-center gap-1"><MapPin className="w-4 h-4" /> {m.alamat}</p>
                  </div>
                </div>

                {/* Summary block */}
                {selectedId === m.id ? (
                  <div className="rounded-xl border border-slate-100 p-3 bg-slate-50">
                    {loadingBalance && (
                      <div className="flex items-center gap-2 text-slate-500 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Memuat ringkasan...</div>
                    )}
                    {!loadingBalance && balance && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-500">Saldo Kas</span>
                          <span className="text-lg font-bold text-slate-900">{formatIDR(balance.saldo_akhir)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>Periode</span>
                          <span className="font-semibold text-slate-700">{balance.periode}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4 text-emerald-600" /> Pemasukan terhimpun
                          </div>
                          <div className="flex items-center gap-1 justify-end">
                            <TrendingDown className="w-4 h-4 text-red-500" /> Pengeluaran tercatat
                          </div>
                        </div>
                        <div className="flex gap-2 flex-col sm:flex-row">
                          <Link
                            to={`/kas/${m.id}`}
                            className="flex-1 flex items-center justify-between bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors"
                          >
                            Lihat halaman kas
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    )}
                    {!loadingBalance && !balance && (
                      <p className="text-sm text-slate-500">Ringkasan belum tersedia.</p>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => loadBalance(m.id)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-lg w-fit transition-colors"
                  >
                    <Wallet className="w-4 h-4" /> Lihat ringkasan kas
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && !error && filteredMasjids.length === 0 && (
          <div className="text-center text-slate-500 py-12">Masjid tidak ditemukan untuk kata kunci tersebut.</div>
        )}
      </div>
    </div>
  );
};

export default PublicTransparencyPage;
