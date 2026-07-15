import React, { useEffect, useState } from 'react';
import { CustomSelect } from '../../components/CustomSelect';
import { asetTerbatasAPI, masjidAPI } from '../../services/api';
import { Trash2, Loader2, Target, Eye } from 'lucide-react';
import { type AsetTerbatas, type LaporanTujuan } from '../../types';

const AsetTerbatasPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [masjidList, setMasjidList] = useState<any[]>([]);
  const [selectedMasjid, setSelectedMasjid] = useState<number | null>(null);
  const [data, setData] = useState<AsetTerbatas[]>([]);
  const [laporan, setLaporan] = useState<LaporanTujuan[]>([]);
  const [showLaporan, setShowLaporan] = useState(false);

  useEffect(() => {
    fetchMasjid();
  }, []);

  useEffect(() => {
    if (selectedMasjid) {
      fetchData();
      fetchLaporan();
    }
  }, [selectedMasjid]);

  const fetchMasjid = async () => {
    try {
      const response = await masjidAPI.getAll();
      const masjids = response.data;
      setMasjidList(masjids);
      if (masjids.length > 0) {
        setSelectedMasjid(masjids[0].id);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    if (!selectedMasjid) return;
    try {
      const response = await asetTerbatasAPI.getAll(selectedMasjid);
      setData(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchLaporan = async () => {
    if (!selectedMasjid) return;
    try {
      const response = await asetTerbatasAPI.getLaporan(selectedMasjid);
      setLaporan(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus data ini?')) return;

    try {
      await asetTerbatasAPI.delete(id);
      fetchData();
      fetchLaporan();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal menghapus data');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Aset Terbatas</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Kelola dana dengan tujuan khusus</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          

          <button
            onClick={() => setShowLaporan(!showLaporan)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 text-sm md:text-base whitespace-nowrap"
          >
            <Eye className="w-4 h-4 md:w-5 md:h-5" />
            Laporan
          </button>
        </div>
      </div>

      {/* Laporan Cards */}
      {showLaporan && laporan.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {laporan.map((item, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-4 md:p-6">
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <h3 className="font-semibold text-gray-800 text-sm md:text-base truncate">{item.tujuan_dana}</h3>
                <Target className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 flex-shrink-0 ml-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-gray-600">Pemasukan:</span>
                  <span className="font-semibold text-emerald-600 break-words text-right">
                    {formatCurrency(item.total_pemasukan)}
                  </span>
                </div>
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-gray-600">Pengeluaran:</span>
                  <span className="font-semibold text-red-600 break-words text-right">
                    {formatCurrency(item.total_pengeluaran)}
                  </span>
                </div>
                <div className="pt-2 border-t flex justify-between">
                  <span className="text-xs md:text-sm font-medium text-gray-700">Saldo:</span>
                  <span className="text-sm md:text-base font-bold text-blue-600 break-words text-right">
                    {formatCurrency(item.saldo_tersisa)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table for Desktop, Cards for Mobile */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uraian</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tujuan Dana</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Donatur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(item.tanggal).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.uraian}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.tujuan_dana}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.nama_donatur || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        item.tipe === 'pemasukan'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.tipe}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                    {formatCurrency(item.jumlah)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-200">
          {data.map(item => (
            <div key={item.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 mb-1 truncate">{item.uraian}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(item.tanggal).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 hover:text-red-900 ml-2 flex-shrink-0"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-1 mb-3">
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Tujuan:</span> {item.tujuan_dana}
                </p>
                {item.nama_donatur && (
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Donatur:</span> {item.nama_donatur}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    item.tipe === 'pemasukan'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {item.tipe}
                </span>
                <p className="text-sm font-bold text-gray-900 whitespace-nowrap ml-2">
                  {formatCurrency(item.jumlah)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {data.length === 0 && (
          <div className="text-center py-12 text-gray-500 text-sm">
            Belum ada transaksi
          </div>
        )}
      </div>
    </div>
  );
};

export default AsetTerbatasPage;
