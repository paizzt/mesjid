import axios from 'axios';

// Use env for deploy; fallback to relative /api so it works on Vercel with backend proxy
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:4000/api'
    : '/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => {
    // Prevent React WSOD if a proxy/server incorrectly returns an HTML string for an API call
    if (typeof response.data === 'string' && response.data.trim().toLowerCase().startsWith('<!doctype html>')) {
      console.error('API returned HTML instead of JSON. Check proxy or server routing.');
      return Promise.reject(new Error('API returned HTML instead of JSON.'));
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  getPendingUsers: () => api.get('/auth/users/pending'),
  getAllUsers: () => api.get('/auth/users'),
  verifyUser: (userId: number, data: any) => api.put(`/auth/users/${userId}/verify`, data),
};

export const masjidAPI = {
  getAll: () => api.get('/masjid'),
  getById: (id: number) => api.get(`/masjid/${id}`),
  create: (data: any) => api.post('/masjid', data),
  update: (id: number, data: any) => api.put(`/masjid/${id}`, data),
  delete: (id: number) => api.delete(`/masjid/${id}`),
};

export const jamaahAPI = {
  getAll: (masjid_id?: number) => api.get('/jamaah', { params: { masjid_id } }),
  create: (data: any) => api.post('/jamaah', data),
  update: (id: number, data: any) => api.put(`/jamaah/${id}`, data),
  delete: (id: number) => api.delete(`/jamaah/${id}`),
};

export const zakatAPI = {
  getAll: (masjid_id?: number, tahun_hijriah?: string) => api.get('/zakat', { params: { masjid_id, tahun_hijriah } }),
  create: (data: any) => api.post('/zakat', data),
  update: (id: number, data: any) => api.put(`/zakat/${id}`, data),
  delete: (id: number) => api.delete(`/zakat/${id}`),
};

export const qurbanAPI = {
  getAllHewan: (masjid_id?: number, tahun_hijriah?: string) => api.get('/qurban/hewan', { params: { masjid_id, tahun_hijriah } }),
  createHewan: (data: any) => api.post('/qurban/hewan', data),
  updateHewan: (id: number, data: any) => api.put(`/qurban/hewan/${id}`, data),
  deleteHewan: (id: number) => api.delete(`/qurban/hewan/${id}`),
  createPeserta: (data: any) => api.post('/qurban/peserta', data),
  deletePeserta: (id: number) => api.delete(`/qurban/peserta/${id}`),
};

export const tabunganQurbanAPI = {
  getAll: (masjid_id?: number) => api.get('/tabungan-qurban', { params: { masjid_id } }),
  create: (data: any) => api.post('/tabungan-qurban', data),
  update: (id: number, data: any) => api.put(`/tabungan-qurban/${id}`, data),
  delete: (id: number) => api.delete(`/tabungan-qurban/${id}`),
  createSetoran: (data: any) => api.post('/tabungan-qurban/setoran', data),
};

export const agendaAPI = {
  getAll: (masjid_id?: number) => api.get('/agenda', { params: { masjid_id } }),
  create: (data: any) => api.post('/agenda', data),
  update: (id: number, data: any) => api.put(`/agenda/${id}`, data),
  delete: (id: number) => api.delete(`/agenda/${id}`),
};

export const pengumumanAPI = {
  getAll: (masjid_id?: number) => api.get('/pengumuman', { params: { masjid_id } }),
  create: (data: any) => api.post('/pengumuman', data),
  update: (id: number, data: any) => api.put(`/pengumuman/${id}`, data),
  delete: (id: number) => api.delete(`/pengumuman/${id}`),
};

export const inventarisAPI = {
  getAll: (masjid_id?: number) => api.get('/inventaris', { params: { masjid_id } }),
  create: (data: any) => api.post('/inventaris', data),
  update: (id: number, data: any) => api.put(`/inventaris/${id}`, data),
  delete: (id: number) => api.delete(`/inventaris/${id}`),
};

export const kategoriAPI = {
  getAll: (params?: { tipe?: string; jenis_aset?: string; is_active?: boolean }) => 
    api.get('/kategori', { params }),
  getById: (id: number) => api.get(`/kategori/${id}`),
  create: (data: any) => api.post('/kategori', data),
  update: (id: number, data: any) => api.put(`/kategori/${id}`, data),
  delete: (id: number) => api.delete(`/kategori/${id}`),
  hardDelete: (id: number) => api.delete(`/kategori/${id}/hard`),
};

export const asetTidakTerbatasAPI = {
  getAll: (masjidId?: number) => api.get('/aset-tidak-terbatas', { params: { masjid_id: masjidId } }),
  getById: (id: number) => api.get(`/aset-tidak-terbatas/${id}`),
  create: (data: any) => api.post('/aset-tidak-terbatas', data),
  update: (id: number, data: any) => api.put(`/aset-tidak-terbatas/${id}`, data),
  delete: (id: number) => api.delete(`/aset-tidak-terbatas/${id}`),
  getSaldo: (masjidId?: number) => api.get('/aset-tidak-terbatas/saldo', { params: { masjid_id: masjidId } }),
};

export const asetTerbatasAPI = {
  getAll: (masjid_id?: number) => api.get('/aset-terbatas', { params: { masjid_id } }),
  create: (data: any) => api.post('/aset-terbatas', data),
  getLaporan: (masjid_id?: number) => api.get('/aset-terbatas/laporan', { params: { masjid_id } }),
  getLaporanPerTujuan: (masjid_id?: number) => api.get('/aset-terbatas/laporan/tujuan', { params: { masjid_id } }),
  getSumberDana: (masjid_id?: number) => api.get('/aset-terbatas/sumber-dana', { params: { masjid_id } }),
  delete: (id: number) => api.delete(`/aset-terbatas/${id}`),
};

export const kasAPI = {
  getAll: (masjidId: number) => api.get(`/kas/masjid/${masjidId}`),
  create: (masjidId: number, data: any) => api.post(`/kas/masjid/${masjidId}`, data),
  update: (id: number, data: any) => api.put(`/kas/${id}`, data),
  delete: (id: number) => api.delete(`/kas/${id}`),
  transfer: (data: any) => api.post('/kas/transfer', data),
};

export const laporanAPI = {
  getLaporanKeuangan: (params: {
    masjid_id: number;
    period?: 'weekly' | 'monthly' | 'yearly';
    month?: number;
    year?: number;
    week_date?: string;
  }) => api.get('/laporan', { params }),
};

export default api;
