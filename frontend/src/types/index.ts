export interface User {
  id: number;
  username: string;
  email: string;
  nama_lengkap: string;
  no_hp?: string;
  role: 'admin' | 'takmir' | 'user';
  status_verifikasi: 'pending' | 'approved' | 'rejected';
  catatan_admin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Masjid {
  id: number;
  nama_masjid: string;
  alamat: string;
  koordinat?: string;
  UserId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Kategori {
  id: number;
  nama_kategori: string;
  tipe: 'pemasukan' | 'pengeluaran';
  jenis_aset: 'terbatas' | 'tidak_terbatas' | 'semua';
  deskripsi?: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AsetTidakTerbatas {
  id: number;
  tanggal: string;
  uraian: string;
  jumlah: number;
  tipe: 'pemasukan' | 'pengeluaran';
  kategori: string;
  KategoriId?: number;
  MasjidId: number;
  Kategori?: Kategori;
  createdAt: string;
  updatedAt: string;
}

export interface AsetTerbatas {
  id: number;
  tanggal: string;
  uraian: string;
  jumlah: number;
  tipe: 'pemasukan' | 'pengeluaran';
  tujuan_dana: string;
  nama_donatur?: string;
  kontak_donatur?: string;
  KategoriId?: number;
  MasjidId: number;
  Kategori?: Kategori;
  createdAt: string;
  updatedAt: string;
}

export interface SaldoResponse {
  pemasukan: number;
  pengeluaran: number;
  saldo_akhir: number;
}

export interface LaporanTujuan {
  tujuan_dana: string;
  total_pemasukan: number;
  total_pengeluaran: number;
  saldo_tersisa: number;
}

export interface SumberDana {
  tujuan_dana: string;
  saldo_tersedia: number;
}
