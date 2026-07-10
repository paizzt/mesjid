import React, { useEffect, useState } from 'react';
import { CustomSelect } from '../../components/CustomSelect';
import { asetTidakTerbatasAPI, masjidAPI } from '../../services/api';
import { Trash2, Loader2, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { type AsetTidakTerbatas } from '../../types';

const AsetTidakTerbatasPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [masjidList, setMasjidList] = useState<any[]>([]);
  const [selectedMasjid, setSelectedMasjid] = useState<number | null>(null);
  const [data, setData] = useState<AsetTidakTerbatas[]>([]);
  const [saldo, setSaldo] = useState<any>(null);

  useEffect(() => {
    fetchMasjid();
  }, []);

  useEffect(() => {
    if (selectedMasjid) {
      fetchData();
      fetchSaldo();
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
      const response = await asetTidakTerbatasAPI.getAll(selectedMasjid);
      setData(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchSaldo = async () => {
    if (!selectedMasjid) return;
    try {
      const response = await asetTidakTerbatasAPI.getSaldo(selectedMasjid);
      setSaldo(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus data ini?')) return;

    try {
      await asetTidakTerbatasAPI.delete(id);
      fetchData();
      fetchSaldo();
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
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Aset Tidak Terbatas</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Kelola aset operasional umum masjid</p>
        </div>

        {masjidList.length > 1 && (
          <CustomSelect
            value={selectedMasjid || ''}
            onChange={(e) => setSelectedMasjid(Number(e.target.value))}
            className="w-full md:w-auto px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          >
            {masjidList.map(masjid => (
              <option key={masjid.id} value={masjid.id}>
                {masjid.nama_masjid}
              </option>
            ))}
          </CustomSelect>
        )}
      </div>

      {/* Saldo Cards */}
      {saldo && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm text-gray-600 mb-1">Total Pemasukan</p>
                <p className="text-lg md:text-2xl font-bold text-emerald-600 break-words">
                  {formatCurrency(saldo.pemasukan)}
                </p>
              </div>
              <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-emerald-600 flex-shrink-0 ml-2" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm text-gray-600 mb-1">Total Pengeluaran</p>
                <p className="text-lg md:text-2xl font-bold text-red-600 break-words">
                  {formatCurrency(saldo.pengeluaran)}
                </p>
              </div>
              <TrendingDown className="w-6 h-6 md:w-8 md:h-8 text-red-600 flex-shrink-0 ml-2" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 md:p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm text-gray-600 mb-1">Saldo Akhir</p>
                <p className="text-lg md:text-2xl font-bold text-blue-600 break-words">
                  {formatCurrency(saldo.saldo_akhir)}
                </p>
              </div>
              <Wallet className="w-6 h-6 md:w-8 md:h-8 text-blue-600 flex-shrink-0 ml-2" />
            </div>
          </div>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.kategori}</td>
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
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      item.tipe === 'pemasukan'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.tipe}
                  </span>
                  <span className="text-xs text-gray-600">{item.kategori}</span>
                </div>
                <p className="text-sm font-bold text-gray-900 whitespace-nowrap">
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

export default AsetTidakTerbatasPage;
