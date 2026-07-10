const { AsetTidakTerbatas, AsetTerbatas, Masjid } = require('../models');
const { Op } = require('sequelize');

// Helper functions
const toNumber = (val) => {
  if (val === null || val === undefined) return 0;
  const num = Number(val);
  return Number.isNaN(num) ? 0 : num;
};

const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getEndOfWeek = (date) => {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};

exports.getLaporanKeuangan = async (req, res) => {
  try {
    const { masjid_id, period = 'monthly', month, year, week_date } = req.query;

    if (!masjid_id) {
      return res.status(400).json({ message: 'masjid_id diperlukan' });
    }

    // Validate masjid exists
    const masjid = await Masjid.findByPk(masjid_id);
    if (!masjid) {
      return res.status(404).json({ message: 'Masjid tidak ditemukan' });
    }

    // Determine date range based on period
    let startDate, endDate, title;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const currentMonth = month !== undefined ? parseInt(month) : new Date().getMonth();

    if (period === 'weekly') {
      const weekDate = week_date ? new Date(week_date) : new Date();
      startDate = getStartOfWeek(weekDate);
      endDate = getEndOfWeek(weekDate);
      title = `Mingguan (${startDate.getDate()} - ${endDate.getDate()} ${getMonthName(startDate.getMonth())} ${startDate.getFullYear()})`;
    } else if (period === 'monthly') {
      startDate = new Date(currentYear, currentMonth, 1, 0, 0, 0, 0);
      endDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
      title = `Bulanan (${getMonthName(currentMonth)} ${currentYear})`;
    } else {
      startDate = new Date(currentYear, 0, 1, 0, 0, 0, 0);
      endDate = new Date(currentYear, 11, 31, 23, 59, 59, 999);
      title = `Tahunan (${currentYear})`;
    }

    // Fetch all transactions for opening balance calculation
    const [allTidakTerbatas, allTerbatas] = await Promise.all([
      AsetTidakTerbatas.findAll({
        where: { MasjidId: masjid_id },
        order: [['tanggal', 'ASC']],
      }),
      AsetTerbatas.findAll({
        where: { MasjidId: masjid_id },
        order: [['tanggal', 'ASC']],
      }),
    ]);

    // Calculate opening balance (before period)
    let openingUn = 0, openingRes = 0;
    
    allTidakTerbatas.forEach(t => {
      if (new Date(t.tanggal) < startDate) {
        const amount = toNumber(t.jumlah);
        if (t.tipe === 'pemasukan') {
          openingUn += amount;
        } else {
          openingUn -= amount;
        }
      }
    });

    allTerbatas.forEach(t => {
      if (new Date(t.tanggal) < startDate) {
        const amount = toNumber(t.jumlah);
        if (t.tipe === 'pemasukan') {
          openingRes += amount;
        } else {
          openingRes -= amount;
        }
      }
    });

    // Filter transactions for current period
    const periodTidakTerbatas = allTidakTerbatas.filter(t => {
      const d = new Date(t.tanggal);
      return d >= startDate && d <= endDate;
    });

    const periodTerbatas = allTerbatas.filter(t => {
      const d = new Date(t.tanggal);
      return d >= startDate && d <= endDate;
    });

    // Calculate income and expenses
    let incUn = 0, incRes = 0, expUn = 0, expRes = 0;
    const incDetails = {};
    const expDetails = {};

    // Process Tidak Terbatas
    periodTidakTerbatas.forEach(t => {
      const category = t.kategori || 'Lainnya';
      const amount = toNumber(t.jumlah);

      if (t.tipe === 'pemasukan') {
        incUn += amount;
        if (!incDetails[category]) incDetails[category] = { un: 0, res: 0 };
        incDetails[category].un += amount;
      } else {
        expUn += amount;
        if (!expDetails[category]) expDetails[category] = { un: 0, res: 0 };
        expDetails[category].un += amount;
      }
    });

    // Process Terbatas
    periodTerbatas.forEach(t => {
      const category = t.tujuan_dana || 'Lainnya';
      const amount = toNumber(t.jumlah);

      if (t.tipe === 'pemasukan') {
        incRes += amount;
        if (!incDetails[category]) incDetails[category] = { un: 0, res: 0 };
        incDetails[category].res += amount;
      } else {
        expRes += amount;
        if (!expDetails[category]) expDetails[category] = { un: 0, res: 0 };
        expDetails[category].res += amount;
      }
    });

    // Calculate surplus/deficit
    const surUn = incUn - expUn;
    const surRes = incRes - expRes;

    // Calculate closing balance
    const closingUn = openingUn + surUn;
    const closingRes = openingRes + surRes;

    // Get laporan terbatas summary
    const laporanTerbatas = await AsetTerbatas.findAll({
      where: { MasjidId: masjid_id },
      attributes: [
        'tujuan_dana',
        [
          AsetTerbatas.sequelize.literal(`SUM(CASE WHEN tipe = 'pemasukan' THEN jumlah ELSE 0 END)`),
          'total_pemasukan'
        ],
        [
          AsetTerbatas.sequelize.literal(`SUM(CASE WHEN tipe = 'pengeluaran' THEN jumlah ELSE 0 END)`),
          'total_pengeluaran'
        ],
        [
          AsetTerbatas.sequelize.literal(`SUM(CASE WHEN tipe = 'pemasukan' THEN jumlah ELSE -jumlah END)`),
          'saldo_tersisa'
        ],
      ],
      group: ['tujuan_dana'],
      raw: true,
    });

    // Prepare response
    const response = {
      masjid: {
        id: masjid.id,
        nama: masjid.nama_masjid,
        alamat: masjid.alamat,
        telepon: masjid.telepon,
        email: masjid.email,
        ketua_pengurus: masjid.ketua_pengurus,
        countdown_duration: masjid.countdown_duration,
      },
      periode: {
        type: period,
        title,
        startDate,
        endDate,
      },
      opening: {
        tidak_terbatas: openingUn,
        terbatas: openingRes,
        total: openingUn + openingRes,
      },
      current: {
        income: {
          tidak_terbatas: incUn,
          terbatas: incRes,
          total: incUn + incRes,
          details: incDetails,
        },
        expense: {
          tidak_terbatas: expUn,
          terbatas: expRes,
          total: expUn + expRes,
          details: expDetails,
        },
      },
      surplus: {
        tidak_terbatas: surUn,
        terbatas: surRes,
        total: surUn + surRes,
      },
      closing: {
        tidak_terbatas: closingUn,
        terbatas: closingRes,
        total: closingUn + closingRes,
      },
      cashFlow: {
        operatingIn: incUn + incRes,
        operatingOut: expUn + expRes,
          netCashFlow: (incUn + incRes) - (expUn + expRes),
      },
      laporanTerbatas: laporanTerbatas.map(item => ({
        tujuan_dana: item.tujuan_dana,
        total_pemasukan: parseFloat(item.total_pemasukan) || 0,
        total_pengeluaran: parseFloat(item.total_pengeluaran) || 0,
        saldo_tersisa: parseFloat(item.saldo_tersisa) || 0,
      })),
    };

    res.json(response);
  } catch (error) {
    console.error('Error generating laporan:', error);
    res.status(500).json({ message: 'Gagal menghasilkan laporan', error: error.message });
  }
};

// Helper function to get month name
function getMonthName(monthIndex) {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return months[monthIndex];
}
