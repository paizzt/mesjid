import React, { useEffect, useState } from 'react';
import { masjidAPI, asetTidakTerbatasAPI, asetTerbatasAPI } from '../../services/api';
import { type Masjid } from '../../types';
import { Loader2, Search, MapPin, Wallet, TrendingUp, TrendingDown } from 'lucide-react';

interface MasjidWithSaldo extends Masjid {
  saldo_tidak_terbatas?: number;
  saldo_terbatas?: number;
}

const ListMasjid: React.FC = () => {
  const [masjids, setMasjids] = useState<MasjidWithSaldo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMasjids();
  }, []);

  const fetchMasjids = async () => {
    try {
      const response = await masjidAPI.getAll();
      const masjidsData = response.data;

      // Fetch saldo for each masjid
      const masjidsWithSaldo = await Promise.all(
        masjidsData.map(async (masjid: Masjid) => {
          try {
            // Fetch saldo tidak terbatas
            const saldoTidakTerbatas = await asetTidakTerbatasAPI.getSaldo(masjid.id);
            // Fetch laporan terbatas
            const laporanTerbatas = await asetTerbatasAPI.getLaporan(masjid.id);
            
            const totalTerbatas = laporanTerbatas.data.reduce(
              (sum: number, item: any) => sum + item.saldo_tersisa,
              0
            );

            return {
              ...masjid,
              saldo_tidak_terbatas: saldoTidakTerbatas.data.saldo_akhir,
              saldo_terbatas: totalTerbatas
            };
          } catch (error) {
            return {
              ...masjid,
              saldo_tidak_terbatas: 0,
              saldo_terbatas: 0
            };
          }
        })
      );

      setMasjids(masjidsWithSaldo);
    } catch (error) {
      console.error('Error fetching masjids:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const filteredMasjids = masjids.filter(masjid =>
    masjid.nama_masjid.toLowerCase().includes(searchTerm.toLowerCase()) ||
    masjid.alamat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSaldoTidakTerbatas = masjids.reduce((sum, m) => sum + (m.saldo_tidak_terbatas || 0), 0);
  const totalSaldoTerbatas = masjids.reduce((sum, m) => sum + (m.saldo_terbatas || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Daftar Masjid</h1>
        <p className="text-gray-600">Kelola dan monitor semua masjid yang terdaftar</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari masjid berdasarkan nama atau alamat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Total Masjid</div>
              <div className="text-2xl font-bold text-gray-900">{masjids.length}</div>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <Wallet className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-blue-700">Total Aset Tidak Terbatas</div>
              <div className="text-xl font-bold text-blue-900">
                {formatCurrency(totalSaldoTidakTerbatas)}
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg shadow-sm border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-purple-700">Total Aset Terbatas</div>
              <div className="text-xl font-bold text-purple-900">
                {formatCurrency(totalSaldoTerbatas)}
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingDown className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Masjid Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredMasjids.map((masjid) => (
          <div key={masjid.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{masjid.nama_masjid}</h3>
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{masjid.alamat}</span>
                  </div>
                  {masjid.koordinat && (
                    <div className="mt-2 text-xs text-gray-500">
                      Koordinat: {masjid.koordinat}
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Aset Tidak Terbatas:</span>
                    <span className="text-sm font-bold text-blue-600">
                      {formatCurrency(masjid.saldo_tidak_terbatas || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Aset Terbatas:</span>
                    <span className="text-sm font-bold text-purple-600">
                      {formatCurrency(masjid.saldo_terbatas || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-sm font-semibold text-gray-700">Total Saldo:</span>
                    <span className="text-lg font-bold text-emerald-600">
                      {formatCurrency((masjid.saldo_tidak_terbatas || 0) + (masjid.saldo_terbatas || 0))}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  Terdaftar: {new Date(masjid.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMasjids.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">Tidak ada masjid yang ditemukan</p>
        </div>
      )}
    </div>
  );
};

export default ListMasjid;
