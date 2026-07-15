import React, { useState, useEffect } from 'react';
import { CustomSelect } from '../../components/CustomSelect';
import { masjidAPI, inventarisAPI } from '../../services/api';
import { Plus, Edit2, Trash2, Loader2, Archive, Calendar, CheckCircle2, AlertTriangle, XCircle, MapPin } from 'lucide-react';

const Inventaris: React.FC = () => {
  const [masjidList, setMasjidList] = useState<any[]>([]);
  const [selectedMasjid, setSelectedMasjid] = useState<number | null>(null);
  const [inventarisList, setInventarisList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form states
  const [namaBarang, setNamaBarang] = useState('');
  const [jumlah, setJumlah] = useState<number | ''>('');
  const [kondisi, setKondisi] = useState('baik');
  const [lokasi, setLokasi] = useState('');
  const [tanggalPerolehan, setTanggalPerolehan] = useState('');
  const [keterangan, setKeterangan] = useState('');

  useEffect(() => {
    fetchMasjid();
  }, []);

  useEffect(() => {
    if (selectedMasjid) {
      fetchInventaris();
    }
  }, [selectedMasjid]);

  const fetchMasjid = async () => {
    try {
      const response = await masjidAPI.getAll();
      setMasjidList(response.data);
      if (response.data.length > 0) setSelectedMasjid(response.data[0].id);
    } catch (error) {
      console.error('Error fetching masjid:', error);
    }
  };

  const fetchInventaris = async () => {
    if (!selectedMasjid) return;
    setLoading(true);
    try {
      const response = await inventarisAPI.getAll(selectedMasjid);
      setInventarisList(response.data);
    } catch (error) {
      console.error('Error fetching inventaris:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMasjid) return;

    try {
      const payload = {
        nama_barang: namaBarang,
        jumlah: Number(jumlah),
        kondisi,
        lokasi,
        tanggal_perolehan: tanggalPerolehan || null,
        keterangan,
        MasjidId: selectedMasjid
      };

      if (editingId) {
        await inventarisAPI.update(editingId, payload);
      } else {
        await inventarisAPI.create(payload);
      }
      setIsModalOpen(false);
      fetchInventaris();
    } catch (error) {
      alert('Gagal menyimpan inventaris');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Yakin menghapus data inventaris ini?')) {
      try {
        await inventarisAPI.delete(id);
        fetchInventaris();
      } catch (error) {
        alert('Gagal menghapus inventaris');
      }
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setNamaBarang(item.nama_barang);
    setJumlah(item.jumlah);
    setKondisi(item.kondisi);
    setLokasi(item.lokasi || '');
    setTanggalPerolehan(item.tanggal_perolehan || '');
    setKeterangan(item.keterangan || '');
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setNamaBarang('');
    setJumlah('');
    setKondisi('baik');
    setLokasi('');
    setTanggalPerolehan('');
    setKeterangan('');
  };

  const getKondisiBadge = (k: string) => {
    if (k === 'baik') return <span className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-semibold"><CheckCircle2 size={12} /> Baik</span>;
    if (k === 'rusak') return <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-semibold"><AlertTriangle size={12} /> Rusak</span>;
    if (k === 'hilang') return <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold"><XCircle size={12} /> Hilang</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Archive className="text-emerald-500" /> Data Inventaris
          </h1>
          <p className="text-slate-500">Kelola aset dan barang milik masjid</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus size={20} />
          Tambah Barang
        </button>
      </div>

      

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-semibold text-slate-700">Nama Barang</th>
                <th className="p-4 font-semibold text-slate-700">Jumlah</th>
                <th className="p-4 font-semibold text-slate-700">Kondisi</th>
                <th className="p-4 font-semibold text-slate-700 hidden md:table-cell">Lokasi / Keterangan</th>
                <th className="p-4 font-semibold text-slate-700 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center"><div className="loader"></div></td>
                </tr>
              ) : inventarisList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">Belum ada data inventaris</td>
                </tr>
              ) : (
                inventarisList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{item.nama_barang}</div>
                      {item.tanggal_perolehan && (
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <Calendar size={12} /> {new Date(item.tanggal_perolehan).toLocaleDateString('id-ID')}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full font-bold inline-block text-sm">
                        {item.jumlah}
                      </div>
                    </td>
                    <td className="p-4">
                      {getKondisiBadge(item.kondisi)}
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      {item.lokasi && (
                        <div className="flex items-center gap-1 text-sm text-slate-600 mb-1">
                          <MapPin size={14} className="text-slate-400" /> {item.lokasi}
                        </div>
                      )}
                      {item.keterangan && <div className="text-xs text-slate-500 truncate max-w-xs">{item.keterangan}</div>}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(item)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg">
                          <Trash2 size={18} />
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/20  flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">{editingId ? 'Edit Inventaris' : 'Tambah Barang Inventaris'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Barang *</label>
                <input type="text" value={namaBarang} onChange={e => setNamaBarang(e.target.value)} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Jumlah *</label>
                  <input type="number" min="1" value={jumlah} onChange={e => setJumlah(e.target.value ? Number(e.target.value) : '')} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Kondisi *</label>
                  <CustomSelect value={kondisi} onChange={e => setKondisi(e.target.value)} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500">
                    <option value="baik">Baik</option>
                    <option value="rusak">Rusak</option>
                    <option value="hilang">Hilang</option>
                  </CustomSelect>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Tanggal Perolehan</label>
                  <input type="date" value={tanggalPerolehan} onChange={e => setTanggalPerolehan(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Lokasi Penyimpanan</label>
                  <input type="text" value={lokasi} onChange={e => setLokasi(e.target.value)} placeholder="Gudang / Area shalat" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Keterangan Tambahan</label>
                <textarea value={keterangan} onChange={e => setKeterangan(e.target.value)} rows={3} placeholder="Merek, warna, atau catatan lain" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 text-white bg-emerald-600 rounded-lg">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventaris;
