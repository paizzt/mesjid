import React, { useState, useEffect } from 'react';
import { Clock, Loader2, MapPin } from 'lucide-react';
import axios from 'axios';

interface PrayerTimesData {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

const PrayerTimes: React.FC = () => {
  const [times, setTimes] = useState<PrayerTimesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Secara default menggunakan Makassar (Untuk wilayah Masjid Agung Sultan Alauddin)
  const city = 'Makassar';
  const country = 'Indonesia';

  useEffect(() => {
    const fetchTimes = async () => {
      try {
        const response = await axios.get(`https://api.aladhan.com/v1/timingsByCity`, {
          params: {
            city,
            country,
            method: 11 // Majelis Ulama Indonesia
          }
        });
        setTimes(response.data.data.timings);
      } catch (err) {
        setError('Gagal memuat jadwal shalat');
      } finally {
        setLoading(false);
      }
    };
    fetchTimes();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-6 bg-white rounded-3xl shadow-lg border border-slate-200 mb-8">
        <div className="loader"></div>
      </div>
    );
  }

  if (error || !times) {
    return null; // Sembunyikan widget jika gagal fetch
  }

  const prayers = [
    { name: 'Subuh', time: times.Fajr },
    { name: 'Dzuhur', time: times.Dhuhr },
    { name: 'Ashar', time: times.Asr },
    { name: 'Maghrib', time: times.Maghrib },
    { name: 'Isya', time: times.Isha },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-8">
      
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Jadwal Shalat Hari Ini</h2>
            <div className="flex items-center gap-1 text-sm text-slate-500">
              <MapPin className="w-3 h-3" /> {city}, {country}
            </div>
          </div>
        </div>
        <div className="text-sm font-medium text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        {prayers.map((prayer) => (
          <div key={prayer.name} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col items-center justify-center gap-2 hover:bg-emerald-50 hover:border-emerald-200 transition-colors">
            <span className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider">{prayer.name}</span>
            <span className="text-2xl md:text-3xl font-extrabold text-slate-800">{prayer.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrayerTimes;
