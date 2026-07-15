import React, { useState, useEffect } from 'react';
import { CustomSelect } from '../../components/CustomSelect';
import { masjidAPI, zakatAPI } from '../../services/api';
import { Plus, Edit2, Trash2, Loader2, Target, Package, Users } from 'lucide-react';

const Zakat: React.FC = () => {
  const [masjidList, setMasjidList] = useState<any[]>([]);
  const [selectedMasjid, setSelectedMasjid] = useState<number | null>(null);
  
  const currentYear = new Date().getFullYear();
  const hijriYearGuess = currentYear - 579;
  const [tahunHijriah, setTahunHijriah] = useState(`${hijriYearGuess} H`);
  
  const [zakatList, setZakatList] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    totalFitrahUang: 0,
    totalFitrahBeras: 0,
    totalMalUang: 0,
    totalJiwaFitrah: 0
  });
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form states
  const [namaMuzakki, setNamaMuzakki] = useState('');
  const [jenisZakat, setJenisZakat] = useState('fitrah');
  const [bentukBayar, setBentukBayar] = useState('uang');
  const [jumlahJiwa, setJumlahJiwa] = useState(1);
  const [nominalUang, setNominalUang] = useState('');
  const [literBeras, setLiterBeras] = useState('');

  useEffect(() => {
    fetchMasjid();
  }, []);

  useEffect(() => {
    if (selectedMasjid) {
      fetchZakat();
    }
  }, [selectedMasjid, tahunHijriah]);

  const fetchMasjid = async () => {
    try {
      const response = await masjidAPI.getAll();
      setMasjidList(response.data);
      if (response.data.length > 0) {
        setSelectedMasjid(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching masjid:', error);
    }
  };

  const fetchZakat = async () => {
    if (!selectedMasjid) return;
    setLoading(true);
    try {
      const response = await zakatAPI.getAll(selectedMasjid, tahunHijriah);
      setZakatList(response.data.data);
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Error fetching zakat:', error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMasjid) return;

    try {
      const payload = {
        tahun_hijriah: tahunHijriah,
        nama_muzakki: namaMuzakki,
        jenis_zakat: jenisZakat,
        bentuk_bayar: bentukBayar,
        jumlah_jiwa: jumlahJiwa,
        nominal_uang: parseFloat(nominalUang) || 0,
        liter_beras: parseFloat(literBeras) || 0,
        MasjidId: selectedMasjid
      };

      if (editingId) {
        await zakatAPI.update(editingId, payload);
      } else {
        await zakatAPI.create(payload);
      }

      setIsModalOpen(false);
      resetForm();
      fetchZakat();
    } catch (error) {
      console.error('Error saving zakat:', error);
      alert('Gagal menyimpan data zakat');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Yakin ingin menghapus data zakat ini?')) {
      try {
        await zakatAPI.delete(id);
        fetchZakat();
      } catch (error) {
        console.error('Error deleting zakat:', error);
        alert('Gagal menghapus data zakat');
      }
    }
  };

  const handleEdit = (zakat: any) => {
    setEditingId(zakat.id);
    setNamaMuzakki(zakat.nama_muzakki);
    setJenisZakat(zakat.jenis_zakat);
    setBentukBayar(zakat.bentuk_bayar);
    setJumlahJiwa(zakat.jumlah_jiwa || 1);
    setNominalUang(zakat.nominal_uang > 0 ? zakat.nominal_uang.toString() : '');
    setLiterBeras(zakat.liter_beras > 0 ? zakat.liter_beras.toString() : '');
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setNamaMuzakki('');
    setJenisZakat('fitrah');
    setBentukBayar('uang');
    setJumlahJiwa(1);
    setNominalUang('');
    setLiterBeras('');
  };

  const openModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Target className="text-emerald-500" /> Penerimaan Zakat
          </h1>
          <p className="text-slate-500">Kelola penerimaan Zakat Fitrah dan Zakat Mal</p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Terima Zakat
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-slate-700 text-sm">Masjid:</label>
          <CustomSelect
            value={selectedMasjid || ''}
            onChange={(e) => setSelectedMasjid(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          >
            {masjidList.map(m => (
              <option key={m.id} value={m.id}>{m.nama_masjid}</option>
            ))}
          </CustomSelect>
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-slate-700 text-sm">Tahun Hijriah:</label>
          <input
            type="text"
            value={tahunHijriah}
            onChange={(e) => setTahunHijriah(e.target.value)}
            placeholder="1445 H"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Dashboard Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-emerald-100 rounded-lg text-emerald-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-800">Jiwa (Fitrah)</p>
            <p className="text-2xl font-bold text-emerald-900">{summary.totalJiwaFitrah} Orang</p>
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600 flex items-center justify-center w-12 h-12">
            <span className="font-bold text-lg">Rp</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-800">Zakat Fitrah (Uang)</p>
            <p className="text-xl font-bold text-blue-900">{formatCurrency(summary.totalFitrahUang)}</p>
          </div>
        </div>

        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-amber-100 rounded-lg text-amber-600">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-800">Zakat Fitrah (Beras)</p>
            <p className="text-xl font-bold text-amber-900">{summary.totalFitrahBeras} Liter</p>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-purple-100 rounded-lg text-purple-600 flex items-center justify-center w-12 h-12">
            <span className="font-bold text-lg">Rp</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-purple-800">Zakat Mal</p>
            <p className="text-xl font-bold text-purple-900">{formatCurrency(summary.totalMalUang)}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Muzakki</th>
                <th className="px-6 py-4">Jenis</th>
                <th className="px-6 py-4">Detail</th>
                <th className="px-6 py-4 text-right">Nilai</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
                  </td>
                </tr>
              ) : zakatList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Belum ada data penerimaan zakat
                  </td>
                </tr>
              ) : (
                zakatList.map((zakat) => (
                  <tr key={zakat.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4">
                      {new Date(zakat.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{zakat.nama_muzakki}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${zakat.jenis_zakat === 'fitrah' ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'}`}>
                        Zakat {zakat.jenis_zakat}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {zakat.jenis_zakat === 'fitrah' ? `${zakat.jumlah_jiwa} Jiwa (${zakat.bentuk_bayar})` : 'Harta (Uang)'}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-700">
                      {zakat.bentuk_bayar === 'uang' || zakat.jenis_zakat === 'mal' 
                        ? formatCurrency(zakat.nominal_uang) 
                        : `${zakat.liter_beras} L`}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(zakat)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(zakat.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/20  flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-slate-800">
                {editingId ? 'Edit Data Zakat' : 'Terima Zakat Baru'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Muzakki (Pemberi Zakat) *</label>
                <input
                  type="text"
                  value={namaMuzakki}
                  onChange={(e) => setNamaMuzakki(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Jenis Zakat *</label>
                  <CustomSelect
                    value={jenisZakat}
                    onChange={(e) => {
                      setJenisZakat(e.target.value);
                      if (e.target.value === 'mal') {
                        setBentukBayar('uang');
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="fitrah">Zakat Fitrah</option>
                    <option value="mal">Zakat Mal</option>
                  </CustomSelect>
                </div>

                {jenisZakat === 'fitrah' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Bentuk Bayar *</label>
                    <CustomSelect
                      value={bentukBayar}
                      onChange={(e) => setBentukBayar(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="uang">Uang</option>
                      <option value="beras">Beras</option>
                    </CustomSelect>
                  </div>
                )}
              </div>

              {jenisZakat === 'fitrah' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Jumlah Jiwa *</label>
                  <input
                    type="number"
                    min="1"
                    value={jumlahJiwa}
                    onChange={(e) => setJumlahJiwa(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              )}

              {(bentukBayar === 'uang' || jenisZakat === 'mal') && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nominal Uang (Rp) *</label>
                  <input
                    type="number"
                    value={nominalUang}
                    onChange={(e) => setNominalUang(e.target.value)}
                    placeholder="Contoh: 50000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              )}

              {bentukBayar === 'beras' && jenisZakat === 'fitrah' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Banyak Beras (Liter) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={literBeras}
                    onChange={(e) => setLiterBeras(e.target.value)}
                    placeholder="Contoh: 2.5ATAU 3.5"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Zakat;
