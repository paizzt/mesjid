import React, { useState, useEffect } from 'react';
import { CustomSelect } from '../../components/CustomSelect';
import { masjidAPI, tabunganQurbanAPI } from '../../services/api';
import { Plus, Edit2, Trash2, Loader2, PiggyBank, History } from 'lucide-react';

const TabunganQurban: React.FC = () => {
  const [masjidList, setMasjidList] = useState<any[]>([]);
  const [selectedMasjid, setSelectedMasjid] = useState<number | null>(null);
  
  const [tabunganList, setTabunganList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isTabunganModalOpen, setIsTabunganModalOpen] = useState(false);
  const [isSetoranModalOpen, setIsSetoranModalOpen] = useState(false);
  const [editingTabunganId, setEditingTabunganId] = useState<number | null>(null);
  const [activeTabunganId, setActiveTabunganId] = useState<number | null>(null);

  // Form states
  const [namaPeserta, setNamaPeserta] = useState('');
  const [targetHewan, setTargetHewan] = useState('');
  const [targetNominal, setTargetNominal] = useState('');
  const [status, setStatus] = useState('aktif');

  const [tanggalSetoran, setTanggalSetoran] = useState(new Date().toISOString().split('T')[0]);
  const [nominalSetoran, setNominalSetoran] = useState('');
  const [keteranganSetoran, setKeteranganSetoran] = useState('');

  useEffect(() => {
    fetchMasjid();
  }, []);

  useEffect(() => {
    if (selectedMasjid) {
      fetchTabungan();
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

  const fetchTabungan = async () => {
    if (!selectedMasjid) return;
    setLoading(true);
    try {
      const response = await tabunganQurbanAPI.getAll(selectedMasjid);
      setTabunganList(response.data);
    } catch (error) {
      console.error('Error fetching tabungan:', error);
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

  const submitTabungan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMasjid) return;

    try {
      const payload = {
        nama_peserta: namaPeserta,
        target_hewan: targetHewan,
        target_nominal: parseFloat(targetNominal) || 0,
        status,
        MasjidId: selectedMasjid
      };

      if (editingTabunganId) {
        await tabunganQurbanAPI.update(editingTabunganId, payload);
      } else {
        await tabunganQurbanAPI.create(payload);
      }
      setIsTabunganModalOpen(false);
      fetchTabungan();
    } catch (error) {
      console.error('Error saving tabungan:', error);
      alert('Gagal menyimpan tabungan');
    }
  };

  const submitSetoran = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTabunganId) return;

    try {
      const payload = {
        TabunganQurbanId: activeTabunganId,
        tanggal: tanggalSetoran,
        nominal: parseFloat(nominalSetoran) || 0,
        keterangan: keteranganSetoran
      };
      await tabunganQurbanAPI.createSetoran(payload);
      setIsSetoranModalOpen(false);
      setNominalSetoran('');
      setKeteranganSetoran('');
      fetchTabungan();
    } catch (error) {
      console.error('Error saving setoran:', error);
      alert('Gagal menambah setoran');
    }
  };

  const deleteTabungan = async (id: number) => {
    if (window.confirm('Yakin ingin menghapus peserta tabungan ini? Riwayat setoran akan ikut terhapus.')) {
      try {
        await tabunganQurbanAPI.delete(id);
        fetchTabungan();
      } catch (error) {
        alert('Gagal menghapus tabungan');
      }
    }
  };

  const getStatusBadge = (s: string) => {
    if (s === 'aktif') return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Aktif Menabung</span>;
    if (s === 'selesai') return <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded">Target Tercapai</span>;
    if (s === 'batal') return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Batal</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <PiggyBank className="text-emerald-500" /> Tabungan Qurban
          </h1>
          <p className="text-slate-500">Kelola cicilan tabungan jamaah untuk qurban</p>
        </div>
        <button
          onClick={() => {
            setEditingTabunganId(null);
            setNamaPeserta('');
            setTargetHewan('');
            setTargetNominal('');
            setStatus('aktif');
            setIsTabunganModalOpen(true);
          }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus size={20} />
          Daftar Peserta Baru
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Peserta</th>
                <th className="px-6 py-4">Target (Rp)</th>
                <th className="px-6 py-4">Terkumpul (Rp)</th>
                <th className="px-6 py-4">Progres</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <div className="loader"></div>
                  </td>
                </tr>
              ) : tabunganList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Belum ada peserta tabungan qurban
                  </td>
                </tr>
              ) : (
                tabunganList.map((t) => {
                  const percent = t.target_nominal > 0 ? Math.min(100, Math.round((t.total_terkumpul / t.target_nominal) * 100)) : 0;
                  return (
                    <React.Fragment key={t.id}>
                      <tr className="border-b border-slate-100 hover:bg-slate-50 group">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800">{t.nama_peserta}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-500">
                              {t.target_hewan ? `Target: ${t.target_hewan}` : 'Tanpa spesifikasi'}
                            </span>
                            {getStatusBadge(t.status)}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-700">{formatCurrency(t.target_nominal)}</td>
                        <td className="px-6 py-4 font-bold text-emerald-600">{formatCurrency(t.total_terkumpul)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-slate-200 rounded-full h-2.5 max-w-[100px]">
                              <div className={`h-2.5 rounded-full ${percent === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${percent}%` }}></div>
                            </div>
                            <span className="text-xs font-medium text-slate-600">{percent}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setActiveTabunganId(t.id);
                                setNominalSetoran('');
                                setKeteranganSetoran('');
                                setIsSetoranModalOpen(true);
                              }}
                              className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                              title="Tambah Setoran"
                            >
                              + Setoran
                            </button>
                            <button
                              onClick={() => {
                                setEditingTabunganId(t.id);
                                setNamaPeserta(t.nama_peserta);
                                setTargetHewan(t.target_hewan || '');
                                setTargetNominal(t.target_nominal > 0 ? t.target_nominal.toString() : '');
                                setStatus(t.status);
                                setIsTabunganModalOpen(true);
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => deleteTabungan(t.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* Sub-row for setoran history, visible only if there are setoran */}
                      {t.setoran && t.setoran.length > 0 && (
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <td colSpan={5} className="px-6 py-3">
                            <div className="flex items-start gap-2 text-xs">
                              <History size={14} className="text-slate-400 mt-0.5" />
                              <div className="flex flex-wrap gap-2">
                                {t.setoran.slice(0, 3).map((s: any) => (
                                  <div key={s.id} className="bg-white px-2 py-1 border border-slate-200 rounded text-slate-600">
                                    <span className="font-medium text-slate-800">{new Date(s.tanggal).toLocaleDateString('id-ID')}</span>: {formatCurrency(s.nominal)}
                                  </div>
                                ))}
                                {t.setoran.length > 3 && (
                                  <div className="bg-slate-100 px-2 py-1 rounded text-slate-500 italic">
                                    +{t.setoran.length - 3} setoran lainnya
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tabungan */}
      {isTabunganModalOpen && (
        <div className="fixed inset-0 bg-slate-900/20  flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">{editingTabunganId ? 'Edit Tabungan' : 'Daftar Peserta Baru'}</h2>
              <button onClick={() => setIsTabunganModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={submitTabungan} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Peserta</label>
                <input type="text" value={namaPeserta} onChange={e => setNamaPeserta(e.target.value)} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Hewan yang Direncanakan</label>
                <input type="text" value={targetHewan} onChange={e => setTargetHewan(e.target.value)} placeholder="Contoh: Sapi (Patungan) / Kambing" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Target Nominal (Rp)</label>
                <input type="number" value={targetNominal} onChange={e => setTargetNominal(e.target.value)} required placeholder="Contoh: 3500000" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
              {editingTabunganId && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                  <CustomSelect value={status} onChange={e => setStatus(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500">
                    <option value="aktif">Aktif Menabung</option>
                    <option value="selesai">Selesai (Target Tercapai)</option>
                    <option value="batal">Batal</option>
                  </CustomSelect>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsTabunganModalOpen(false)} className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 text-white bg-emerald-600 rounded-lg">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Setoran */}
      {isSetoranModalOpen && (
        <div className="fixed inset-0 bg-slate-900/20  flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Catat Setoran Baru</h2>
              <button onClick={() => setIsSetoranModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={submitSetoran} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tanggal</label>
                <input type="date" value={tanggalSetoran} onChange={e => setTanggalSetoran(e.target.value)} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nominal Setoran (Rp)</label>
                <input type="number" value={nominalSetoran} onChange={e => setNominalSetoran(e.target.value)} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Keterangan (Opsional)</label>
                <input type="text" value={keteranganSetoran} onChange={e => setKeteranganSetoran(e.target.value)} placeholder="Contoh: Setoran bulan Maret" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsSetoranModalOpen(false)} className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 text-white bg-emerald-600 rounded-lg">Simpan Setoran</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabunganQurban;
