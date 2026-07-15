import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Building2, Clock, Wallet, BookOpen, Sun, Sunset, Moon, CloudSun, Megaphone, Bell } from 'lucide-react';

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

export default function PublicPage() {
  const { id_mesjid } = useParams();
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [hadith, setHadith] = useState<Hadith | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentDate, setCurrentDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saldoKas, setSaldoKas] = useState<number>(0);
  const [namaMasjid, setNamaMasjid] = useState<string>('Masjid');
  const [periode, setPeriode] = useState<string>('');
  const [iqomahCountdown, setIqomahCountdown] = useState<number | null>(null);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [nextPrayer, setNextPrayer] = useState<string>('');


  // Fetch Saldo Kas from backend
  async function fetchSaldoKas() {
    try {
      const masjidId = id_mesjid || '1'; // Default to 1 if no ID provided
      const response = await fetch(`/api/public/balance/${masjidId}`);
      const data = await response.json();
      
      if (data.data) {
        setSaldoKas(Number(data.data.saldo_akhir || 0));
        setNamaMasjid(data.data.nama_masjid || 'Masjid');
        setPeriode(data.data.periode || '');
      }
    } catch (error) {
      console.error('Error fetching saldo:', error);
      // Keep default value
    }
  }

  // Fetch Prayer Times from Aladhan API
  async function fetchPrayerTimes() {
    try {
      // Get user's location or default to Jakarta
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
        
        // Set date
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
      // Fallback hadith
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

    // Convert prayer times to minutes
    const prayerMinutes = prayers.map(p => {
      const [hours, mins] = p.time.split(':').map(Number);
      return {
        name: p.name,
        minutes: hours * 60 + mins
      };
    });

    // Find next prayer
    for (const prayer of prayerMinutes) {
      if (prayer.minutes > currentMinutes) {
        return prayer.name;
      }
    }

    // If no prayer found today, return first prayer (Subuh tomorrow)
    return prayerMinutes[0].name;
  }

  // Start Iqomah Countdown for next prayer
  function startIqomahCountdown() {
    const nextPrayerName = getNextPrayer();
    if (nextPrayerName) {
      setNextPrayer(nextPrayerName);
      setIqomahCountdown(600); // 10 minutes = 600 seconds
      setIsCountingDown(true);
    }
  }

  // Effect for countdown timer
  useEffect(() => {
    if (isCountingDown && iqomahCountdown !== null && iqomahCountdown > 0) {
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
    fetchSaldoKas();
    setLoading(false);

    // Update clock every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (time: string) => {
    // Remove seconds if present
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

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">

      {/* Scrolling Announcements */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 px-4 overflow-hidden">
        <div className="flex items-center gap-2">
          <Megaphone className="w-4 h-4 flex-shrink-0" />
          <div className="overflow-hidden">
            <div className="animate-marquee whitespace-nowrap inline-block">
              <span className="mx-8">Himbauan Protokol Kesehatan: Gunakan masker saat beraktivitas di tempat umum</span>
              <span className="mx-8">Program Kebersihan: Gotong royong setiap Jumat pukul 07.00-09.00 WIB</span>
              <span className="mx-8">Bantuan Sosial Ramadan: Pendaftaran telah dibuka di kantor kelurahan</span>
              <span className="mx-8">Himbauan Protokol Kesehatan: Gunakan masker saat beraktivitas di tempat umum</span>
              <span className="mx-8">Program Kebersihan: Gotong royong setiap Jumat pukul 07.00-09.00 WIB</span>
              <span className="mx-8">Bantuan Sosial Ramadan: Pendaftaran telah dibuka di kantor kelurahan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Full Screen Grid */}
      <main className="flex-1 overflow-hidden p-4">
        {/* Iqomah Countdown Banner */}
        {isCountingDown && iqomahCountdown !== null && (
          <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl shadow-lg p-6 mb-8 text-white animate-pulse">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
        
                <h2 className="text-3xl font-bold">Iqomah {nextPrayer}</h2>
              </div>
              <div className="text-7xl font-bold mb-2">
                {formatCountdown(iqomahCountdown)}
              </div>
              <p className="text-xl opacity-90">Sisa waktu menuju iqomah</p>
              <button
                onClick={() => setIsCountingDown(false)}
                className="mt-4 bg-white text-red-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Hentikan Hitung Mundur
              </button>
            </div>
          </div>
        )}

        {/* Current Time & Date */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Clock className="w-8 h-8 text-blue-600" />
            <h2 className="text-5xl font-bold text-gray-800">
              {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </h2>
          </div>
          <p className="text-lg text-gray-600">{currentDate}</p>
        </div>

        <div className="grid grid-cols-12 gap-4" style={{ height: isCountingDown ? 'calc(100% - 6rem)' : '100%' }}>
          {/* Left Column - Prayer Times & Streaming (8 cols) */}
          <div className="col-span-8 flex flex-col gap-4">
            {/* Prayer Times Card */}
            <div className="bg-white rounded-xl shadow-lg p-4 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-800">Jadwal Sholat</h3>
                </div>
                {!isCountingDown && (
                  <button
                    onClick={startIqomahCountdown}
                    disabled={loading || !prayerTimes}
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Bell className="w-4 h-4" />
                    Mulai Countdown
                  </button>
                )}
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
                  <div className="bg-gradient-to-r from-purple-50 to-white-50 rounded-lg p-4 border border-purple-100 mb-3">
                    <p className="text-gray-900 leading-relaxed text-lg">{hadith.id}</p>
                  </div>
                    <p className="text-sm text-gray-800 italic text-center">— {hadith.narrator} —</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Streaming & Info (4 cols) */}
          <div className="col-span-4 flex flex-col gap-4">
            {/* Saldo Kas Card */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-4 text-white flex-shrink-0">
              <div className="flex items-center gap-2 mb-3">
                <Wallet className="w-5 h-5" />
                <h3 className="text-lg font-bold">Saldo Kas {namaMasjid}</h3>
              </div>
              <div>
                <p className="text-xs opacity-90 mb-1">Total Saldo</p>
                <p className="text-3xl font-bold">
                  Rp {saldoKas.toLocaleString('id-ID')}
                </p>
                <p className="text-xs opacity-75 mt-1">
                  {periode ? `*Data per ${periode}` : '*Data per periode terakhir'}
                </p>
              </div>
            </div>

            {/* Live Streaming Masjidil Haram */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden flex-1 flex flex-col">
              <div className="p-3 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-800">Live Streaming Masjidil Haram</h3>
                </div>
              </div>
              <div className="relative flex-1 bg-black">
                {/* YouTube Live Stream Embed - Masjidil Haram */}
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
                  Streaming langsung dari Masjidil Haram, Mekah
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Balance, Hadith & Info (4 cols) */}
          <div className="col-span-4 flex flex-col gap-4">
            {/* Saldo Kas Card */}
            

            

            {/* Info Card */}
            <div className="bg-blue-50 rounded-xl border-2 border-blue-200 p-3 flex-shrink-0">
              <h4 className="font-bold text-gray-800 mb-2 text-sm">Informasi Kontak</h4>
              <div className="space-y-1 text-xs text-gray-700">
                <p>Jl. Raya Masjid No. 123, Jakarta</p>
                <p>(021) 1234-5678</p>
                <p>info@masjid-alikhlas.id</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-gray-600">
          <p className="text-sm">
            © 2025 Masjid Al-Ikhlas. Sistem Informasi Manajemen Keuangan Masjid
          </p>
        </div>
      </main>

      {/* Custom font for Arabic text */}
      <style>{`
        .font-arabic {
          font-family: 'Scheherazade New', 'Amiri', 'Traditional Arabic', serif;
        }
      `}</style>
    </div>
  );
}
