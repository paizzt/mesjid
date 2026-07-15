import React, { useState, useEffect } from 'react';
import { CustomSelect } from '../../components/CustomSelect';
import { masjidAPI, agendaAPI } from '../../services/api';
import { Plus, Edit2, Trash2, Loader2, Calendar, Clock, MapPin, User, CalendarDays } from 'lucide-react';

const Agenda: React.FC = () => {
  const [masjidList, setMasjidList] = useState<any[]>([]);
  const [selectedMasjid, setSelectedMasjid] = useState<number | null>(null);
  const [agendaList, setAgendaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form states
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [waktuMulai, setWaktuMulai] = useState('');
  const [waktuSelesai, setWaktuSelesai] = useState('');
  const [lokasi, setLokasi] = useState('Masjid');
  const [pembicara, setPembicara] = useState('');
  const [status, setStatus] = useState('mendatang');

  useEffect(() => {
    fetchMasjid();
  }, []);

  useEffect(() => {
    if (selectedMasjid) {
      fetchAgenda();
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

  const fetchAgenda = async () => {
    if (!selectedMasjid) return;
    setLoading(true);
    try {
      const response = await agendaAPI.getAll(selectedMasjid);
      setAgendaList(response.data);
    } catch (error) {
      console.error('Error fetching agenda:', error);
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
        deskripsi,
        tanggal,
        waktu_mulai: waktuMulai,
        waktu_selesai: waktuSelesai || null,
        lokasi,
        pembicara,
        status,
        MasjidId: selectedMasjid
      };

      if (editingId) {
        await agendaAPI.update(editingId, payload);
      } else {
        await agendaAPI.create(payload);
      }
      setIsModalOpen(false);
      fetchAgenda();
    } catch (error) {
      alert('Gagal menyimpan agenda');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Yakin menghapus agenda ini?')) {
      try {
        await agendaAPI.delete(id);
        fetchAgenda();
      } catch (error) {
        alert('Gagal menghapus agenda');
      }
    }
  };

  const handleEdit = (agenda: any) => {
    setEditingId(agenda.id);
    setJudul(agenda.judul);
    setDeskripsi(agenda.deskripsi || '');
    setTanggal(agenda.tanggal);
    setWaktuMulai(agenda.waktu_mulai);
    setWaktuSelesai(agenda.waktu_selesai || '');
    setLokasi(agenda.lokasi || 'Masjid');
    setPembicara(agenda.pembicara || '');
    setStatus(agenda.status);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setJudul('');
    setDeskripsi('');
    setTanggal('');
    setWaktuMulai('');
    setWaktuSelesai('');
    setLokasi('Masjid');
    setPembicara('');
    setStatus('mendatang');
  };

  const getStatusBadge = (s: string) => {
    if (s === 'mendatang') return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">Mendatang</span>;
    if (s === 'selesai') return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-semibold">Selesai</span>;
    if (s === 'batal') return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">Batal</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarDays className="text-emerald-500" /> Agenda & Kajian
          </h1>
          <p className="text-slate-500">Kelola jadwal kajian dan kegiatan masjid</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus size={20} />
          Tambah Agenda
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
        ) : agendaList.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-500">
            Belum ada agenda yang dijadwalkan
          </div>
        ) : (
          agendaList.map(agenda => (
            <div key={agenda.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden ${agenda.status === 'batal' ? 'border-red-200 opacity-70' : 'border-slate-200 hover:border-emerald-300 transition-colors'}`}>
              <div className={`p-4 border-b flex justify-between items-start ${agenda.status === 'mendatang' ? 'bg-slate-50' : agenda.status === 'selesai' ? 'bg-emerald-50/50' : 'bg-red-50'}`}>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">{agenda.judul}</h3>
                  <div className="flex gap-2 mt-2">{getStatusBadge(agenda.status)}</div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(agenda)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(agenda.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-start gap-3 text-sm text-slate-600">
                  <Calendar size={16} className="text-slate-400 mt-0.5" />
                  <span>{new Date(agenda.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-slate-600">
                  <Clock size={16} className="text-slate-400 mt-0.5" />
                  <span>{agenda.waktu_mulai.substring(0, 5)} {agenda.waktu_selesai ? `- ${agenda.waktu_selesai.substring(0, 5)} WIB` : 'WIB - Selesai'}</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-slate-600">
                  <MapPin size={16} className="text-slate-400 mt-0.5" />
                  <span>{agenda.lokasi}</span>
                </div>
                {agenda.pembicara && (
                  <div className="flex items-start gap-3 text-sm text-slate-600">
                    <User size={16} className="text-slate-400 mt-0.5" />
                    <span className="font-medium text-slate-700">{agenda.pembicara}</span>
                  </div>
                )}
                {agenda.deskripsi && (
                  <div className="mt-3 text-sm text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100 line-clamp-3">
                    {agenda.deskripsi}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/20  flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-slate-800">{editingId ? 'Edit Agenda' : 'Tambah Agenda'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Judul Agenda/Kajian *</label>
                <input type="text" value={judul} onChange={e => setJudul(e.target.value)} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Tanggal *</label>
                  <input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Pembicara (Opsional)</label>
                  <input type="text" value={pembicara} onChange={e => setPembicara(e.target.value)} placeholder="Ust..." className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Waktu Mulai *</label>
                  <input type="time" value={waktuMulai} onChange={e => setWaktuMulai(e.target.value)} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Waktu Selesai (Opsional)</label>
                  <input type="time" value={waktuSelesai} onChange={e => setWaktuSelesai(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Lokasi</label>
                <input type="text" value={lokasi} onChange={e => setLokasi(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Deskripsi</label>
                <textarea value={deskripsi} onChange={e => setDeskripsi(e.target.value)} rows={3} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
              {editingId && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                  <CustomSelect value={status} onChange={e => setStatus(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500">
                    <option value="mendatang">Mendatang</option>
                    <option value="selesai">Selesai</option>
                    <option value="batal">Batal</option>
                  </CustomSelect>
                </div>
              )}
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

export default Agenda;
