import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DashboardHome from './pages/dashboard/DashboardHome';
import InputTransaksi from './pages/dashboard/InputTransaksi';
import AsetTidakTerbatas from './pages/dashboard/AsetTidakTerbatas';
import Jamaah from './pages/dashboard/Jamaah';
import Zakat from './pages/dashboard/Zakat';
import Qurban from './pages/dashboard/Qurban';
import TabunganQurban from './pages/dashboard/TabunganQurban';
import Agenda from './pages/dashboard/Agenda';
import Pengumuman from './pages/dashboard/Pengumuman';
import Inventaris from './pages/dashboard/Inventaris';
import Laporan from './pages/dashboard/Laporan';
import Pengaturan from './pages/dashboard/Pengaturan';
import JadwalShalat from './pages/dashboard/JadwalShalat';
import AturKas from './pages/dashboard/AturKas';
import PublicMasjidPage from './pages/PublicMasjidPage';
import PublicTransparencyPage from './pages/PublicTransparencyPage';
import PublicKasPage from './pages/PublicKasPage';
import { Loader2 } from 'lucide-react';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const RoleProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles: string[] }> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/transparansi" replace />} />
      <Route path="/transparansi" element={<PublicTransparencyPage />} />
      <Route path="/kas/:masjidId" element={<PublicKasPage />} />

      {/* Hanya user login yang boleh akses halaman masjid */}
      <Route
        path="/masjid/:masjidId"
        element={
          <ProtectedRoute>
            <PublicMasjidPage />
          </ProtectedRoute>
        }
      />
      
      {/* Auth Routes */}
      <Route path="/masuk" element={<Navigate to="/login" replace />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      
      {/* Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        {/* Utama */}
        <Route path="kas" element={<RoleProtectedRoute allowedRoles={['takmir', 'bendahara']}><AturKas /></RoleProtectedRoute>} />
        <Route path="keuangan" element={<RoleProtectedRoute allowedRoles={['takmir', 'bendahara']}><InputTransaksi /></RoleProtectedRoute>} />
        <Route path="keropak" element={<RoleProtectedRoute allowedRoles={['takmir', 'bendahara']}><AsetTidakTerbatas /></RoleProtectedRoute>} />
        <Route path="laporan" element={<RoleProtectedRoute allowedRoles={['takmir', 'bendahara']}><Laporan /></RoleProtectedRoute>} />
        <Route path="jadwal-shalat" element={<RoleProtectedRoute allowedRoles={['takmir', 'bendahara', 'jamaah']}><JadwalShalat /></RoleProtectedRoute>} />
        
        {/* Jamaah & Program */}
        <Route path="jamaah" element={<RoleProtectedRoute allowedRoles={['takmir']}><Jamaah /></RoleProtectedRoute>} />
        <Route path="zakat" element={<RoleProtectedRoute allowedRoles={['takmir', 'bendahara']}><Zakat /></RoleProtectedRoute>} />
        <Route path="qurban" element={<RoleProtectedRoute allowedRoles={['takmir', 'bendahara']}><Qurban /></RoleProtectedRoute>} />
        <Route path="tabungan-qurban" element={<RoleProtectedRoute allowedRoles={['takmir', 'bendahara']}><TabunganQurban /></RoleProtectedRoute>} />

        {/* Masjid */}
        <Route path="agenda" element={<RoleProtectedRoute allowedRoles={['takmir']}><Agenda /></RoleProtectedRoute>} />
        <Route path="pengumuman" element={<RoleProtectedRoute allowedRoles={['takmir']}><Pengumuman /></RoleProtectedRoute>} />
        <Route path="inventaris" element={<RoleProtectedRoute allowedRoles={['takmir']}><Inventaris /></RoleProtectedRoute>} />
        <Route path="pengaturan" element={<RoleProtectedRoute allowedRoles={['takmir']}><Pengaturan /></RoleProtectedRoute>} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

