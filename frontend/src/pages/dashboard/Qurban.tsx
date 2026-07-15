import React, { useState, useEffect } from 'react';
import { CustomSelect } from '../../components/CustomSelect';
import { masjidAPI, qurbanAPI } from '../../services/api';
import { Plus, Trash2, Loader2, Users } from 'lucide-react';

const Qurban: React.FC = () => {
  const [masjidList, setMasjidList] = useState<any[]>([]);
  const [selectedMasjid, setSelectedMasjid] = useState<number | null>(null);
  
  const currentYear = new Date().getFullYear();
  const hijriYearGuess = currentYear - 579;
  const [tahunHijriah, setTahunHijriah] = useState(`${hijriYearGuess} H`);
  
  const [hewanList, setHewanList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isHewanModalOpen, setIsHewanModalOpen] = useState(false);
  const [isPesertaModalOpen, setIsPesertaModalOpen] = useState(false);
  const [editingHewanId, setEditingHewanId] = useState<number | null>(null);
  const [activeHewanId, setActiveHewanId] = useState<number | null>(null);

  // Form states
  const [jenisHewan, setJenisHewan] = useState('sapi');
  const [tipeHewan, setTipeHewan] = useState('patungan');
  const [hargaHewan, setHargaHewan] = useState('');
  const [statusHewan, setStatusHewan] = useState('rencana');

  const [namaShohibul, setNamaShohibul] = useState('');
  const [alamatShohibul, setAlamatShohibul] = useState('');
  const [jumlahPatungan, setJumlahPatungan] = useState('');

  useEffect(() => {
    fetchMasjid();
  }, []);

  useEffect(() => {
    if (selectedMasjid) {
      fetchHewan();
    }
  }, [selectedMasjid, tahunHijriah]);

  const fetchMasjid = async () => {
    try {
      const response = await masjidAPI.getAll();
      setMasjidList(response.data);
      if (response.data.length > 0) setSelectedMasjid(response.data[0].id);
    } catch (error) {
      console.error('Error fetching masjid:', error);
    }
  };

  const fetchHewan = async () => {
    if (!selectedMasjid) return;
    setLoading(true);
    try {
      const response = await qurbanAPI.getAllHewan(selectedMasjid, tahunHijriah);
      setHewanList(response.data);
    } catch (error) {
      console.error('Error fetching hewan:', error);
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

  const submitHewan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMasjid) return;

    try {
      const payload = {
        tahun_hijriah: tahunHijriah,
        jenis_hewan: jenisHewan,
        tipe: tipeHewan,
        harga: parseFloat(hargaHewan) || 0,
        status: statusHewan,
        MasjidId: selectedMasjid
      };

      if (editingHewanId) {
        await qurbanAPI.updateHewan(editingHewanId, payload);
      } else {
        await qurbanAPI.createHewan(payload);
      }
      setIsHewanModalOpen(false);
      setEditingHewanId(null);
      fetchHewan();
    } catch (error) {
      console.error('Error saving hewan:', error);
      alert('Gagal menyimpan hewan qurban');
    }
  };

  const submitPeserta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeHewanId) return;

    try {
      const payload = {
        nama_shohibul: namaShohibul,
        alamat: alamatShohibul,
        jumlah_patungan: parseFloat(jumlahPatungan) || 0,
        QurbanHewanId: activeHewanId
      };
      await qurbanAPI.createPeserta(payload);
      setIsPesertaModalOpen(false);
      setNamaShohibul('');
      setAlamatShohibul('');
      setJumlahPatungan('');
      fetchHewan();
    } catch (error) {
      console.error('Error saving peserta:', error);
      alert('Gagal menambah peserta qurban');
    }
  };

  const deleteHewan = async (id: number) => {
    if (window.confirm('Yakin ingin menghapus hewan ini beserta semua pesertanya?')) {
      try {
        await qurbanAPI.deleteHewan(id);
        fetchHewan();
      } catch (error) {
        alert('Gagal menghapus hewan');
      }
    }
  };

  const deletePeserta = async (id: number) => {
    if (window.confirm('Yakin ingin menghapus peserta ini?')) {
      try {
        await qurbanAPI.deletePeserta(id);
        fetchHewan();
      } catch (error) {
        alert('Gagal menghapus peserta');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'rencana') return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Rencana</span>;
    if (status === 'terbeli') return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Terbeli</span>;
    if (status === 'disembelih') return <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded">Disembelih</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Qurban</h1>
          <p className="text-slate-500">Kelola hewan qurban dan data shohibul qurban (pekurban)</p>
        </div>
        <button
          onClick={() => {
            setEditingHewanId(null);
            setJenisHewan('sapi');
            setTipeHewan('patungan');
            setHargaHewan('');
            setStatusHewan('rencana');
            setIsHewanModalOpen(true);
          }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus size={20} />
          Tambah Hewan Qurban
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-slate-700 text-sm">Tahun Hijriah:</label>
          <input
            type="text"
            value={tahunHijriah}
            onChange={(e) => setTahunHijriah(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="loader"></div>
        </div>
      ) : hewanList.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-500">
          Belum ada data hewan qurban untuk tahun {tahunHijriah}.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {hewanList.map(hewan => {
            const maxPeserta = hewan.jenis_hewan === 'sapi' && hewan.tipe === 'patungan' ? 7 : 1;
            const pesertaCount = hewan.peserta.length;
            const isFull = pesertaCount >= maxPeserta;
            
            return (
              <div key={hewan.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-slate-800 capitalize">
                        {hewan.jenis_hewan} {hewan.tipe === 'patungan' ? '(Patungan)' : '(Sendiri)'}
                      </h3>
                      {getStatusBadge(hewan.status)}
                    </div>
                    <p className="text-sm text-slate-500">Harga: {formatCurrency(hewan.harga)}</p>
                  </div>
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <button
                      onClick={() => {
                        setEditingHewanId(hewan.id);
                        setJenisHewan(hewan.jenis_hewan);
                        setTipeHewan(hewan.tipe);
                        setHargaHewan(hewan.harga);
                        setStatusHewan(hewan.status);
                        setIsHewanModalOpen(true);
                      }}
                      className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex-1 md:flex-none text-center"
                    >
                      Edit Hewan
                    </button>
                    <button
                      onClick={() => deleteHewan(hewan.id)}
                      className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex-1 md:flex-none text-center"
                    >
                      Hapus
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                      <Users size={18} className="text-slate-400" />
                      Daftar Shohibul Qurban ({pesertaCount}/{maxPeserta})
                    </h4>
                    {!isFull && (
                      <button
                        onClick={() => {
                          setActiveHewanId(hewan.id);
                          setNamaShohibul('');
                          setAlamatShohibul('');
                          setJumlahPatungan('');
                          setIsPesertaModalOpen(true);
                        }}
                        className="text-sm bg-slate-800 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700"
                      >
                        + Tambah Peserta
                      </button>
                    )}
                  </div>

                  {pesertaCount === 0 ? (
                    <div className="text-sm text-slate-500 italic bg-slate-50 p-4 rounded-lg text-center">
                      Belum ada peserta terdaftar
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {hewan.peserta.map((p: any, idx: number) => (
                        <div key={p.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                              {idx + 1}
                            </span>
                            <div>
                              <p className="font-semibold text-slate-800 text-sm">{p.nama_shohibul}</p>
                              <p className="text-xs text-slate-500">{p.alamat || '-'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {hewan.tipe === 'patungan' && (
                              <span className="text-sm font-medium text-emerald-600">{formatCurrency(p.jumlah_patungan)}</span>
                            )}
                            <button
                              onClick={() => deletePeserta(p.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Hewan */}
      {isHewanModalOpen && (
        <div className="fixed inset-0 bg-slate-900/20  flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">{editingHewanId ? 'Edit Hewan' : 'Tambah Hewan Qurban'}</h2>
              <button onClick={() => setIsHewanModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={submitHewan} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Jenis Hewan</label>
                <CustomSelect value={jenisHewan} onChange={e => setJenisHewan(e.target.value)} className="w-full p-2 border rounded-lg">
                  <option value="sapi">Sapi</option>
                  <option value="kambing">Kambing</option>
                  <option value="domba">Domba</option>
                </CustomSelect>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tipe Qurban</label>
                <CustomSelect value={tipeHewan} onChange={e => setTipeHewan(e.target.value)} className="w-full p-2 border rounded-lg">
                  <option value="patungan">Patungan (Maks 7 untuk Sapi)</option>
                  <option value="sendiri">Sendiri (1 Orang)</option>
                </CustomSelect>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Harga Estimasi/Asli (Rp)</label>
                <input type="number" value={hargaHewan} onChange={e => setHargaHewan(e.target.value)} required className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                <CustomSelect value={statusHewan} onChange={e => setStatusHewan(e.target.value)} className="w-full p-2 border rounded-lg">
                  <option value="rencana">Rencana / Sedang Kumpul Dana</option>
                  <option value="terbeli">Sudah Terbeli</option>
                  <option value="disembelih">Sudah Disembelih</option>
                </CustomSelect>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsHewanModalOpen(false)} className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 text-white bg-emerald-600 rounded-lg">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Peserta */}
      {isPesertaModalOpen && (
        <div className="fixed inset-0 bg-slate-900/20  flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Tambah Peserta Qurban</h2>
              <button onClick={() => setIsPesertaModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={submitPeserta} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Shohibul Qurban (Pekurban)</label>
                <input type="text" value={namaShohibul} onChange={e => setNamaShohibul(e.target.value)} required className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Alamat Lengkap</label>
                <textarea value={alamatShohibul} onChange={e => setAlamatShohibul(e.target.value)} rows={2} className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nominal Uang Patungan (Rp)</label>
                <input type="number" value={jumlahPatungan} onChange={e => setJumlahPatungan(e.target.value)} required className="w-full p-2 border rounded-lg" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsPesertaModalOpen(false)} className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 text-white bg-emerald-600 rounded-lg">Tambah</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Qurban;
