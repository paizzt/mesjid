import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, Clock, Wallet, BookOpen, Sun, Sunset, Moon, CloudSun, Megaphone, Bell, ArrowLeft } from 'lucide-react';
import api from '../services/api';

type PrayerTimes = {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
};

type Hadith = {
  arab: string;
  id: string;
  narrator?: string;
};

type MasjidInfo = {
  id: number;
  nama_masjid: string;
  alamat: string;
  telepon: string;
  email: string;
  countdown_duration?: number;
  announcements?: string | string[];
};

export default function PublicMasjidPage() {
  const { masjidId } = useParams();
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [hadith, setHadith] = useState<Hadith | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentDate, setCurrentDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saldoKas, setSaldoKas] = useState<number>(0);
  const [saldoTerbatas, setSaldoTerbatas] = useState<number>(0);
  const [saldoTidakTerbatas, setSaldoTidakTerbatas] = useState<number>(0);
  const [masjidInfo, setMasjidInfo] = useState<MasjidInfo | null>(null);
  const [periode, setPeriode] = useState<string>('');
  const [iqomahCountdown, setIqomahCountdown] = useState<number | null>(null);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [nextPrayer, setNextPrayer] = useState<string>('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const stopButtonRef = useRef<HTMLButtonElement>(null);

  // Fetch Masjid Info & Saldo Kas from backend
  async function fetchMasjidData() {
    try {
      // Get masjid detail
      const masjidResponse = await api.get(`/public/masjid/${masjidId}`);
      if (masjidResponse.data?.data) {
        setMasjidInfo(masjidResponse.data.data);
      }

      // Get balance
      const balanceResponse = await api.get(`/public/balance/${masjidId}`);
      if (balanceResponse.data?.data) {
        setSaldoKas(Number(balanceResponse.data.data.saldo_akhir || 0));
        setSaldoTerbatas(Number(balanceResponse.data.data.restricted_funds || 0));
        setSaldoTidakTerbatas(Number(balanceResponse.data.data.unrestricted_funds || 0));
        setPeriode(balanceResponse.data.data.periode || '');
      }
    } catch (error) {
      console.error('Error fetching masjid data:', error);
    }
  }

  // Fetch Prayer Times from Aladhan API
  async function fetchPrayerTimes() {
    try {
      const city = 'Makassar';
      const country = 'Indonesia';
      const today = new Date();
      const timestamp = Math.floor(today.getTime() / 1000);
      
      const response = await fetch(
        `https://api.aladhan.com/v1/timingsByCity/${timestamp}?city=${city}&country=${country}&method=2`
      );
      const data = await response.json();
      
      if (data.code === 200 && data.data) {
        const timings = data.data.timings;
        setPrayerTimes({
          Fajr: timings.Fajr,
          Dhuhr: timings.Dhuhr,
          Asr: timings.Asr,
          Maghrib: timings.Maghrib,
          Isha: timings.Isha,
        });
        
        const hijriDate = data.data.date.hijri;
        const gregorianDate = data.data.date.gregorian;
        setCurrentDate(
          `${gregorianDate.day} ${gregorianDate.month.en} ${gregorianDate.year} / ${hijriDate.day} ${hijriDate.month.ar} ${hijriDate.year} H`
        );
      }
    } catch (error) {
      console.error('Error fetching prayer times:', error);
    }
  }

  // Fetch Random Hadith from API
  async function fetchHadith() {
    try {
      const response = await fetch('https://api.hadith.gading.dev/books/muslim?range=1-10');
      const data = await response.json();
      
      if (data.data && data.data.hadiths && data.data.hadiths.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.data.hadiths.length);
        const hadithData = data.data.hadiths[randomIndex];
        setHadith({
          arab: hadithData.arab,
          id: hadithData.id,
          narrator: 'HR. Muslim'
        });
      }
    } catch (error) {
      console.error('Error fetching hadith:', error);
      setHadith({
        arab: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ',
        id: 'Sesungguhnya setiap amal perbuatan tergantung pada niatnya.',
        narrator: 'HR. Bukhari'
      });
    }
  }

  // Get next prayer time
  function getNextPrayer() {
    if (!prayerTimes) return null;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const prayers = [
      { name: 'Subuh', time: prayerTimes.Fajr },
      { name: 'Dzuhur', time: prayerTimes.Dhuhr },
      { name: 'Ashar', time: prayerTimes.Asr },
      { name: 'Maghrib', time: prayerTimes.Maghrib },
      { name: 'Isya', time: prayerTimes.Isha }
    ];

    const prayerMinutes = prayers.map(p => {
      const [hours, mins] = p.time.split(':').map(Number);
      return {
        name: p.name,
        minutes: hours * 60 + mins
      };
    });

    for (const prayer of prayerMinutes) {
      if (prayer.minutes > currentMinutes) {
        return prayer.name;
      }
    }

    return prayerMinutes[0].name;
  }

  // Start Iqomah Countdown
  function startIqomahCountdown() {
    const nextPrayerName = getNextPrayer();
    if (nextPrayerName) {
      setNextPrayer(nextPrayerName);
      // Use countdown_duration from masjid settings, default to 600 (10 minutes)
      const duration = masjidInfo?.countdown_duration || 600;
      setIqomahCountdown(duration);
      setIsCountingDown(true);
    }
  }

  // Play beep sound using Web Audio API
  const playBeep = (frequency: number = 800, duration: number = 200) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.error('Error playing beep:', error);
    }
  };

  // Effect for countdown timer
  useEffect(() => {
    if (isCountingDown && iqomahCountdown !== null && iqomahCountdown > 0) {
      // Play beep sound in last 10 seconds
      if (iqomahCountdown <= 10) {
        playBeep(iqomahCountdown === 1 ? 1200 : 800, 200);
      }

      const timer = setInterval(() => {
        setIqomahCountdown(prev => {
          if (prev === null || prev <= 1) {
            setIsCountingDown(false);
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isCountingDown, iqomahCountdown]);

  useEffect(() => {
    fetchPrayerTimes();
    fetchHadith();
    fetchMasjidData();
    setLoading(false);

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [masjidId]);

  // Auto focus on start/stop button based on countdown state
  useEffect(() => {
    if (isCountingDown) {
      stopButtonRef.current?.focus();
    } else {
      startButtonRef.current?.focus();
    }
  }, [isCountingDown]);

  const formatTime = (time: string) => {
    return time.split(' ')[0];
  };

  const getPrayerIcon = (name: string) => {
    switch (name) {
      case 'Fajr':
        return <Sun className="w-6 h-6 text-yellow-500" />;
      case 'Dhuhr':
        return <CloudSun className="w-6 h-6 text-orange-500" />;
      case 'Asr':
        return <Sunset className="w-6 h-6 text-orange-600" />;
      case 'Maghrib':
        return <Sunset className="w-6 h-6 text-red-500" />;
      case 'Isha':
        return <Moon className="w-6 h-6 text-indigo-500" />;
      default:
        return <Clock className="w-6 h-6 text-gray-500" />;
    }
  };

  const prayerNames = {
    Fajr: 'Subuh',
    Dhuhr: 'Dzuhur',
    Asr: 'Ashar',
    Maghrib: 'Maghrib',
    Isha: 'Isya'
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const announcementItems = Array.isArray(masjidInfo?.announcements)
    ? (masjidInfo?.announcements as string[])
    : masjidInfo?.announcements
      ? masjidInfo.announcements.split('\n').map(item => item.trim()).filter(Boolean)
      : [];

  const marqueeItems = announcementItems.length
    ? announcementItems
    : [
        `📢 Selamat datang di ${masjidInfo?.nama_masjid || 'Masjid'}`,
        '🕌 Mari ramaikan masjid dengan ibadah berjemaah',
        '🤲 Infaq dan sedekah dapat disalurkan melalui admin masjid'
      ];

  const mobileSlides = [
    {
      key: 'prayer',
      title: 'Jadwal Sholat',
      content: (
        <div className="space-y-3">
          {loading || !prayerTimes ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(prayerTimes).map(([name, time]) => (
                <div
                  key={name}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100"
                >
                  <div className="flex items-center gap-3">
                    {getPrayerIcon(name)}
                    <span className="font-semibold text-gray-800 text-lg">
                      {prayerNames[name as keyof typeof prayerNames]}
                    </span>
                  </div>
                  <span className="text-xl font-bold text-blue-600">{formatTime(time)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'hadith',
      title: 'Hadits Hari Ini',
      content: (
        <div className="space-y-3">
          {loading || !hadith ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                <p className="text-gray-900 leading-relaxed text-lg">{hadith.id}</p>
              </div>
              <p className="text-sm text-gray-600 italic text-center">— {hadith.narrator} —</p>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'saldo',
      title: 'Saldo Kas Masjid',
      content: (
        <div className="space-y-2">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl text-white p-4">
            <p className="text-xs opacity-90 mb-1">Total Saldo</p>
            <p className="text-3xl font-bold">Rp {saldoKas.toLocaleString('id-ID')}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-[10px] text-blue-600 font-semibold mb-1">Tidak Terbatas</p>
              <p className="text-sm font-bold text-blue-700">Rp {saldoTidakTerbatas.toLocaleString('id-ID')}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <p className="text-[10px] text-purple-600 font-semibold mb-1">Terbatas</p>
              <p className="text-sm font-bold text-purple-700">Rp {saldoTerbatas.toLocaleString('id-ID')}</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 text-center">{periode ? `*Data per ${periode}` : '*Data per periode terakhir'}</p>
        </div>
      )
    },
    {
      key: 'stream',
      title: 'Live Masjidil Haram',
      content: (
        <div className="space-y-2">
          <div className="relative pb-[56.25%] rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <iframe
              className="absolute inset-0 w-full h-full"
              src="https://www.youtube.com/embed/7-Qf3g-0xEI?autoplay=1&mute=1&controls=1&rel=0"
              title="Live Streaming Masjidil Haram"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <p className="text-xs text-gray-600 text-center">🕋 Streaming langsung dari Masjidil Haram, Mekah</p>
        </div>
      )
    },
    {
      key: 'info',
      title: 'Informasi Kontak',
      content: (
        <div className="space-y-1 text-sm text-gray-700">
          <p>📍 {masjidInfo?.alamat}</p>
          {masjidInfo?.telepon && <p>📞 {masjidInfo.telepon}</p>}
          {masjidInfo?.email && <p>📧 {masjidInfo.email}</p>}
        </div>
      )
    }
  ];

  const handlePrevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + mobileSlides.length) % mobileSlides.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % mobileSlides.length);
  };

  if (!masjidInfo) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat informasi masjid...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      {/* Header with Back Button */}
      <div className="bg-white shadow-sm p-4 flex items-center justify-between">
        <Link 
          to="/dashboard" 
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Kembali ke Dashboard
        </Link>
        <div className="flex items-center gap-2">
          <Building2 className="w-6 h-6 text-emerald-600" />
          <h1 className="text-xl font-bold text-gray-800">{masjidInfo.nama_masjid}</h1>
        </div>
      </div>

      {/* Scrolling Announcements */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 px-4 overflow-hidden">
        <div className="flex items-center gap-2">
          <Megaphone className="w-4 h-4 flex-shrink-0" />
          <div className="overflow-hidden">
            <div className="animate-marquee whitespace-nowrap inline-block">
              {marqueeItems.map((item, idx) => (
                <span key={idx} className="mx-8">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden p-4">
        {/* Current Time & Date */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Clock className="w-8 h-8 text-blue-600" />
            <h2 className="text-5xl font-bold text-gray-800">
              {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </h2>
          </div>
          <p className="text-lg text-gray-600 mb-4">{currentDate}</p>
          
          {/* Countdown Button - Now Below Clock */}
          {!isCountingDown && (
            <button
              ref={startButtonRef}
              onClick={startIqomahCountdown}
              disabled={loading || !prayerTimes}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-3 rounded-lg font-medium transition-all inline-flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Bell className="w-5 h-5" />
              Mulai Countdown Iqomah
            </button>
          )}
        </div>

        {/* Iqomah Countdown Banner */}
        {isCountingDown && iqomahCountdown !== null && (
          <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl shadow-lg p-6 mb-4 text-white animate-pulse">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Bell className="w-8 h-8" />
                <h2 className="text-3xl font-bold">Iqomah {nextPrayer}</h2>
              </div>
              <div className="text-7xl font-bold mb-2">
                {formatCountdown(iqomahCountdown)}
              </div>
              <p className="text-xl opacity-90">Sisa waktu menuju iqomah</p>
              <button
                ref={stopButtonRef}
                onClick={() => setIsCountingDown(false)}
                className="mt-4 bg-white text-red-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Hentikan Hitung Mundur
              </button>
            </div>
          </div>
        )}

        {/* Mobile Carousel */}
        <div className="md:hidden mb-4">
          <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-gray-500">Geser untuk lihat info</p>
                <h3 className="text-lg font-bold text-gray-800">{mobileSlides[currentSlide].title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevSlide}
                  className="w-9 h-9 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50"
                  aria-label="Sebelumnya"
                >
                  ‹
                </button>
                <button
                  onClick={handleNextSlide}
                  className="w-9 h-9 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50"
                  aria-label="Berikutnya"
                >
                  ›
                </button>
              </div>
            </div>
            {mobileSlides[currentSlide].content}
          </div>
          <div className="flex items-center justify-center gap-2 mt-3">
            {mobileSlides.map((slide, idx) => (
              <button
                key={slide.key}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2.5 h-2.5 rounded-full ${idx === currentSlide ? 'bg-blue-600' : 'bg-gray-300'}`}
                aria-label={`Slide ${idx + 1}`}
              ></button>
            ))}
          </div>
        </div>

        <div className="hidden md:grid grid-cols-12 gap-4 h-[calc(100%-250px)]">
          {/* Left Column - Prayer Times & Hadith */}
          <div className="col-span-8 flex flex-col gap-4">
            {/* Prayer Times Card */}
            <div className="bg-white rounded-xl shadow-lg p-4 flex-shrink-0">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-800">Jadwal Sholat</h3>
              </div>
              {loading || !prayerTimes ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(prayerTimes).map(([name, time]) => (
                    <div
                      key={name}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        {getPrayerIcon(name)}
                        <span className="font-semibold text-gray-800 text-lg">
                          {prayerNames[name as keyof typeof prayerNames]}
                        </span>
                      </div>
                      <span className="text-2xl font-bold text-blue-600">
                        {formatTime(time)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hadith Card */}
            <div className="bg-white rounded-xl shadow-lg p-4 flex-1 min-h-0 flex flex-col">
              <div className="flex items-center gap-2 mb-4 flex-shrink-0">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-bold text-gray-800">Hadits Hari Ini</h3>
              </div>
              {loading || !hadith ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : (
                <div className="flex-1 min-h-0 overflow-y-auto">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100 mb-3">
                    <p className="text-gray-900 leading-relaxed text-lg">{hadith.id}</p>
                  </div>
                  <p className="text-sm text-gray-600 italic text-center">— {hadith.narrator} —</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Balance, Streaming & Info */}
          <div className="col-span-4 flex flex-col gap-4">
            {/* Saldo Kas Card */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-4 text-white flex-shrink-0">
              <div className="flex items-center gap-2 mb-3">
                <Wallet className="w-5 h-5" />
                <h3 className="text-lg font-bold">Saldo Kas Masjid</h3>
              </div>
              <div>
                <p className="text-xs opacity-90 mb-1">Total Saldo</p>
                <p className="text-3xl font-bold">
                  Rp {saldoKas.toLocaleString('id-ID')}
                </p>
                <div className="mt-3 pt-3 border-t border-white/30 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs opacity-90">Tidak Terbatas</span>
                    <span className="text-sm font-semibold">Rp {saldoTidakTerbatas.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs opacity-90">Terbatas</span>
                    <span className="text-sm font-semibold">Rp {saldoTerbatas.toLocaleString('id-ID')}</span>
                  </div>
                </div>
                <p className="text-xs opacity-75 mt-3">
                  {periode ? `*Data per ${periode}` : '*Data per periode terakhir'}
                </p>
              </div>
            </div>

            {/* Live Streaming */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden flex-1 flex flex-col">
              <div className="p-3 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-bold text-gray-800">🕋 Live Masjidil Haram</h3>
                </div>
              </div>
              <div className="relative flex-1 bg-black">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/7-Qf3g-0xEI?autoplay=1&mute=1&controls=1&rel=0"
                  title="Live Streaming Masjidil Haram"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="p-2 bg-gradient-to-r from-green-50 to-emerald-50 flex-shrink-0">
                <p className="text-xs text-gray-600 text-center">
                  🕋 Streaming langsung dari Masjidil Haram, Mekah
                </p>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 rounded-xl border-2 border-blue-200 p-3 flex-shrink-0">
              <h4 className="font-bold text-gray-800 mb-2 text-sm">Informasi Kontak</h4>
              <div className="space-y-1 text-xs text-gray-700">
                <p>📍 {masjidInfo.alamat}</p>
                {masjidInfo.telepon && <p>📞 {masjidInfo.telepon}</p>}
                {masjidInfo.email && <p>📧 {masjidInfo.email}</p>}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Marquee Animation */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
