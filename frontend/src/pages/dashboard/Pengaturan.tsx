import React, { useEffect, useState } from 'react';
import { CustomSelect } from '../../components/CustomSelect';
import { masjidAPI } from '../../services/api';
import { Loader2, Save, Building2, Clock, User, MapPin, Phone, Mail, Megaphone } from 'lucide-react';

interface MasjidSettings {
  id: number;
  nama_masjid: string;
  alamat: string;
  telepon: string;
  email: string;
  koordinat: string;
  ketua_pengurus: string;
  countdown_duration: number; // in seconds
  announcements?: string;
}

const Pengaturan: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [masjidList, setMasjidList] = useState<any[]>([]);
  const [selectedMasjidId, setSelectedMasjidId] = useState<number | null>(null);
  const [settings, setSettings] = useState<MasjidSettings>({
    id: 0,
    nama_masjid: '',
    alamat: '',
    telepon: '',
    email: '',
    koordinat: '',
    ketua_pengurus: '',
    countdown_duration: 600, // default 10 minutes
    announcements: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchMasjidList();
  }, []);

  useEffect(() => {
    if (selectedMasjidId) {
      fetchMasjidSettings(selectedMasjidId);
    }
  }, [selectedMasjidId]);

  const fetchMasjidList = async () => {
    try {
      setLoading(true);
      const response = await masjidAPI.getAll();
      const masjids = response.data;
      setMasjidList(masjids);
      if (masjids.length > 0) {
        setSelectedMasjidId(masjids[0].id);
      }
    } catch (error) {
      console.error('Error fetching masjid list:', error);
      setError('Gagal memuat daftar masjid.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMasjidSettings = async (masjidId: number) => {
    try {
      setLoading(true);
      const response = await masjidAPI.getById(masjidId);
      const data = response.data;
      setSettings({
        id: data.id,
        nama_masjid: data.nama_masjid || '',
        alamat: data.alamat || '',
        telepon: data.telepon || '',
        email: data.email || '',
        koordinat: data.koordinat || '',
        ketua_pengurus: data.ketua_pengurus || '',
        countdown_duration: data.countdown_duration || 600,
        announcements: data.announcements || '',
      });
    } catch (error) {
      console.error('Error fetching masjid settings:', error);
      setError('Gagal memuat pengaturan masjid.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: name === 'countdown_duration' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await masjidAPI.update(settings.id, settings);
      setSuccess('Pengaturan berhasil disimpan!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Error saving settings:', error);
      setError(error.response?.data?.message || 'Gagal menyimpan pengaturan.');
    } finally {
      setSaving(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} menit ${secs} detik`;
  };

  if (loading && !settings.id) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Pengaturan Masjid</h1>
        <p className="text-sm md:text-base text-slate-600 mt-1">
          Kelola informasi masjid, countdown iqomah, dan ketua pengurus
        </p>
      </div>

      {/* Masjid Selector */}


      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
          {success}
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informasi Masjid */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Building2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Informasi Masjid</h2>
              <p className="text-xs text-slate-500">Data masjid yang ditampilkan di halaman publik</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nama Masjid
              </label>
              <input
                type="text"
                name="nama_masjid"
                value={settings.nama_masjid}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Contoh: Masjid Al-Ikhlas"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Alamat Lengkap
              </label>
              <textarea
                name="alamat"
                value={settings.alamat}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Alamat lengkap masjid"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  name="telepon"
                  value={settings.telepon}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="08123456789"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={settings.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="masjid@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Koordinat (Opsional)
              </label>
              <input
                type="text"
                name="koordinat"
                value={settings.koordinat}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Contoh: -5.1477, 119.4327"
              />
              <p className="text-xs text-slate-500 mt-1">Format: latitude, longitude</p>
            </div>
          </div>
        </div>

        {/* Countdown Iqomah */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Durasi Countdown Iqomah</h2>
              <p className="text-xs text-slate-500">Waktu hitung mundur sebelum iqomah dimulai</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Durasi (dalam detik)
              </label>
              <input
                type="number"
                name="countdown_duration"
                value={settings.countdown_duration}
                onChange={handleInputChange}
                min="60"
                max="1800"
                step="30"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-slate-500">
                  Durasi saat ini: <span className="font-semibold text-slate-700">{formatDuration(settings.countdown_duration)}</span>
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSettings(prev => ({ ...prev, countdown_duration: 300 }))}
                    className="text-xs px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg"
                  >
                    5 menit
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettings(prev => ({ ...prev, countdown_duration: 600 }))}
                    className="text-xs px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg"
                  >
                    10 menit
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettings(prev => ({ ...prev, countdown_duration: 900 }))}
                    className="text-xs px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg"
                  >
                    15 menit
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Pengumuman Marquee */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Megaphone className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Pengumuman Berjalan</h2>
                <p className="text-xs text-slate-500">Tampilkan teks berjalan di halaman publik (gunakan baris baru untuk pengumuman berbeda)</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Daftar Pengumuman
              </label>
              <textarea
                name="announcements"
                value={settings.announcements || ''}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder={`Contoh:\n📢 Pengajian rutin setiap malam Jumat\n🤲 Infaq bisa via rekening BSI 123xxxx`}
              />
              <p className="text-xs text-slate-500">Pisahkan setiap pengumuman dengan baris baru. Emotikon/emoji akan ikut ditampilkan.</p>
            </div>
          </div>
        </div>

        {/* Ketua Pengurus */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Ketua Pengurus Masjid</h2>
              <p className="text-xs text-slate-500">Nama yang akan ditampilkan di laporan keuangan</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nama Lengkap Ketua Pengurus
              </label>
              <input
                type="text"
                name="ketua_pengurus"
                value={settings.ketua_pengurus}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Contoh: H. Ahmad Yani, S.Pd"
              />
              <p className="text-xs text-slate-500 mt-1">
                Nama ini akan muncul di bagian tanda tangan laporan keuangan
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {saving ? (
              <>
                <div className="loader"></div>
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Simpan Pengaturan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Pengaturan;
