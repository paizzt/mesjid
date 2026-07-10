import React, { useEffect, useState, useMemo } from 'react';
import { CustomSelect } from '../../components/CustomSelect';
import { useAuth } from '../../contexts/AuthContext';
import { asetTidakTerbatasAPI, asetTerbatasAPI, masjidAPI, authAPI } from '../../services/api';
import { Wallet, TrendingUp, TrendingDown, Target, Loader2, Users, Building, CheckCircle, Clock, Coins, ArrowRight, ChevronLeft, ChevronRight, FileText, PieChart as PieChartIcon } from 'lucide-react';
import StatCard from '../../components/StatCard';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';

const DashboardHome: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // User/Takmir data
  const [masjidList, setMasjidList] = useState<any[]>([]);
  const [selectedMasjid, setSelectedMasjid] = useState<number | null>(null);
  const [saldoTidakTerbatas, setSaldoTidakTerbatas] = useState<any>(null);
  const [laporanTerbatas, setLaporanTerbatas] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  // Admin data
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    approvedUsers: 0,
    pendingUsers: 0,
    totalMasjids: 0,
    totalSaldoTidakTerbatas: 0,
    totalSaldoTerbatas: 0,
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdminData();
    } else {
      fetchUserData();
    }
  }, [user]);

  useEffect(() => {
    if (selectedMasjid && user?.role !== 'admin') {
      fetchAsetData();
    }
  }, [selectedMasjid, selectedYear, selectedMonth]);

  const fetchAdminData = async () => {
    try {
      const [usersRes, masjidsRes] = await Promise.all([
        authAPI.getAllUsers(),
        masjidAPI.getAll(),
      ]);

      const users = usersRes.data;
      const masjids = masjidsRes.data;

      // Fetch saldo for all masjids
      let totalTidakTerbatas = 0;
      let totalTerbatas = 0;

      await Promise.all(
        masjids.map(async (masjid: any) => {
          try {
            const [saldoRes, laporanRes] = await Promise.all([
              asetTidakTerbatasAPI.getSaldo(masjid.id),
              asetTerbatasAPI.getLaporan(masjid.id),
            ]);
            totalTidakTerbatas += saldoRes.data.saldo_akhir;
            totalTerbatas += laporanRes.data.reduce((sum: number, item: any) => sum + item.saldo_tersisa, 0);
          } catch (error) {
            console.error('Error fetching saldo for masjid:', masjid.id);
          }
        })
      );

      setAdminStats({
        totalUsers: users.length,
        approvedUsers: users.filter((u: any) => u.status_verifikasi === 'approved').length,
        pendingUsers: users.filter((u: any) => u.status_verifikasi === 'pending').length,
        totalMasjids: masjids.length,
        totalSaldoTidakTerbatas: totalTidakTerbatas,
        totalSaldoTerbatas: totalTerbatas,
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await masjidAPI.getAll();
      const masjids = response.data;
      setMasjidList(masjids);
      if (masjids.length > 0) {
        setSelectedMasjid(masjids[0].id);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAsetData = async () => {
    if (!selectedMasjid) return;

    try {
      const [saldoRes, laporanRes, tidakTerbatasRes, terbatasRes] = await Promise.all([
        asetTidakTerbatasAPI.getSaldo(selectedMasjid),
        asetTerbatasAPI.getLaporan(selectedMasjid),
        asetTidakTerbatasAPI.getAll(selectedMasjid),
        asetTerbatasAPI.getAll(selectedMasjid),
      ]);
      
      setSaldoTidakTerbatas(saldoRes.data);
      setLaporanTerbatas(laporanRes.data);
      
      // Filter transactions by selected period
      const startDate = new Date(selectedYear, selectedMonth, 1);
      const endDate = new Date(selectedYear, selectedMonth + 1, 0);
      
      const allTransactions = [
        ...(tidakTerbatasRes.data || []).map((t: any) => ({
          ...t,
          isRestricted: false,
          kategori: t.kategori || 'Dana Tidak Terikat',
        })),
        ...(terbatasRes.data || []).map((t: any) => ({
          ...t,
          isRestricted: true,
          kategori: t.tujuan_dana || 'Dana Terikat',
        })),
      ]
        .filter((t: any) => {
          const trxDate = new Date(t.tanggal);
          return trxDate >= startDate && trxDate <= endDate;
        })
        .sort((a: any, b: any) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
        .slice(0, 10);
      
      setRecentTransactions(allTransactions);
    } catch (error) {
      console.error('Error fetching aset data:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
  };

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
      return;
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

  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const currentPeriod = `${monthNames[selectedMonth]} ${selectedYear}`;

  const expenseCategories = useMemo(() => {
    if (!recentTransactions || recentTransactions.length === 0) return [];
    
    const categoryMap = new Map<string, number>();
    recentTransactions
      .filter((t: any) => t.tipe === 'pengeluaran')
      .forEach((t: any) => {
        const cat = t.kategori || 'Lainnya';
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + parseFloat(t.jumlah));
      });
    
    return Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));
  }, [recentTransactions]);

  const cashFlowSummary = useMemo(() => {
    if (!saldoTidakTerbatas) return null;
    
    // Calculate total income and expense from both restricted and unrestricted
    const totalIncome = saldoTidakTerbatas.pemasukan + laporanTerbatas.reduce((sum, item) => {
      // Sum all restricted fund income (collected amounts)
      return sum + item.total_pemasukan || 0;
    }, 0);
    
    const totalExpense = saldoTidakTerbatas.pengeluaran + laporanTerbatas.reduce((sum, item) => {
      // Sum all restricted fund expenses
      return sum + item.total_pengeluaran || 0;
    }, 0);
    
    const totalSaldo = saldoTidakTerbatas.saldo_akhir + laporanTerbatas.reduce((sum, item) => sum + item.saldo_tersisa, 0);
    
    return {
      totalIncome,
      totalExpense,
      totalSaldo
    };
  }, [saldoTidakTerbatas, laporanTerbatas]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  // Admin Dashboard
  if (user?.role === 'admin') {
    return (
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Dashboard Admin</h1>
          <p className="text-sm md:text-base text-slate-600 mt-1">Selamat datang, {user?.nama_lengkap}</p>
        </div>

        {/* Admin Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard
            title="Total User"
            value={adminStats.totalUsers}
            subtext={`${adminStats.approvedUsers} Approved`}
            icon={Users}
            colorClass="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatCard
            title="Total Masjid"
            value={adminStats.totalMasjids}
            subtext="Terdaftar"
            icon={Building}
            colorClass="bg-gradient-to-br from-emerald-500 to-emerald-600"
          />
          <StatCard
            title="Pending Verifikasi"
            value={adminStats.pendingUsers}
            subtext="Menunggu persetujuan"
            icon={Clock}
            colorClass="bg-gradient-to-br from-amber-500 to-amber-600"
          />
          <StatCard
            title="Total Aset"
            value={adminStats.totalSaldoTidakTerbatas + adminStats.totalSaldoTerbatas}
            subtext="Dana Seluruh Masjid"
            icon={Wallet}
            colorClass="bg-gradient-to-br from-purple-500 to-purple-600"
            formatValue={formatCurrency}
          />
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-6">
            <h3 className="text-base md:text-lg font-bold text-slate-800 mb-3 md:mb-4 flex items-center gap-2">
              <Wallet className="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0" />
              <span className="truncate">Total Aset Tidak Terbatas</span>
            </h3>
            <p className="text-xl md:text-3xl font-bold text-blue-600 break-words">
              {formatCurrency(adminStats.totalSaldoTidakTerbatas)}
            </p>
            <p className="text-xs md:text-sm text-slate-500 mt-2">Dana operasional seluruh masjid</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-6">
            <h3 className="text-base md:text-lg font-bold text-slate-800 mb-3 md:mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 md:w-5 md:h-5 text-purple-600 flex-shrink-0" />
              <span className="truncate">Total Aset Terbatas</span>
            </h3>
            <p className="text-xl md:text-3xl font-bold text-purple-600 break-words">
              {formatCurrency(adminStats.totalSaldoTerbatas)}
            </p>
            <p className="text-xs md:text-sm text-slate-500 mt-2">Dana khusus seluruh masjid</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-6">
          <h3 className="text-base md:text-lg font-bold text-slate-800 mb-3 md:mb-4">Aksi Cepat</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            <a
              href="/dashboard/verifikasi"
              className="p-3 md:p-4 border-2 border-emerald-200 rounded-lg hover:border-emerald-400 hover:bg-emerald-50 transition-all text-center group"
            >
              <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-emerald-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-semibold text-slate-800 text-sm md:text-base">Verifikasi User</div>
              <div className="text-xs md:text-sm text-slate-500">{adminStats.pendingUsers} pending</div>
            </a>
            <a
              href="/dashboard/list-user"
              className="p-3 md:p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-center group"
            >
              <Users className="w-6 h-6 md:w-8 md:h-8 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-semibold text-slate-800 text-sm md:text-base">Kelola User</div>
              <div className="text-xs md:text-sm text-slate-500">{adminStats.totalUsers} user</div>
            </a>
            <a
              href="/dashboard/list-masjid"
              className="p-3 md:p-4 border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all text-center sm:col-span-2 lg:col-span-1 group"
            >
              <Building className="w-6 h-6 md:w-8 md:h-8 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-semibold text-slate-800 text-sm md:text-base">Kelola Masjid</div>
              <div className="text-xs md:text-sm text-slate-500">{adminStats.totalMasjids} masjid</div>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // User/Takmir Dashboard
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm md:text-base text-slate-600 mt-1">Selamat datang, {user?.nama_lengkap}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {selectedMasjid && (
            <a
              href={`/masjid/${selectedMasjid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 shadow-sm transition-colors"
            >
              <Building className="w-4 h-4" />
              Lihat Halaman Publik
            </a>
          )}
          
          {masjidList.length > 1 && (
            <CustomSelect
              value={selectedMasjid || ''}
              onChange={(e) => setSelectedMasjid(Number(e.target.value))}
              className="w-full sm:w-auto px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm md:text-base bg-white"
            >
              {masjidList.map(masjid => (
                <option key={masjid.id} value={masjid.id}>
                  {masjid.nama_masjid}
                </option>
              ))}
            </CustomSelect>
          )}
        </div>
      </div>

      {/* Period Selector */}
      {saldoTidakTerbatas && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <FileText className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm md:text-base">Periode Laporan</h3>
                <p className="text-xs text-slate-500">Pilih bulan untuk melihat detail transaksi</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-semibold text-slate-900 min-w-[140px] text-center">
                {currentPeriod}
              </div>
              <button
                onClick={handleNextMonth}
                disabled={isNextDisabled}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Jadwal Shalat Widget for Jamaah or everyone */}
      <div className="bg-emerald-600 rounded-2xl shadow-sm border border-emerald-500 p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Clock className="w-32 h-32 text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
              <Clock className="w-6 h-6" />
              Jadwal Shalat
            </h3>
            <p className="text-emerald-100 text-sm">Menampilkan jadwal shalat otomatis untuk lokasi masjid</p>
          </div>
          <div className="grid grid-cols-5 gap-2 md:gap-4 text-center">
            <div className="bg-emerald-700/50 p-2 md:p-3 rounded-lg backdrop-blur-sm border border-emerald-500/30">
              <p className="text-[10px] md:text-xs text-emerald-100 uppercase font-semibold mb-1">Subuh</p>
              <p className="font-bold text-sm md:text-base">04:30</p>
            </div>
            <div className="bg-emerald-700/50 p-2 md:p-3 rounded-lg backdrop-blur-sm border border-emerald-500/30">
              <p className="text-[10px] md:text-xs text-emerald-100 uppercase font-semibold mb-1">Dzuhur</p>
              <p className="font-bold text-sm md:text-base">12:00</p>
            </div>
            <div className="bg-emerald-700/50 p-2 md:p-3 rounded-lg backdrop-blur-sm border border-emerald-500/30">
              <p className="text-[10px] md:text-xs text-emerald-100 uppercase font-semibold mb-1">Ashar</p>
              <p className="font-bold text-sm md:text-base">15:15</p>
            </div>
            <div className="bg-emerald-700/50 p-2 md:p-3 rounded-lg backdrop-blur-sm border border-emerald-500/30 bg-emerald-500">
              <p className="text-[10px] md:text-xs text-emerald-50 uppercase font-semibold mb-1">Maghrib</p>
              <p className="font-bold text-sm md:text-base">18:05</p>
            </div>
            <div className="bg-emerald-700/50 p-2 md:p-3 rounded-lg backdrop-blur-sm border border-emerald-500/30">
              <p className="text-[10px] md:text-xs text-emerald-100 uppercase font-semibold mb-1">Isya</p>
              <p className="font-bold text-sm md:text-base">19:15</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {saldoTidakTerbatas && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingUp className="w-20 h-20 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Surplus / Defisit</h3>
              <p className="text-xs text-slate-400 mb-3">Kinerja Periode Ini</p>
              <div className={`text-2xl font-bold ${(saldoTidakTerbatas.pemasukan - saldoTidakTerbatas.pengeluaran) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {(saldoTidakTerbatas.pemasukan - saldoTidakTerbatas.pengeluaran) >= 0 ? '+' : ''}{formatCurrency(saldoTidakTerbatas.pemasukan - saldoTidakTerbatas.pengeluaran)}
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Wallet className="w-20 h-20 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Dana Tidak Terikat</h3>
              <p className="text-xs text-slate-400 mb-3">Operasional Masjid</p>
              <div className="text-2xl font-bold text-slate-900">{formatCurrency(saldoTidakTerbatas.saldo_akhir)}</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Target className="w-20 h-20 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Dana Terikat</h3>
              <p className="text-xs text-slate-400 mb-3">Wakaf & Proyek Khusus</p>
              <div className="text-2xl font-bold text-slate-900">
                {formatCurrency(laporanTerbatas.reduce((sum, item) => sum + item.saldo_tersisa, 0))}
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingDown className="w-20 h-20 text-orange-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Pengeluaran</h3>
              <p className="text-xs text-slate-400 mb-3">Periode Berjalan</p>
              <div className="text-2xl font-bold text-slate-900">{formatCurrency(saldoTidakTerbatas.pengeluaran)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Cash Flow Summary */}
      {saldoTidakTerbatas && cashFlowSummary && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <Wallet className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Ringkasan Arus Kas</h3>
                <p className="text-xs text-slate-500">Total kumulatif dana terikat & tidak terikat</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block mb-0.5">Total Saldo</span>
              <span className="text-xl font-bold text-slate-900">{formatCurrency(cashFlowSummary.totalSaldo)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
              <span className="text-xs text-emerald-600 block mb-1">Total Pemasukan</span>
              <span className="font-semibold text-emerald-700 text-lg flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                {formatCurrency(cashFlowSummary.totalIncome)}
              </span>
              <p className="text-[11px] text-emerald-600/80 mt-1">Terikat + Tidak Terikat</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
              <span className="text-xs text-red-600 block mb-1">Total Pengeluaran</span>
              <span className="font-semibold text-red-700 text-lg flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                {formatCurrency(cashFlowSummary.totalExpense)}
              </span>
              <p className="text-[11px] text-red-600/80 mt-1">Terikat + Tidak Terikat</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg text-white relative shadow-md">
              <span className="text-xs text-slate-300 block mb-1">Saldo Akhir</span>
              <span className="font-semibold text-lg flex items-center gap-2">
                <ArrowRight className="w-4 h-4" />
                {formatCurrency(cashFlowSummary.totalSaldo)}
              </span>
              <p className="text-[11px] text-slate-300 mt-1">Seluruh Dana</p>
            </div>
          </div>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Expense Categories */}
        {expenseCategories.length > 0 && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-blue-600" />
              Rincian Pengeluaran
            </h3>
            <p className="text-xs text-slate-500 mb-6">Distribusi pengeluaran berdasarkan kategori</p>
            
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="h-48 w-48 relative flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseCategories}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {expenseCategories.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value: any) => formatCurrency(Number(value))}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full space-y-3">
                {expenseCategories.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                      <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{formatCurrency(cat.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Aset Terbatas Monitoring */}
        {laporanTerbatas.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-4 md:mb-6 flex items-center gap-2">
              <Coins className="w-5 h-5 md:w-6 md:h-6 text-amber-600 flex-shrink-0" />
              <span className="truncate">Monitoring Dana Terikat</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              {/* Pie Chart */}
              <div className="min-h-[250px] md:min-h-[300px]">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={laporanTerbatas}
                      dataKey="saldo_tersisa"
                      nameKey="tujuan_dana"
                      cx="50%"
                      cy="50%"
                      outerRadius={window.innerWidth < 768 ? 80 : 100}
                      label={(props) => window.innerWidth >= 768 ? String(props.name ?? '') : ''}
                    >
                      {laporanTerbatas.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : ''} />
                    <Legend wrapperStyle={{ fontSize: window.innerWidth < 768 ? '12px' : '14px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Table */}
              <div className="overflow-x-auto -mx-4 md:mx-0">
                <table className="w-full min-w-[300px]">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-3 text-xs md:text-sm font-semibold text-slate-700">Tujuan</th>
                      <th className="text-right py-2 px-3 text-xs md:text-sm font-semibold text-slate-700">Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {laporanTerbatas.map((item, index) => (
                      <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-2 px-3 text-xs md:text-sm text-slate-700">{item.tujuan_dana}</td>
                        <td className="py-2 px-3 text-xs md:text-sm text-right font-semibold whitespace-nowrap text-slate-800">
                          {formatCurrency(item.saldo_tersisa)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      {recentTransactions.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-600" />
            Transaksi Terkini
          </h3>
          <p className="text-xs text-slate-500 mb-6">10 transaksi terakhir periode {currentPeriod}</p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-2 text-xs font-semibold text-slate-500 uppercase">Tanggal</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-slate-500 uppercase">Uraian</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-slate-500 uppercase">Kategori</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-slate-500 uppercase">Tipe</th>
                  <th className="text-right py-3 px-2 text-xs font-semibold text-slate-500 uppercase">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((trx, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-2 text-slate-600">{formatDate(trx.tanggal)}</td>
                    <td className="py-3 px-2 text-slate-900 font-medium">{trx.uraian}</td>
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
                      {trx.tipe === 'pemasukan' ? '+' : '-'}{formatCurrency(parseFloat(trx.jumlah))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {masjidList.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center">
          <Wallet className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">Belum ada data masjid</p>
        </div>
      )}
    </div>
  );
};

export default DashboardHome;
