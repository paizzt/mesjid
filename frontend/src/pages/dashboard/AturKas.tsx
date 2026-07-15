import React, { useState, useEffect } from 'react';
import { CustomSelect } from '../../components/CustomSelect';
import { kasAPI, masjidAPI } from '../../services/api';
import { Plus, Trash2, Edit2, Loader2, Wallet, Building2, ArrowRightLeft } from 'lucide-react';

const AturKas: React.FC = () => {
  const [kasList, setKasList] = useState<any[]>([]);
  const [selectedMasjid, setSelectedMasjid] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form State for Kas
  const [formData, setFormData] = useState({
    id: null as number | null,
    nama_akun: '',
    tipe_akun: 'tunai',
    nomor_rekening: '',
    saldo_awal: ''
  });

  // Form State for Transfer
  const [transferData, setTransferData] = useState({
    dari_kas_id: '',
    ke_kas_id: '',
    jumlah: '',
    keterangan: ''
  });

  useEffect(() => {
    fetchMasjid();
  }, []);

  useEffect(() => {
    if (selectedMasjid) {
      fetchKas(selectedMasjid);
    }
  }, [selectedMasjid]);

  const fetchMasjid = async () => {
    try {
      const response = await masjidAPI.getAll();
      if (response.data.length > 0) {
        setSelectedMasjid(response.data[0].id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching masjid:', error);
      setLoading(false);
    }
  };

  const fetchKas = async (masjidId: number) => {
    try {
      setLoading(true);
      const response = await kasAPI.getAll(masjidId);
      setKasList(response.data);
    } catch (error) {
      console.error('Error fetching kas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveKas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMasjid) return;
    setSubmitting(true);
    try {
      if (formData.id) {
        await kasAPI.update(formData.id, formData);
      } else {
        await kasAPI.create(selectedMasjid, formData);
      }
      setShowModal(false);
      fetchKas(selectedMasjid);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus akun ini?')) return;
    try {
      await kasAPI.delete(id);
      if (selectedMasjid) fetchKas(selectedMasjid);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal menghapus');
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMasjid) return;
    setSubmitting(true);
    try {
      await kasAPI.transfer(transferData);
      setShowTransfer(false);
      fetchKas(selectedMasjid);
      setTransferData({ dari_kas_id: '', ke_kas_id: '', jumlah: '', keterangan: '' });
      alert('Transfer berhasil');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal transfer');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="loader"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Atur Kas & Bank</h1>
          <p className="text-gray-600">Kelola rekening bank dan kotak amal tunai</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setTransferData({ dari_kas_id: '', ke_kas_id: '', jumlah: '', keterangan: '' });
              setShowTransfer(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowRightLeft className="w-4 h-4" /> Transfer
          </button>
          <button
            onClick={() => {
              setFormData({ id: null, nama_akun: '', tipe_akun: 'tunai', nomor_rekening: '', saldo_awal: '' });
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4" /> Tambah Akun
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kasList.map((kas) => (
          <div key={kas.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${kas.tipe_akun === 'bank' ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${kas.tipe_akun === 'bank' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {kas.tipe_akun === 'bank' ? <Building2 className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{kas.nama_akun}</h3>
                  <p className="text-xs text-gray-500 uppercase">{kas.tipe_akun} {kas.nomor_rekening && `• ${kas.nomor_rekening}`}</p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Saldo Saat Ini</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(parseFloat(kas.saldo))}</p>
            </div>
            <div className="mt-4 flex gap-2 border-t pt-3">
              <button onClick={() => {
                setFormData({ id: kas.id, nama_akun: kas.nama_akun, tipe_akun: kas.tipe_akun, nomor_rekening: kas.nomor_rekening || '', saldo_awal: kas.saldo });
                setShowModal(true);
              }} className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800">
                <Edit2 className="w-3 h-3" /> Edit
              </button>
              <button onClick={() => handleDelete(kas.id)} className="text-xs flex items-center gap-1 text-red-600 hover:text-red-800 ml-auto">
                <Trash2 className="w-3 h-3" /> Hapus
              </button>
            </div>
          </div>
        ))}
        {kasList.length === 0 && (
          <div className="col-span-full p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            Belum ada akun kas atau bank. Silakan tambahkan.
          </div>
        )}
      </div>

      {/* Modal Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/20  flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-sm p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{formData.id ? 'Edit Akun' : 'Tambah Akun Kas'}</h2>
            <form onSubmit={handleSaveKas} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Akun</label>
                <input required type="text" value={formData.nama_akun} onChange={e => setFormData({...formData, nama_akun: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="Contoh: Kas Tunai, Bank BSI" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                <CustomSelect value={formData.tipe_akun} onChange={e => setFormData({...formData, tipe_akun: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                  <option value="tunai">Kas Tunai</option>
                  <option value="bank">Rekening Bank</option>
                </CustomSelect>
              </div>
              {formData.tipe_akun === 'bank' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Rekening</label>
                  <input type="text" value={formData.nomor_rekening} onChange={e => setFormData({...formData, nomor_rekening: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              )}
              {!formData.id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Saldo Awal</label>
                  <input required type="number" value={formData.saldo_awal} onChange={e => setFormData({...formData, saldo_awal: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="0" />
                </div>
              )}
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-emerald-600 text-white rounded-lg">{submitting ? 'Menyimpan...' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Transfer */}
      {showTransfer && (
        <div className="fixed inset-0 bg-slate-900/20  flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-sm p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Transfer Antar Kas</h2>
            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dari Akun</label>
                <CustomSelect required value={transferData.dari_kas_id} onChange={e => setTransferData({...transferData, dari_kas_id: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                  <option value="">Pilih Sumber</option>
                  {kasList.map(kas => <option key={kas.id} value={kas.id}>{kas.nama_akun} ({formatCurrency(parseFloat(kas.saldo))})</option>)}
                </CustomSelect>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ke Akun</label>
                <CustomSelect required value={transferData.ke_kas_id} onChange={e => setTransferData({...transferData, ke_kas_id: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                  <option value="">Pilih Tujuan</option>
                  {kasList.map(kas => <option key={kas.id} value={kas.id}>{kas.nama_akun}</option>)}
                </CustomSelect>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
                <input required type="number" min="1" value={transferData.jumlah} onChange={e => setTransferData({...transferData, jumlah: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                <input required type="text" value={transferData.keterangan} onChange={e => setTransferData({...transferData, keterangan: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="Pindah saldo, dsb" />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowTransfer(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg">{submitting ? 'Transfer...' : 'Transfer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AturKas;
