import React, { useState, useEffect } from 'react';
import { CustomSelect } from '../../components/CustomSelect';
import { masjidAPI, jamaahAPI } from '../../services/api';
import { Plus, Edit2, Trash2, Loader2, Users } from 'lucide-react';

const Jamaah: React.FC = () => {
  const [masjidList, setMasjidList] = useState<any[]>([]);
  const [selectedMasjid, setSelectedMasjid] = useState<number | null>(null);
  const [jamaahList, setJamaahList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form states
  const [nik, setNik] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState('L');
  const [noHp, setNoHp] = useState('');
  const [alamat, setAlamat] = useState('');
  const [statusPernikahan, setStatusPernikahan] = useState('Belum Menikah');
  const [pekerjaan, setPekerjaan] = useState('');

  useEffect(() => {
    fetchMasjid();
  }, []);

  useEffect(() => {
    if (selectedMasjid) {
      fetchJamaah();
    }
  }, [selectedMasjid]);

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

  const fetchJamaah = async () => {
    if (!selectedMasjid) return;
    setLoading(true);
    try {
      const response = await jamaahAPI.getAll(selectedMasjid);
      setJamaahList(response.data);
    } catch (error) {
      console.error('Error fetching jamaah:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMasjid) return;

    try {
      const payload = {
        nik,
        nama_lengkap: namaLengkap,
        jenis_kelamin: jenisKelamin,
        no_hp: noHp,
        alamat,
        status_pernikahan: statusPernikahan,
        pekerjaan,
        MasjidId: selectedMasjid
      };

      if (editingId) {
        await jamaahAPI.update(editingId, payload);
      } else {
        await jamaahAPI.create(payload);
      }

      setIsModalOpen(false);
      resetForm();
      fetchJamaah();
    } catch (error) {
      console.error('Error saving jamaah:', error);
      alert('Gagal menyimpan data jamaah');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Yakin ingin menghapus data jamaah ini?')) {
      try {
        await jamaahAPI.delete(id);
        fetchJamaah();
      } catch (error) {
        console.error('Error deleting jamaah:', error);
        alert('Gagal menghapus data jamaah');
      }
    }
  };

  const handleEdit = (jamaah: any) => {
    setEditingId(jamaah.id);
    setNik(jamaah.nik || '');
    setNamaLengkap(jamaah.nama_lengkap);
    setJenisKelamin(jamaah.jenis_kelamin);
    setNoHp(jamaah.no_hp || '');
    setAlamat(jamaah.alamat || '');
    setStatusPernikahan(jamaah.status_pernikahan || 'Belum Menikah');
    setPekerjaan(jamaah.pekerjaan || '');
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setNik('');
    setNamaLengkap('');
    setJenisKelamin('L');
    setNoHp('');
    setAlamat('');
    setStatusPernikahan('Belum Menikah');
    setPekerjaan('');
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
            <Users className="text-emerald-500" /> Data Jamaah
          </h1>
          <p className="text-slate-500">Kelola database profil jamaah masjid Anda</p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus size={20} />
          Tambah Jamaah
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
        <label className="font-semibold text-slate-700">Masjid:</label>
        <CustomSelect
          value={selectedMasjid || ''}
          onChange={(e) => setSelectedMasjid(Number(e.target.value))}
          className="flex-1 max-w-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
        >
          {masjidList.map(m => (
            <option key={m.id} value={m.id}>{m.nama_masjid}</option>
          ))}
        </CustomSelect>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Nama Lengkap</th>
                <th className="px-6 py-4">Kontak</th>
                <th className="px-6 py-4">Alamat</th>
                <th className="px-6 py-4">L/P</th>
                <th className="px-6 py-4">Status / Pekerjaan</th>
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
              ) : jamaahList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Belum ada data jamaah
                  </td>
                </tr>
              ) : (
                jamaahList.map((jamaah) => (
                  <tr key={jamaah.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{jamaah.nama_lengkap}</div>
                      <div className="text-xs text-slate-500">NIK: {jamaah.nik || '-'}</div>
                    </td>
                    <td className="px-6 py-4">{jamaah.no_hp || '-'}</td>
                    <td className="px-6 py-4 truncate max-w-xs">{jamaah.alamat || '-'}</td>
                    <td className="px-6 py-4">{jamaah.jenis_kelamin}</td>
                    <td className="px-6 py-4">
                      <div>{jamaah.status_pernikahan}</div>
                      <div className="text-xs text-slate-500">{jamaah.pekerjaan || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(jamaah)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(jamaah.id)}
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
                {editingId ? 'Edit Data Jamaah' : 'Tambah Jamaah'}
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Lengkap *</label>
                <input
                  type="text"
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">NIK</label>
                  <input
                    type="text"
                    value={nik}
                    onChange={(e) => setNik(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Jenis Kelamin *</label>
                  <CustomSelect
                    value={jenisKelamin}
                    onChange={(e) => setJenisKelamin(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="L">Laki-Laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </CustomSelect>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nomor HP</label>
                  <input
                    type="tel"
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Pekerjaan</label>
                  <input
                    type="text"
                    value={pekerjaan}
                    onChange={(e) => setPekerjaan(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Status Pernikahan</label>
                <CustomSelect
                  value={statusPernikahan}
                  onChange={(e) => setStatusPernikahan(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Belum Menikah">Belum Menikah</option>
                  <option value="Menikah">Menikah</option>
                  <option value="Cerai Hidup">Cerai Hidup</option>
                  <option value="Cerai Mati">Cerai Mati</option>
                </CustomSelect>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Alamat</label>
                <textarea
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

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

export default Jamaah;
