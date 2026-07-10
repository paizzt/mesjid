import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Building as Mosque,
  LayoutDashboard,
  Wallet,
  Target,
  Users,
  LogOut,
  Menu,
  X,
  ChevronDown,
  FileInput,
  FileText,
  Settings,
  Clock,
  Box,
  PiggyBank
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default false for mobile
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    // Auto-open sidebar on desktop
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuSections = [
    {
      title: 'UTAMA',
      items: [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Ringkasan', roles: ['takmir', 'bendahara', 'jamaah'] },
        { path: '/dashboard/kas', icon: Wallet, label: 'Buku Kas & Bank', roles: ['takmir', 'bendahara'] },
        { path: '/dashboard/keuangan', icon: FileInput, label: 'Catat Transaksi', roles: ['takmir', 'bendahara'] },
        { path: '/dashboard/laporan', icon: FileText, label: 'Laporan (ISAK 35)', roles: ['takmir', 'bendahara'] },
        { path: '/dashboard/jadwal-shalat', icon: Clock, label: 'Jadwal Shalat', roles: ['takmir', 'bendahara', 'jamaah'] },
      ]
    },
    {
      title: 'JAMAAH & PROGRAM',
      items: [
        { path: '/dashboard/jamaah', icon: Users, label: 'Jamaah', roles: ['takmir'] },
        { path: '/dashboard/zakat', icon: Target, label: 'Penerimaan Zakat', roles: ['takmir', 'bendahara'] },
        { path: '/dashboard/qurban', icon: Box, label: 'Manajemen Qurban', roles: ['takmir', 'bendahara'] },
        { path: '/dashboard/tabungan-qurban', icon: PiggyBank, label: 'Tabungan Qurban', roles: ['takmir', 'bendahara'] },
      ]
    },
    {
      title: 'MASJID',
      items: [
        { path: '/dashboard/agenda', icon: Mosque, label: 'Agenda & Kajian', roles: ['takmir'] },
        { path: '/dashboard/pengumuman', icon: FileInput, label: 'Pengumuman', roles: ['takmir'] },
        { path: '/dashboard/inventaris', icon: Target, label: 'Inventaris', roles: ['takmir'] },
        { path: '/dashboard/pengaturan', icon: Settings, label: 'Pengaturan', roles: ['takmir'] },
      ]
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Header */}
      <div className="md:hidden bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Mosque className="w-6 h-6 text-emerald-600" />
          <span className="font-bold text-lg text-slate-800">SIM Masjid</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 flex flex-col shadow-xl`}
      >
        {/* Logo - Desktop Only */}
        <div className="hidden md:flex p-6 items-center gap-2 border-b border-slate-800">
          <Mosque className="w-8 h-8 text-emerald-400" />
          <span className="font-bold text-lg">SIM Masjid</span>
        </div>

        {/* Close button for mobile */}
        <div className="md:hidden p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Mosque className="w-8 h-8 text-emerald-400" />
            <span className="font-bold text-lg">SIM Masjid</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
          {menuSections.map((section, sIdx) => {
            const visibleItems = section.items.filter(item => item.roles.includes(user?.role || 'jamaah'));
            if (visibleItems.length === 0) return null;

            return (
              <div key={sIdx}>
                <h3 className="px-4 text-xs font-semibold text-emerald-400/70 tracking-wider mb-2">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {visibleItems.map(item => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => {
                          if (window.innerWidth < 768) setIsSidebarOpen(false);
                        }}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-800">
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-full flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold">
                  {user.nama_lengkap[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.nama_lengkap}</p>
                <p className="text-xs text-slate-400 truncate capitalize">{user.role}</p>
              </div>
              <ChevronDown className="w-4 h-4 flex-shrink-0 text-slate-400" />
            </button>

            {isProfileOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800/90 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden transform transition-all duration-200 origin-bottom">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3.5 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all duration-200 font-medium group"
                >
                  <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-400 transition-colors" />
                  <span className="text-sm group-hover:text-red-400 transition-colors">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 min-h-screen flex flex-col transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        {/* Desktop Header (Toggle) */}
        <div className="hidden md:flex bg-white shadow-sm p-4 items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            {!isSidebarOpen && (
              <div className="flex items-center gap-2">
                <Mosque className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-slate-800">SIM Masjid</span>
              </div>
            )}
          </div>
          <div className="text-sm text-slate-500 font-medium capitalize">
            {user.role} Dashboard
          </div>
        </div>

        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
