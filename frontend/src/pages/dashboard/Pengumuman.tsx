import React, { useState, useEffect } from 'react';
import { CustomSelect } from '../../components/CustomSelect';
import { masjidAPI, pengumumanAPI } from '../../services/api';
import { Plus, Edit2, Trash2, Loader2, Megaphone, Bell, CalendarClock } from 'lucide-react';

const Pengumuman: React.FC = () => {
  const [masjidList, setMasjidList] = useState<any[]>([]);
  const [selectedMasjid, setSelectedMasjid] = useState<number | null>(null);
  const [pengumumanList, setPengumumanList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form states
  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');
  const [tanggalBerakhir, setTanggalBerakhir] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchMasjid();
  }, []);

  useEffect(() => {
    if (selectedMasjid) {
      fetchPengumuman();
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

  const fetchPengumuman = async () => {
    if (!selectedMasjid) return;
    setLoading(true);
    try {
      const response = await pengumumanAPI.getAll(selectedMasjid);
      setPengumumanList(response.data);
    } catch (error) {
      console.error('Error fetching pengumuman:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMasjid) return;

    try {
      const payload = {
        judul,
        isi,
        tanggal_berakhir: tanggalBerakhir || null,
        is_active: isActive,
        MasjidId: selectedMasjid
      };

      if (editingId) {
        await pengumumanAPI.update(editingId, payload);
      } else {
        await pengumumanAPI.create(payload);
      }
      setIsModalOpen(false);
      fetchPengumuman();
    } catch (error) {
      alert('Gagal menyimpan pengumuman');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Yakin menghapus pengumuman ini?')) {
      try {
        await pengumumanAPI.delete(id);
        fetchPengumuman();
      } catch (error) {
        alert('Gagal menghapus pengumuman');
      }
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setJudul(item.judul);
    setIsi(item.isi);
    setTanggalBerakhir(item.tanggal_berakhir || '');
    setIsActive(item.is_active);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setJudul('');
    setIsi('');
    setTanggalBerakhir('');
    setIsActive(true);
  };

  const isExpired = (dateString: string) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date(new Date().setHours(0,0,0,0));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Megaphone className="text-emerald-500" /> Pengumuman Masjid
          </h1>
          <p className="text-slate-500">Buat dan kelola papan pengumuman jamaah</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus size={20} />
          Buat Pengumuman
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
        <label className="font-semibold text-slate-700 text-sm">Masjid:</label>
        <CustomSelect
          value={selectedMasjid || ''}
          onChange={(e) => setSelectedMasjid(Number(e.target.value))}
          className="w-full max-w-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
        >
          {masjidList.map(m => (
            <option key={m.id} value={m.id}>{m.nama_masjid}</option>
          ))}
        </CustomSelect>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : pengumumanList.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-500">
            Belum ada pengumuman
          </div>
        ) : (
          pengumumanList.map(item => {
            const expired = isExpired(item.tanggal_berakhir);
            const active = item.is_active && !expired;
            
            return (
              <div key={item.id} className={`bg-white rounded-xl shadow-sm border flex flex-col overflow-hidden transition-all ${active ? 'border-emerald-200 ring-1 ring-emerald-50' : 'border-slate-200 opacity-75'}`}>
                <div className={`px-4 py-3 border-b flex justify-between items-center ${active ? 'bg-emerald-50/50 text-emerald-800' : 'bg-slate-50 text-slate-600'}`}>
                  <div className="flex items-center gap-2 font-semibold">
                    {active ? <Bell size={16} className="text-emerald-500 animate-pulse" /> : <Bell size={16} className="text-slate-400" />}
                    {active ? 'Aktif' : expired ? 'Kadaluarsa' : 'Non-aktif'}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-slate-800 text-lg mb-2">{item.judul}</h3>
                  <div className="text-sm text-slate-600 mb-4 whitespace-pre-wrap flex-1">{item.isi}</div>
                  
                  <div className="pt-4 mt-auto border-t border-slate-100 text-xs text-slate-500 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <CalendarClock size={14} /> Dibuat: {new Date(item.createdAt).toLocaleDateString('id-ID')}
                    </div>
                    {item.tanggal_berakhir && (
                      <div className={`flex items-center gap-2 ${expired ? 'text-red-500' : ''}`}>
                        <CalendarClock size={14} /> Berakhir: {new Date(item.tanggal_berakhir).toLocaleDateString('id-ID')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/20  flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">{editingId ? 'Edit Pengumuman' : 'Buat Pengumuman'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Judul Pengumuman *</label>
                <input type="text" value={judul} onChange={e => setJudul(e.target.value)} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Isi Pengumuman *</label>
                <textarea value={isi} onChange={e => setIsi(e.target.value)} rows={5} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tanggal Berakhir (Opsional)</label>
                <input type="date" value={tanggalBerakhir} onChange={e => setTanggalBerakhir(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500" />
                <p className="text-xs text-slate-500 mt-1">Kosongkan jika pengumuman berlaku seterusnya hingga dinonaktifkan.</p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="is_active" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="rounded text-emerald-600 focus:ring-emerald-500" />
                <label htmlFor="is_active" className="text-sm font-medium text-slate-700">Tampilkan pengumuman ini (Aktif)</label>
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

export default Pengumuman;
