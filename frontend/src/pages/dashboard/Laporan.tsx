import React, { useEffect, useState, useRef } from 'react';
import { CustomSelect } from '../../components/CustomSelect';
import { masjidAPI, laporanAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2, Printer, Eye, EyeOff, FileText } from 'lucide-react';

const MONTH_NAMES = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

type ReportPeriod = 'weekly' | 'monthly' | 'yearly';
type ViewMode = 'admin' | 'public';

const Laporan: React.FC = () => {
  const { user } = useAuth();
  const printableRef = useRef<HTMLDivElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [masjidList, setMasjidList] = useState<any[]>([]);
  const [selectedMasjid, setSelectedMasjid] = useState<number | null>(null);
  
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>('monthly');
  const [reportMonth, setReportMonth] = useState(new Date().getMonth());
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [reportWeekDate, setReportWeekDate] = useState(new Date());
  const [reportViewMode, setReportViewMode] = useState<ViewMode>('admin');
  
  const [reportData, setReportData] = useState<any>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  useEffect(() => {
    fetchMasjid();
  }, []);

  useEffect(() => {
    if (selectedMasjid) {
      fetchLaporanData();
    }
  }, [selectedMasjid, reportPeriod, reportMonth, reportYear, reportWeekDate]);

  const fetchMasjid = async () => {
    try {
      const response = await masjidAPI.getAll();
      const masjids = response.data;
      setMasjidList(masjids);
      if (masjids.length > 0) {
        setSelectedMasjid(masjids[0].id);
      }
      // Generate available years (last 5 years + current)
      const currentYear = new Date().getFullYear();
      const years = Array.from({ length: 6 }, (_, i) => currentYear - i);
      setAvailableYears(years);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLaporanData = async () => {
    if (!selectedMasjid) return;
    
    setLoading(true);
    try {
      const params: any = {
        masjid_id: selectedMasjid,
        period: reportPeriod,
        year: reportYear,
      };

      if (reportPeriod === 'monthly') {
        params.month = reportMonth;
      } else if (reportPeriod === 'weekly') {
        params.week_date = reportWeekDate.toISOString().split('T')[0];
      }

      const response = await laporanAPI.getLaporanKeuangan(params);
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching laporan:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !reportData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loader"></div>
      </div>
    );
  }

  const masjidData = reportData.masjid;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header & Controls */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-md border border-slate-100 print:hidden no-print">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="text-emerald-500" /> Laporan Keuangan
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Pilih periode laporan untuk dicetak atau disimpan sebagai PDF
            </p>
          </div>
          <button
            onClick={handlePrint}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg hover:bg-slate-800 font-bold shadow-sm transition-all active:scale-95 text-sm md:text-base"
          >
            <Printer size={20} /> Cetak / Simpan PDF
          </button>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
          {/* Column 1: Period Type & View Mode */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Jenis Periode</label>
              <div className="flex bg-white rounded-md border border-slate-300 overflow-hidden">
                {['weekly', 'monthly', 'yearly'].map(p => (
                  <button
                    key={p}
                    onClick={() => setReportPeriod(p as ReportPeriod)}
                    className={`flex-1 py-2 text-xs md:text-sm font-medium transition-colors ${
                      reportPeriod === p ? 'bg-emerald-500 text-white' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p === 'weekly' ? 'Mingguan' : p === 'monthly' ? 'Bulanan' : 'Tahunan'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Mode Tampilan</label>
              <div className="flex bg-white rounded-md border border-slate-300 overflow-hidden">
                <button
                  onClick={() => setReportViewMode('admin')}
                  className={`flex-1 py-2 text-xs md:text-sm font-medium transition-colors ${
                    reportViewMode === 'admin' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Eye size={14} className="inline mr-1" /> Detail
                </button>
                <button
                  onClick={() => setReportViewMode('public')}
                  className={`flex-1 py-2 text-xs md:text-sm font-medium transition-colors ${
                    reportViewMode === 'public' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <EyeOff size={14} className="inline mr-1" /> Ringkas
                </button>
              </div>
            </div>
          </div>

          {/* Column 2-3: Date/Month/Year Filters */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

            {reportPeriod === 'weekly' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Pilih Tanggal</label>
                <input
                  type="date"
                  value={reportWeekDate.toISOString().split('T')[0]}
                  onChange={e => setReportWeekDate(new Date(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-md text-xs md:text-sm"
                />
              </div>
            )}

            {(reportPeriod === 'monthly' || reportPeriod === 'weekly') && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Bulan</label>
                <CustomSelect
                  value={reportMonth}
                  onChange={e => {
                    setReportMonth(parseInt(e.target.value));
                    if (reportPeriod === 'weekly') {
                      const d = new Date(reportWeekDate);
                      d.setMonth(parseInt(e.target.value));
                      setReportWeekDate(d);
                    }
                  }}
                  className="w-full p-2 border border-slate-300 rounded-md text-xs md:text-sm bg-white"
                >
                  {MONTH_NAMES.map((m, i) => (
                    <option key={m} value={i}>
                      {m}
                    </option>
                  ))}
                </CustomSelect>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Tahun</label>
              <CustomSelect
                value={reportYear}
                onChange={e => {
                  setReportYear(parseInt(e.target.value));
                  if (reportPeriod === 'weekly') {
                    const d = new Date(reportWeekDate);
                    d.setFullYear(parseInt(e.target.value));
                    setReportWeekDate(d);
                  }
                }}
                className="w-full p-2 border border-slate-300 rounded-md text-xs md:text-sm bg-white"
              >
                {availableYears.map(y => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </CustomSelect>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Report */}
      <div
        id="printable-report"
        ref={printableRef}
        className="bg-white p-6 md:p-8 lg:p-12 shadow-sm border border-slate-200 mx-auto max-w-[210mm] print:shadow-none print:border-0 print:p-0 print:max-w-none print:w-full"
      >
        {/* Header */}
        <div className="text-center border-b-2 border-slate-800 pb-6 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 uppercase tracking-wide mb-2">
            {masjidData?.nama || 'Masjid'}
          </h1>
          <p className="text-sm md:text-base text-slate-500">{masjidData?.alamat || ''}</p>
        </div>

        {/* Report Title */}
        <div className="text-center mb-8">
          <h2 className="text-lg md:text-xl font-bold text-slate-800 uppercase underline decoration-2 underline-offset-4">
            Laporan Keuangan {reportViewMode === 'public' ? 'Ringkas' : 'Lengkap'}
          </h2>
          <p className="text-slate-600 mt-2 font-medium text-sm md:text-base">Periode: {reportData.periode.title}</p>
        </div>

        {/* A. Laporan Penghasilan Komprehensif */}
        <div className="mb-8">
          <h3 className="font-bold text-slate-700 mb-2 uppercase text-xs md:text-sm border-l-4 border-slate-800 pl-2">
            Laporan Penghasilan Komprehensif
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 p-2 text-left w-2/5">Uraian</th>
                  <th className="border border-slate-300 p-2 text-right w-1/5">Tidak Terbatas</th>
                  <th className="border border-slate-300 p-2 text-right w-1/5">Terbatas</th>
                  <th className="border border-slate-300 p-2 text-right w-1/5 bg-slate-200">Total</th>
                </tr>
              </thead>
              <tbody>
                {/* PENGHASILAN */}
                <tr className="bg-slate-50">
                  <td colSpan={4} className="border border-slate-300 p-2 font-bold italic">
                    1. PENGHASILAN
                  </td>
                </tr>

                {/* Detail Rows - Only for Admin Mode */}
                {reportViewMode === 'admin' &&
                  Object.keys(reportData.current.income.details)
                    .sort()
                    .map(cat => {
                      const { un, res } = reportData.current.income.details[cat];
                      const total = un + res;
                      if (total === 0) return null;
                      return (
                        <tr key={cat}>
                          <td className="border border-slate-300 p-2 pl-6">{cat}</td>
                          <td className="border border-slate-300 p-2 text-right text-emerald-600">{un > 0 ? formatCurrency(un) : '-'}</td>
                          <td className="border border-slate-300 p-2 text-right text-emerald-600">{res > 0 ? formatCurrency(res) : '-'}</td>
                          <td className="border border-slate-300 p-2 text-right font-medium text-emerald-600">
                            {formatCurrency(total)}
                          </td>
                        </tr>
                      );
                    })}

                <tr className="font-bold bg-slate-50">
                  <td className="border border-slate-300 p-2 text-right">Total Penghasilan</td>
                  <td className="border border-slate-300 p-2 text-right text-emerald-700">
                    {reportData.current.income.tidak_terbatas > 0 ? formatCurrency(reportData.current.income.tidak_terbatas) : '-'}
                  </td>
                  <td className="border border-slate-300 p-2 text-right text-emerald-700">
                    {reportData.current.income.terbatas > 0 ? formatCurrency(reportData.current.income.terbatas) : '-'}
                  </td>
                  <td className="border border-slate-300 p-2 text-right bg-emerald-50 text-emerald-700">
                    {reportData.current.income.total > 0 ? formatCurrency(reportData.current.income.total) : '-'}
                  </td>
                </tr>

                {/* BEBAN */}
                <tr className="bg-slate-50">
                  <td colSpan={4} className="border border-slate-300 p-2 font-bold italic">
                    2. BEBAN
                  </td>
                </tr>

                {/* Detail Rows - Only for Admin Mode */}
                {reportViewMode === 'admin' &&
                  Object.keys(reportData.current.expense.details)
                    .sort()
                    .map(cat => {
                      const { un, res } = reportData.current.expense.details[cat];
                      const total = un + res;
                      if (total === 0) return null;
                      return (
                        <tr key={cat}>
                          <td className="border border-slate-300 p-2 pl-6">{cat}</td>
                          <td className="border border-slate-300 p-2 text-right text-red-600">
                            {un > 0 ? `(${formatCurrency(un)})` : '-'}
                          </td>
                          <td className="border border-slate-300 p-2 text-right text-red-600">
                            {res > 0 ? `(${formatCurrency(res)})` : '-'}
                          </td>
                          <td className="border border-slate-300 p-2 text-right font-medium text-red-600">
                            ({formatCurrency(total)})
                          </td>
                        </tr>
                      );
                    })}

                <tr className="font-bold bg-slate-50">
                  <td className="border border-slate-300 p-2 text-right">Total Beban</td>
                  <td className="border border-slate-300 p-2 text-right text-red-700">
                    {reportData.current.expense.tidak_terbatas > 0 ? `(${formatCurrency(reportData.current.expense.tidak_terbatas)})` : '-'}
                  </td>
                  <td className="border border-slate-300 p-2 text-right text-red-700">
                    {reportData.current.expense.terbatas > 0 ? `(${formatCurrency(reportData.current.expense.terbatas)})` : '-'}
                  </td>
                  <td className="border border-slate-300 p-2 text-right bg-red-50 text-red-700">
                    {reportData.current.expense.total > 0 ? `(${formatCurrency(reportData.current.expense.total)})` : '-'}
                  </td>
                </tr>

                <tr className="font-bold bg-slate-200 text-slate-800 border-t-2 border-slate-400">
                  <td className="border border-slate-300 p-2">SURPLUS / (DEFISIT) PERIODE INI</td>
                  <td className={`border border-slate-300 p-2 text-right ${reportData.surplus.tidak_terbatas < 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                    {reportData.surplus.tidak_terbatas < 0 ? `(${formatCurrency(Math.abs(reportData.surplus.tidak_terbatas))})` : formatCurrency(reportData.surplus.tidak_terbatas)}
                  </td>
                  <td className={`border border-slate-300 p-2 text-right ${reportData.surplus.terbatas < 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                    {reportData.surplus.terbatas < 0 ? `(${formatCurrency(Math.abs(reportData.surplus.terbatas))})` : formatCurrency(reportData.surplus.terbatas)}
                  </td>
                  <td className={`border border-slate-300 p-2 text-right ${reportData.surplus.total < 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                    {reportData.surplus.total < 0 ? `(${formatCurrency(Math.abs(reportData.surplus.total))})` : formatCurrency(reportData.surplus.total)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* B. Perubahan Aset Neto */}
        <div className="mb-12">
          <h3 className="font-bold text-slate-700 mb-2 uppercase text-xs md:text-sm border-l-4 border-slate-800 pl-2">
            Perubahan Aset Neto
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 p-2 text-left w-2/5">Keterangan</th>
                  <th className="border border-slate-300 p-2 text-right w-1/5">Tidak Terbatas</th>
                  <th className="border border-slate-300 p-2 text-right w-1/5">Terbatas</th>
                  <th className="border border-slate-300 p-2 text-right w-1/5 bg-slate-200">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 p-2">Saldo Awal (Sebelum Periode)</td>
                  <td className="border border-slate-300 p-2 text-right">{formatCurrency(reportData.opening.tidak_terbatas)}</td>
                  <td className="border border-slate-300 p-2 text-right">{formatCurrency(reportData.opening.terbatas)}</td>
                  <td className="border border-slate-300 p-2 text-right font-bold">
                    {formatCurrency(reportData.opening.total)}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2">Perubahan (Surplus/Defisit)</td>
                  <td className="border border-slate-300 p-2 text-right">{formatCurrency(reportData.surplus.tidak_terbatas)}</td>
                  <td className="border border-slate-300 p-2 text-right">{formatCurrency(reportData.surplus.terbatas)}</td>
                  <td className="border border-slate-300 p-2 text-right font-bold">
                    {formatCurrency(reportData.surplus.total)}
                  </td>
                </tr>
                <tr className="bg-slate-100 font-bold">
                  <td className="border border-slate-300 p-2">SALDO AKHIR ASET NETO</td>
                  <td className="border border-slate-300 p-2 text-right">{formatCurrency(reportData.closing.tidak_terbatas)}</td>
                  <td className="border border-slate-300 p-2 text-right">{formatCurrency(reportData.closing.terbatas)}</td>
                  <td className="border border-slate-300 p-2 text-right bg-slate-200">
                    {formatCurrency(reportData.closing.total)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* C & D - Only for Admin Mode */}
        {reportViewMode === 'admin' && (
          <>
            {/* Laporan Aset Terbatas */}
            {reportData.laporanTerbatas && reportData.laporanTerbatas.length > 0 && (
              <div className="mb-12">
                <h3 className="font-bold text-slate-700 mb-2 uppercase text-xs md:text-sm border-l-4 border-slate-800 pl-2">
                  Rincian Dana Terbatas
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs md:text-sm border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-slate-300 p-2 text-left">Tujuan Dana</th>
                        <th className="border border-slate-300 p-2 text-right">Pemasukan</th>
                        <th className="border border-slate-300 p-2 text-right">Pengeluaran</th>
                        <th className="border border-slate-300 p-2 text-right bg-slate-200">Saldo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.laporanTerbatas.map((item: any, idx: number) => (
                        <tr key={idx}>
                          <td className="border border-slate-300 p-2">{item.tujuan_dana}</td>
                          <td className="border border-slate-300 p-2 text-right text-emerald-600">
                            {formatCurrency(item.total_pemasukan)}
                          </td>
                          <td className="border border-slate-300 p-2 text-right text-red-600">
                            {formatCurrency(item.total_pengeluaran)}
                          </td>
                          <td className="border border-slate-300 p-2 text-right font-bold bg-slate-50">
                            {formatCurrency(item.saldo_tersisa)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* D. Laporan Arus Kas */}
            <div className="mb-12">
              <h3 className="font-bold text-slate-700 mb-2 uppercase text-xs md:text-sm border-l-4 border-slate-800 pl-2">
                D. Laporan Arus Kas
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs md:text-sm border-collapse border border-slate-300">
                  <tbody>
                    <tr className="bg-slate-100 font-bold">
                      <td colSpan={2} className="border border-slate-300 p-2">
                        AKTIVITAS OPERASI
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-2 w-2/3">Penerimaan Kas</td>
                      <td className="border border-slate-300 p-2 text-right">
                        {formatCurrency(reportData.cashFlow.operatingIn)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-2">Pengeluaran Kas</td>
                      <td className="border border-slate-300 p-2 text-right text-red-600">
                        ({formatCurrency(reportData.cashFlow.operatingOut)})
                      </td>
                    </tr>
                    <tr className="font-bold bg-slate-50">
                      <td className="border border-slate-300 p-2 text-right">Arus Kas Bersih Operasi</td>
                      <td className="border border-slate-300 p-2 text-right">
                        {formatCurrency(reportData.cashFlow.netCashFlow)}
                      </td>
                    </tr>
                    <tr className="bg-slate-200 font-bold border-t-2 border-slate-400">
                      <td className="border border-slate-300 p-2">KENAIKAN/(PENURUNAN) KAS</td>
                      <td className="border border-slate-300 p-2 text-right">{formatCurrency(reportData.surplus.total)}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 p-2">Saldo Kas Awal</td>
                      <td className="border border-slate-300 p-2 text-right">{formatCurrency(reportData.opening.total)}</td>
                    </tr>
                    <tr className="font-bold">
                      <td className="border border-slate-300 p-2">SALDO KAS AKHIR</td>
                      <td className="border border-slate-300 p-2 text-right">{formatCurrency(reportData.closing.total)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Signature Section */}
        <div className="grid grid-cols-3 gap-8 mt-16 text-center text-xs md:text-sm text-slate-800">
          <div>
            <p className="mb-16">Mengetahui,</p>
            <p className="font-bold underline">{masjidData?.ketua_pengurus || 'Ketua Takmir'}</p>
            <p>Ketua Pengurus</p>
            <p>DKM {masjidData?.nama || 'Masjid'}</p>
          </div>
          <div></div>
          <div>
            <p className="mb-16">Dibuat Oleh,</p>
            <p className="font-bold underline">{user?.nama_lengkap || 'Staf Keuangan'}</p>
            <p>Bendahara</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Laporan;
