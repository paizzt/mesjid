import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, Wallet, TrendingUp, TrendingDown, Loader2, MapPin, Calendar, Shield, ArrowLeft, Target, PieChart, ChevronLeft, ChevronRight, ArrowRight, FileText } from 'lucide-react';
import { Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart as RePieChart, Pie } from 'recharts';
import api from '../services/api';

interface MasjidInfo {
  id: number;
  nama_masjid: string;
  alamat: string;
}

interface Transaction {
  id: number;
  keterangan: string;
  jumlah: number;
  tipe: string;
  tanggal: string;
  kategori: string;
  isRestricted: boolean;
}

interface ExpenseCategory {
  name: string;
  value: number;
}

interface BalanceData {
  nama_masjid: string;
  alamat: string;
  saldo_awal: number;
  saldo_akhir: number;
  periode: string;
  period_income: number;
  period_expense: number;
  surplus: number;
  unrestricted_funds: number;
  restricted_funds: number;
  total_assets: number;
  recent_transactions: Transaction[];
  expense_categories: ExpenseCategory[];
  year: number;
  month: number;
}

const formatIDR = (val: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0);

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
};

const COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6'];

const PublicKasPage = () => {
  const { masjidId } = useParams();
  const [masjid, setMasjid] = useState<MasjidInfo | null>(null);
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const loadData = async () => {
    if (!masjidId) return;
    setLoading(true);
    setError('');
    try {
      const [detailRes, balanceRes] = await Promise.all([
        api.get(`/public/masjid/${masjidId}`),
        api.get(`/public/balance/${masjidId}?year=${selectedYear}&month=${selectedMonth}`),
      ]);
      setMasjid(detailRes.data?.data || null);
      setBalance(balanceRes.data?.data || null);
    } catch (err: any) {
      console.error('Error loading public kas:', err);
      setError('Gagal memuat data kas masjid.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [masjidId, selectedYear, selectedMonth]);

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    const now = new Date();
    if (selectedYear === now.getFullYear() && selectedMonth === now.getMonth()) {
      return; // Can't go to future
    }
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const isNextDisabled = useMemo(() => {
    const now = new Date();
    return selectedYear === now.getFullYear() && selectedMonth === now.getMonth();
  }, [selectedYear, selectedMonth]);

  const cards = useMemo(() => {
    if (!balance) return [];
    return [
      {
        title: 'Surplus / Defisit',
        subtitle: 'Kinerja Periode Ini',
        value: `${balance.surplus >= 0 ? '+' : ''}${formatIDR(balance.surplus)}`,
        icon: balance.surplus >= 0 ? TrendingUp : TrendingDown,
        tone: balance.surplus >= 0 ? 'text-emerald-700' : 'text-red-700',
        bg: balance.surplus >= 0 ? 'bg-emerald-50' : 'bg-red-50',
      },
      {
        title: 'Dana Tidak Terikat',
        subtitle: 'Operasional Masjid',
        value: formatIDR(balance.unrestricted_funds),
        icon: Wallet,
        tone: 'text-emerald-700',
        bg: 'bg-emerald-50',
      },
      {
        title: 'Dana Terikat',
        subtitle: 'Wakaf & Proyek Khusus',
        value: formatIDR(balance.restricted_funds),
        icon: Target,
        tone: 'text-blue-700',
        bg: 'bg-blue-50',
      },
      {
        title: 'Total Pengeluaran',
        subtitle: 'Periode Berjalan',
        value: formatIDR(balance.period_expense),
        icon: TrendingDown,
        tone: 'text-orange-700',
        bg: 'bg-orange-50',
      },
    ];
  }, [balance]);

  const expenseChartData = useMemo(() => {
    if (!balance?.expense_categories || balance.expense_categories.length === 0) return [];
    return balance.expense_categories.map((cat, idx) => ({
      ...cat,
      color: COLORS[idx % COLORS.length]
    }));
  }, [balance]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-5 flex items-center gap-3">
          <Link to="/transparansi" className="flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-700">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
          <span className="text-slate-300">/</span>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold text-slate-900">Laporan Kas Masjid</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="loader"></div>
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">{error}</div>
        )}

        {!loading && !error && masjid && balance && (
          <>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2 mb-2">
                  {masjid.nama_masjid}
                  <Shield className="w-6 h-6 text-emerald-500" />
                </h1>
                <p className="text-slate-500 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> {masjid.alamat}
                </p>
                <span className="inline-block mt-2 text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-600">
                  Transparansi Publik
                </span>
              </div>
            </div>

            {/* Period Selector */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-slate-600" />
                  <div>
                    <h3 className="font-bold text-slate-900">Periode Laporan</h3>
                    <p className="text-sm text-slate-500">Pilih bulan untuk melihat rincian kas</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-semibold text-slate-900 min-w-[160px] text-center">
                    {balance.periode}
                  </div>
                  <button
                    onClick={handleNextMonth}
                    disabled={isNextDisabled}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Main Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {cards.map((c, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{c.title}</h3>
                    <c.icon className={`w-5 h-5 ${c.tone}`} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-2 font-medium">{c.subtitle}</p>
                    <div className={`text-2xl font-bold text-slate-900`}>{c.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cash Flow Summary */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <Wallet className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Ringkasan Arus Kas</h3>
                    <p className="text-xs text-slate-500">Posisi saldo periode ini</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block mb-0.5">Total Kas & Setara Kas</span>
                  <span className="text-xl font-bold text-slate-900">{formatIDR(balance.saldo_akhir)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <span className="text-xs text-slate-500 block mb-1">Saldo Awal</span>
                  <span className="font-semibold text-slate-700 text-lg">{formatIDR(balance.saldo_awal)}</span>
                </div>
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white rounded-full p-0.5 border border-slate-200 hidden md:block">
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                  </div>
                  <span className="text-xs text-emerald-600 block mb-1">Total Pemasukan (+)</span>
                  <span className="font-semibold text-emerald-700 text-lg">{formatIDR(balance.period_income)}</span>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-100 relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white rounded-full p-0.5 border border-slate-200 hidden md:block">
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  </div>
                  <span className="text-xs text-red-600 block mb-1">Total Pengeluaran (-)</span>
                  <span className="font-semibold text-red-700 text-lg">{formatIDR(balance.period_expense)}</span>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 text-white shadow-md">
                  <span className="text-xs text-slate-300 block mb-1">Saldo Akhir (=)</span>
                  <span className="font-semibold text-lg">{formatIDR(balance.saldo_akhir)}</span>
                </div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Expense Categories */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-blue-600" />
                  Rincian Pengeluaran
                </h3>
                <p className="text-xs text-slate-500 mb-6">Distribusi pengeluaran berdasarkan kategori</p>
                
                {expenseChartData.length > 0 ? (
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="h-48 w-48 relative flex-shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie
                            data={expenseChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {expenseChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                            formatter={(value: any) => formatIDR(Number(value))}
                            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                          />
                        </RePieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-full space-y-3">
                      {expenseChartData.map((cat, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: cat.color }}></div>
                            <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                          </div>
                          <span className="text-sm font-bold text-slate-900">{formatIDR(cat.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Belum ada data pengeluaran</p>
                  </div>
                )}
              </div>

              {/* Fund Breakdown */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-600" />
                  Komposisi Dana
                </h3>
                <p className="text-xs text-slate-500 mb-6">Pembagian antara dana terikat & tidak terikat</p>
                
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-emerald-900">Dana Tidak Terikat</span>
                      <span className="text-lg font-bold text-emerald-700">{formatIDR(balance.unrestricted_funds)}</span>
                    </div>
                    <div className="w-full bg-emerald-200 rounded-full h-2">
                      <div 
                        className="bg-emerald-600 h-2 rounded-full" 
                        style={{ width: `${balance.total_assets > 0 ? (balance.unrestricted_funds / balance.total_assets * 100) : 0}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-emerald-700 mt-2">
                      {balance.total_assets > 0 ? ((balance.unrestricted_funds / balance.total_assets * 100).toFixed(1)) : 0}% dari total aset
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Dana operasional masjid yang bebas digunakan sesuai kebutuhan</p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-blue-900">Dana Terikat</span>
                      <span className="text-lg font-bold text-blue-700">{formatIDR(balance.restricted_funds)}</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${balance.total_assets > 0 ? (balance.restricted_funds / balance.total_assets * 100) : 0}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-blue-700 mt-2">
                      {balance.total_assets > 0 ? ((balance.restricted_funds / balance.total_assets * 100).toFixed(1)) : 0}% dari total aset
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Dana khusus wakaf & donasi yang dibatasi penggunaannya</p>
                  </div>

                  <div className="p-4 bg-slate-800 rounded-xl text-white">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold">Total Aset Bersih</span>
                      <span className="text-xl font-bold">{formatIDR(balance.total_assets)}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">Gabungan dana terikat & tidak terikat</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-600" />
                Transaksi Terkini
              </h3>
              <p className="text-xs text-slate-500 mb-6">10 transaksi terakhir periode ini</p>
              
              {balance.recent_transactions && balance.recent_transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-2 text-xs font-semibold text-slate-500 uppercase">Tanggal</th>
                        <th className="text-left py-3 px-2 text-xs font-semibold text-slate-500 uppercase">Keterangan</th>
                        <th className="text-left py-3 px-2 text-xs font-semibold text-slate-500 uppercase">Kategori</th>
                        <th className="text-left py-3 px-2 text-xs font-semibold text-slate-500 uppercase">Tipe</th>
                        <th className="text-right py-3 px-2 text-xs font-semibold text-slate-500 uppercase">Jumlah</th>
                      </tr>
                    </thead>
                    <tbody>
                      {balance.recent_transactions.map((trx, idx) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-2 text-slate-600">{formatDate(trx.tanggal)}</td>
                          <td className="py-3 px-2 text-slate-900 font-medium">{trx.keterangan}</td>
                          <td className="py-3 px-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${trx.isRestricted ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                              {trx.kategori}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            {trx.tipe === 'pemasukan' ? (
                              <span className="flex items-center gap-1 text-emerald-600">
                                <TrendingUp className="w-4 h-4" /> Masuk
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-red-600">
                                <TrendingDown className="w-4 h-4" /> Keluar
                              </span>
                            )}
                          </td>
                          <td className={`py-3 px-2 text-right font-semibold ${trx.tipe === 'pemasukan' ? 'text-emerald-600' : 'text-red-600'}`}>
                            {trx.tipe === 'pemasukan' ? '+' : '-'}{formatIDR(trx.jumlah)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Belum ada transaksi periode ini</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default PublicKasPage;
