import React, { useEffect, useState } from 'react';
import { authAPI } from '../../services/api';
import { CheckCircle2, XCircle, Loader2, Clock, MapPin, Building as Mosque } from 'lucide-react';
import { type User } from '../../types';

const Verifikasi: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [catatan, setCatatan] = useState('');
  const [verifikasiType, setVerifikasiType] = useState<'approved' | 'rejected'>('approved');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await authAPI.getPendingUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifikasi = async () => {
    if (!selectedUser) return;

    try {
      await authAPI.verifyUser(selectedUser.id, {
        status: verifikasiType,
        catatan_admin: catatan,
      });
      setShowModal(false);
      setCatatan('');
      setSelectedUser(null);
      fetchUsers();
      alert(`User berhasil ${verifikasiType === 'approved' ? 'disetujui' : 'ditolak'}`);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal memverifikasi user');
    }
  };

  const openModal = (user: User, type: 'approved' | 'rejected') => {
    setSelectedUser(user);
    setVerifikasiType(type);
    setShowModal(true);
  };

  if (loading) {
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
        <h1 className="text-3xl font-bold text-gray-800">Verifikasi User</h1>
        <p className="text-gray-600 mt-1">Kelola permohonan registrasi user baru</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Menunggu Verifikasi</p>
              <p className="text-3xl font-bold text-orange-600">{users.length}</p>
            </div>
            <Clock className="w-10 h-10 text-orange-600" />
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(user => (
          <div key={user.id} className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-emerald-600 p-4">
              <div className="flex items-center gap-3 text-white">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold">{user.nama_lengkap[0]}</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">{user.nama_lengkap}</h3>
                  <p className="text-sm opacity-90">@{user.username}</p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-start gap-2 text-sm">
                <span className="text-gray-500 w-20">Email:</span>
                <span className="text-gray-800 flex-1">{user.email}</span>
              </div>

              {user.no_hp && (
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-gray-500 w-20">No HP:</span>
                  <span className="text-gray-800 flex-1">{user.no_hp}</span>
                </div>
              )}

              <div className="flex items-start gap-2 text-sm">
                <span className="text-gray-500 w-20">Role:</span>
                <span className="text-gray-800 flex-1 capitalize">{user.role}</span>
              </div>

              {(user as any).Masjids && (user as any).Masjids.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <Mosque className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-semibold text-gray-700">Data Masjid:</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 mb-1">
                    {(user as any).Masjids[0].nama_masjid}
                  </p>
                  <div className="flex items-start gap-1 text-xs text-gray-600">
                    <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>{(user as any).Masjids[0].alamat}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-3">
                <button
                  onClick={() => openModal(user, 'approved')}
                  className="flex-1 bg-emerald-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-semibold">Setuju</span>
                </button>
                <button
                  onClick={() => openModal(user, 'rejected')}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-red-700 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  <span className="text-sm font-semibold">Tolak</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Tidak ada user yang menunggu verifikasi</p>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/20  flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {verifikasiType === 'approved' ? 'Setujui' : 'Tolak'} User
            </h2>
            <p className="text-gray-600 mb-4">
              Anda akan {verifikasiType === 'approved' ? 'menyetujui' : 'menolak'} registrasi{' '}
              <strong>{selectedUser.nama_lengkap}</strong>
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catatan {verifikasiType === 'approved' ? '(Opsional)' : '(Wajib)'}
              </label>
              <textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                rows={3}
                required={verifikasiType === 'rejected'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Tulis catatan atau alasan..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleVerifikasi}
                disabled={verifikasiType === 'rejected' && !catatan.trim()}
                className={`flex-1 py-2 rounded-lg font-semibold text-white ${
                  verifikasiType === 'approved'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:bg-gray-400`}
              >
                Konfirmasi
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setCatatan('');
                  setSelectedUser(null);
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Verifikasi;
