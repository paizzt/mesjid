import React, { useState, useEffect } from 'react';
import { Clock, MapPin } from 'lucide-react';
import axios from 'axios';

interface Jadwal {
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
  date: string;
}

const JadwalShalat: React.FC = () => {
  const [jadwal, setJadwal] = useState<Jadwal | null>(null);
  const [loading, setLoading] = useState(true);
  const [kota] = useState('Makassar'); // Default to Makassar since it's Sultan Alauddin
  const [kotaId] = useState('2704'); // Default ID for Makassar
  
  useEffect(() => {
    fetchJadwal();
  }, [kotaId]);

  const fetchJadwal = async () => {
    try {
      setLoading(true);
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      const response = await axios.get(`https://api.myquran.com/v2/sholat/jadwal/${kotaId}/${year}/${month}/${day}`);
      if (response.data && response.data.data && response.data.data.jadwal) {
        setJadwal(response.data.data.jadwal);
      }
    } catch (error) {
      console.error('Error fetching jadwal shalat:', error);
    } finally {
      setLoading(false);
    }
  };

  const waktuShalat = jadwal ? [
    { name: 'Imsak', time: jadwal.imsak },
    { name: 'Subuh', time: jadwal.subuh },
    { name: 'Terbit', time: jadwal.terbit },
    { name: 'Dhuha', time: jadwal.dhuha },
    { name: 'Dzuhur', time: jadwal.dzuhur },
    { name: 'Ashar', time: jadwal.ashar },
    { name: 'Maghrib', time: jadwal.maghrib },
    { name: 'Isya', time: jadwal.isya },
  ] : [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-emerald-600 rounded-2xl p-6 md:p-8 text-white shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Clock className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Jadwal Shalat</h1>
          <div className="flex items-center gap-2 text-emerald-100">
            <MapPin className="w-4 h-4" />
            <span className="text-sm md:text-base">{kota} - {jadwal?.date}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {waktuShalat.map((ws, idx) => {
              const now = new Date();
              const [hours, minutes] = ws.time.split(':');
              const prayerTime = new Date();
              prayerTime.setHours(parseInt(hours), parseInt(minutes), 0);
              const isPast = now > prayerTime;
              
              return (
                <div 
                  key={idx} 
                  className={`p-4 rounded-xl border ${!isPast && idx > 0 ? 'border-emerald-200 bg-emerald-50' : 'border-slate-100 bg-slate-50'}`}
                >
                  <div className="text-slate-500 text-sm font-medium mb-1">{ws.name}</div>
                  <div className={`text-xl md:text-2xl font-bold ${!isPast && idx > 0 ? 'text-emerald-700' : 'text-slate-800'}`}>
                    {ws.time}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default JadwalShalat;
