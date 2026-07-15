import React, { useEffect, useState } from 'react';
import { CustomSelect } from '../../components/CustomSelect';
import { masjidAPI, asetTidakTerbatasAPI, asetTerbatasAPI, kategoriAPI, kasAPI } from '../../services/api';
import { Plus, Loader2, TrendingUp, TrendingDown, X } from 'lucide-react';
import type { Kategori, SumberDana } from '../../types';

const InputTransaksi: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [masjidList, setMasjidList] = useState<any[]>([]);
  const [selectedMasjid, setSelectedMasjid] = useState<number | null>(null);

  // Kategori states
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [showAddKategori, setShowAddKategori] = useState(false);
  const [newKategoriName, setNewKategoriName] = useState('');

  // Sumber Dana states (for Aset Terbatas Pengeluaran)
  const [sumberDanaList, setSumberDanaList] = useState<SumberDana[]>([]);
  const [selectedSumberDana, setSelectedSumberDana] = useState('');

  // Form States
  const [jenisAset, setJenisAset] = useState<'tidak_terbatas' | 'terbatas'>('tidak_terbatas');
  const [tipe, setTipe] = useState<'pemasukan' | 'pengeluaran'>('pemasukan');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [jumlah, setJumlah] = useState('');
  const [selectedKategoriId, setSelectedKategoriId] = useState<number | null>(null);
  const [kasList, setKasList] = useState<any[]>([]);
  const [selectedKasId, setSelectedKasId] = useState<number | null>(null);
  const [uraian, setUraian] = useState('');
  
  // Aset Terbatas specific
  const [tujuanDana, setTujuanDana] = useState('');
  const [namaDonatur, setNamaDonatur] = useState('');
  const [kontakDonatur, setKontakDonatur] = useState('');

  useEffect(() => {
    fetchMasjid();
    fetchKategori();
  }, []);

  useEffect(() => {
    // Fetch kategori when jenis_aset or tipe changes
    fetchKategori();
    
    // Fetch sumber dana when jenisAset is terbatas and tipe is pengeluaran
    if (jenisAset === 'terbatas' && tipe === 'pengeluaran') {
      fetchSumberDana();
    }
  }, [tipe, jenisAset]);

  useEffect(() => {
    // Fetch sumber dana when masjid changes (for aset terbatas pengeluaran)
    if (selectedMasjid) {
      if (jenisAset === 'terbatas' && tipe === 'pengeluaran') {
        fetchSumberDana();
      }
      fetchKas();
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

  const fetchKas = async () => {
    if (!selectedMasjid) return;
    try {
      const response = await kasAPI.getAll(selectedMasjid);
      setKasList(response.data);
      if (response.data.length > 0) {
        setSelectedKasId(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching kas:', error);
    }
  };

  const fetchKategori = async () => {
    try {
      const response = await kategoriAPI.getAll({
        tipe,
        jenis_aset: jenisAset,
        is_active: true
      });
      setKategoriList(response.data);
      
      // Auto-select first kategori
      if (response.data.length > 0) {
        setSelectedKategoriId(response.data[0].id);
      } else {
        setSelectedKategoriId(null);
      }
    } catch (error) {
      console.error('Error fetching kategori:', error);
    }
  };

  const fetchSumberDana = async () => {
    try {
      const response = await asetTerbatasAPI.getSumberDana(selectedMasjid || undefined);
      setSumberDanaList(response.data);
      
      // Auto-select first sumber dana if available
      if (response.data.length > 0) {
        setSelectedSumberDana(response.data[0].tujuan_dana);
      } else {
        setSelectedSumberDana('');
      }
    } catch (error) {
      console.error('Error fetching sumber dana:', error);
      setSumberDanaList([]);
    }
  };

  const handleAddKategori = async () => {
    if (!newKategoriName.trim()) {
      alert('Nama kategori tidak boleh kosong');
      return;
    }

    try {
      const response = await kategoriAPI.create({
        nama_kategori: newKategoriName,
        tipe,
        jenis_aset: jenisAset,
        is_active: true
      });

      // Refresh kategori list
      await fetchKategori();
      
      // Select the newly created kategori
      setSelectedKategoriId(response.data.data.id);
      
      // Reset form
      setNewKategoriName('');
      setShowAddKategori(false);
      
      alert('Kategori berhasil ditambahkan!');
    } catch (error: any) {
      console.error('Error creating kategori:', error);
      alert(error.response?.data?.message || 'Gagal menambahkan kategori');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMasjid) {
      alert('Masjid belum dipilih');
      return;
    }

    if (!selectedKasId) {
      alert('Akun Kas/Bank belum dipilih. Harap buat akun kas terlebih dahulu di menu Buku Kas & Bank.');
      return;
    }

    if (!jumlah || parseFloat(jumlah) <= 0) {
      alert('Jumlah harus lebih dari 0');
      return;
    }

    if (!selectedKategoriId) {
      alert('Kategori belum dipilih');
      return;
    }

    setSubmitting(true);

    try {
      const baseData = {
        tanggal,
        uraian,
        jumlah: parseFloat(jumlah),
        tipe,
        MasjidId: selectedMasjid,
        KategoriId: selectedKategoriId,
        AkunKasId: selectedKasId,
      };

      if (jenisAset === 'tidak_terbatas') {
        await asetTidakTerbatasAPI.create(baseData);
      } else {
        // Aset Terbatas
        let finalTujuanDana = tujuanDana.trim();
        
        // For pengeluaran, use selected sumber dana
        if (tipe === 'pengeluaran') {
          if (!selectedSumberDana) {
            alert('Pilih sumber dana terlebih dahulu');
            setSubmitting(false);
            return;
          }
          finalTujuanDana = selectedSumberDana;
        } else {
          // For pemasukan, tujuanDana must be filled
          if (!finalTujuanDana) {
            alert('Tujuan dana harus diisi untuk Aset Terbatas');
            setSubmitting(false);
            return;
          }
        }

        await asetTerbatasAPI.create({
          ...baseData,
          tujuan_dana: finalTujuanDana,
          nama_donatur: namaDonatur || undefined,
          kontak_donatur: kontakDonatur || undefined,
        });
      }

      alert('Transaksi berhasil disimpan!');
      
      // Reset form
      setJumlah('');
      setUraian('');
      setTujuanDana('');
      setNamaDonatur('');
      setKontakDonatur('');
      setTanggal(new Date().toISOString().split('T')[0]);
      
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'Gagal menyimpan transaksi');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (value: string) => {
    const number = parseFloat(value);
    if (isNaN(number)) return '';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Input Transaksi</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">Tambahkan transaksi pemasukan atau pengeluaran</p>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-xl shadow-md p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">


          {/* Jenis Aset - Radio Button */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Jenis Aset
            </label>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <label className="flex items-start sm:items-center gap-3 px-4 py-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-emerald-500 transition-colors flex-1">
                <input
                  type="radio"
                  name="jenisAset"
                  value="tidak_terbatas"
                  checked={jenisAset === 'tidak_terbatas'}
                  onChange={(e) => setJenisAset(e.target.value as any)}
                  className="w-5 h-5 text-emerald-600 focus:ring-emerald-500 flex-shrink-0 mt-0.5 sm:mt-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800 text-sm md:text-base">Aset Tidak Terbatas</div>
                  <div className="text-xs text-gray-500">Operasional umum masjid</div>
                </div>
              </label>
              
              <label className="flex items-start sm:items-center gap-3 px-4 py-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors flex-1">
                <input
                  type="radio"
                  name="jenisAset"
                  value="terbatas"
                  checked={jenisAset === 'terbatas'}
                  onChange={(e) => setJenisAset(e.target.value as any)}
                  className="w-5 h-5 text-blue-600 focus:ring-blue-500 flex-shrink-0 mt-0.5 sm:mt-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800 text-sm md:text-base">Aset Terbatas</div>
                  <div className="text-xs text-gray-500">Dana dengan tujuan khusus</div>
                </div>
              </label>
            </div>
          </div>

          {/* Tipe Transaksi - Radio Button */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Tipe Transaksi
            </label>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <label className="flex items-start sm:items-center gap-3 px-4 py-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-emerald-500 transition-colors flex-1">
                <input
                  type="radio"
                  name="tipe"
                  value="pemasukan"
                  checked={tipe === 'pemasukan'}
                  onChange={(e) => setTipe(e.target.value as any)}
                  className="w-5 h-5 text-emerald-600 focus:ring-emerald-500 flex-shrink-0"
                />
                <TrendingUp className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div className="font-semibold text-gray-800 text-sm md:text-base">Pemasukan</div>
              </label>
              
              <label className="flex items-center gap-3 px-4 py-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-red-500 transition-colors flex-1">
                <input
                  type="radio"
                  name="tipe"
                  value="pengeluaran"
                  checked={tipe === 'pengeluaran'}
                  onChange={(e) => setTipe(e.target.value as any)}
                  className="w-5 h-5 text-red-600 focus:ring-red-500 flex-shrink-0"
                />
                <TrendingDown className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div className="font-semibold text-gray-800 text-sm md:text-base">Pengeluaran</div>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {/* Akun Kas */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Simpan ke / Ambil dari Kas <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                value={selectedKasId || ''}
                onChange={(e) => setSelectedKasId(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              >
                <option value="">Pilih Kas/Rekening</option>
                {kasList.map(kas => (
                  <option key={kas.id} value={kas.id}>
                    {kas.nama_akun} - Saldo: {formatCurrency(kas.saldo)}
                  </option>
                ))}
              </CustomSelect>
            </div>
            {/* Tanggal */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tanggal
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Jumlah */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Jumlah (Rp)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">Rp</span>
                <input
                  type="number"
                  value={jumlah}
                  onChange={(e) => setJumlah(e.target.value)}
                  required
                  min="0"
                  step="1000"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              {jumlah && (
                <p className="text-xs text-gray-500 mt-1">{formatCurrency(jumlah)}</p>
              )}
            </div>
          </div>

          {/* Kategori with Add New Option */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Kategori
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <CustomSelect
                value={selectedKategoriId || ''}
                onChange={(e) => setSelectedKategoriId(Number(e.target.value))}
                className="flex-1 px-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              >
                <option value="">Pilih Kategori</option>
                {kategoriList.map((kat) => (
                  <option key={kat.id} value={kat.id}>
                    {kat.nama_kategori}
                  </option>
                ))}
              </CustomSelect>
              <button
                type="button"
                onClick={() => setShowAddKategori(!showAddKategori)}
                className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap text-sm md:text-base"
              >
                <Plus className="w-4 h-4" />
                Tambah
              </button>
            </div>

            {/* Add Kategori Modal */}
            {showAddKategori && (
              <div className="mt-3 p-3 md:p-4 border-2 border-green-200 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-green-900 text-sm md:text-base">Tambah Kategori Baru</h4>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddKategori(false);
                      setNewKategoriName('');
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newKategoriName}
                    onChange={(e) => setNewKategoriName(e.target.value)}
                    placeholder="Nama kategori"
                    className="w-full px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>• Jenis Aset: <span className="font-semibold">{jenisAset === 'tidak_terbatas' ? 'Tidak Terbatas' : 'Terbatas'}</span></p>
                    <p>• Tipe: <span className="font-semibold capitalize">{tipe}</span></p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddKategori}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Simpan Kategori
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tujuan Dana / Sumber Dana - Only for Aset Terbatas */}
          {jenisAset === 'terbatas' && (
            <>
              {tipe === 'pemasukan' ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tujuan Dana <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={tujuanDana}
                    onChange={(e) => setTujuanDana(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Contoh: Pembangunan Kubah, Santunan Yatim"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Tujuan spesifik penggunaan dana sesuai dengan donor atau kebutuhan
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sumber Dana <span className="text-red-500">*</span>
                  </label>
                  {sumberDanaList.length > 0 ? (
                    <CustomSelect
                      value={selectedSumberDana}
                      onChange={(e) => setSelectedSumberDana(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Pilih Sumber Dana</option>
                      {sumberDanaList.map((sumber) => (
                        <option key={sumber.tujuan_dana} value={sumber.tujuan_dana}>
                          {sumber.tujuan_dana} - Saldo: {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          }).format(sumber.saldo_tersedia)}
                        </option>
                      ))}
                    </CustomSelect>
                  ) : (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        Tidak ada sumber dana tersedia. Pastikan ada pemasukan dana terbatas terlebih dahulu.
                      </p>
                    </div>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Pilih dana terbatas mana yang akan digunakan untuk pengeluaran ini
                  </p>
                </div>
              )}

              {tipe === 'pemasukan' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nama Donatur (Opsional)
                    </label>
                    <input
                      type="text"
                      value={namaDonatur}
                      onChange={(e) => setNamaDonatur(e.target.value)}
                      className="w-full px-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nama donatur"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Kontak Donatur (Opsional)
                    </label>
                    <input
                      type="text"
                      value={kontakDonatur}
                      onChange={(e) => setKontakDonatur(e.target.value)}
                      className="w-full px-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Email atau No HP"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Uraian */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Keterangan
            </label>
            <textarea
              value={uraian}
              onChange={(e) => setUraian(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Deskripsi detail transaksi..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-2 md:pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-emerald-600 text-white py-2.5 md:py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2 text-sm md:text-base"
            >
              {submitting ? (
                <>
                  <div className="loader"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Simpan Transaksi
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 max-w-3xl mx-auto">
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 md:p-4">
          <h3 className="font-semibold text-emerald-800 mb-2 text-sm md:text-base">Aset Tidak Terbatas</h3>
          <p className="text-xs md:text-sm text-emerald-700">
            Dana untuk operasional umum masjid seperti listrik, air, honor imam, dan kegiatan rutin.
          </p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
          <h3 className="font-semibold text-blue-800 mb-2 text-sm md:text-base">Aset Terbatas</h3>
          <p className="text-xs md:text-sm text-blue-700">
            Dana dengan tujuan khusus seperti pembangunan, santunan yatim, atau program tertentu yang sudah ditentukan donatur.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InputTransaksi;
