const { AsetTidakTerbatas, AsetTerbatas, Masjid } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Get public balance information for a masjid with detailed breakdown
exports.getPublicBalance = async (req, res) => {
  try {
    const { masjidId } = req.params;
    const { year, month } = req.query;

    // Get masjid info
    const masjid = await Masjid.findByPk(masjidId);
    if (!masjid) {
      return res.status(404).json({ message: 'Masjid tidak ditemukan' });
    }

    // Build date filter
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const currentMonth = month !== undefined ? parseInt(month) : new Date().getMonth();
    
    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    // Calculate previous month's closing balance (opening balance for current period)
    const prevEndDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);
    
    const prevIncome = await Promise.all([
      AsetTidakTerbatas.sum('jumlah', {
        where: {
          MasjidId: masjidId,
          tipe: 'pemasukan',
          tanggal: { [Op.lte]: prevEndDate }
        }
      }),
      AsetTerbatas.sum('jumlah', {
        where: {
          MasjidId: masjidId,
          tipe: 'pemasukan',
          tanggal: { [Op.lte]: prevEndDate }
        }
      })
    ]);

    const prevExpenses = await Promise.all([
      AsetTidakTerbatas.sum('jumlah', {
        where: {
          MasjidId: masjidId,
          tipe: 'pengeluaran',
          tanggal: { [Op.lte]: prevEndDate }
        }
      }),
      AsetTerbatas.sum('jumlah', {
        where: {
          MasjidId: masjidId,
          tipe: 'pengeluaran',
          tanggal: { [Op.lte]: prevEndDate }
        }
      })
    ]);

    const saldoAwal = ((parseFloat(prevIncome[0]) || 0) + (parseFloat(prevIncome[1]) || 0)) - 
                      ((parseFloat(prevExpenses[0]) || 0) + (parseFloat(prevExpenses[1]) || 0));

    // Calculate current period income
    const currentIncome = await Promise.all([
      AsetTidakTerbatas.sum('jumlah', {
        where: {
          MasjidId: masjidId,
          tipe: 'pemasukan',
          tanggal: { [Op.between]: [startDate, endDate] }
        }
      }),
      AsetTerbatas.sum('jumlah', {
        where: {
          MasjidId: masjidId,
          tipe: 'pemasukan',
          tanggal: { [Op.between]: [startDate, endDate] }
        }
      })
    ]);

    // Calculate current period expenses
    const currentExpenses = await Promise.all([
      AsetTidakTerbatas.sum('jumlah', {
        where: {
          MasjidId: masjidId,
          tipe: 'pengeluaran',
          tanggal: { [Op.between]: [startDate, endDate] }
        }
      }),
      AsetTerbatas.sum('jumlah', {
        where: {
          MasjidId: masjidId,
          tipe: 'pengeluaran',
          tanggal: { [Op.between]: [startDate, endDate] }
        }
      })
    ]);

    const periodIncome = (parseFloat(currentIncome[0]) || 0) + (parseFloat(currentIncome[1]) || 0);
    const periodExpense = (parseFloat(currentExpenses[0]) || 0) + (parseFloat(currentExpenses[1]) || 0);
    const surplus = periodIncome - periodExpense;
    const saldoAkhir = saldoAwal + surplus;

    // Get unrestricted and restricted fund breakdown
    const totalIncome = await Promise.all([
      AsetTidakTerbatas.sum('jumlah', {
        where: {
          MasjidId: masjidId,
          tipe: 'pemasukan',
          tanggal: { [Op.lte]: endDate }
        }
      }),
      AsetTerbatas.sum('jumlah', {
        where: {
          MasjidId: masjidId,
          tipe: 'pemasukan',
          tanggal: { [Op.lte]: endDate }
        }
      })
    ]);

    const totalExpenses = await Promise.all([
      AsetTidakTerbatas.sum('jumlah', {
        where: {
          MasjidId: masjidId,
          tipe: 'pengeluaran',
          tanggal: { [Op.lte]: endDate }
        }
      }),
      AsetTerbatas.sum('jumlah', {
        where: {
          MasjidId: masjidId,
          tipe: 'pengeluaran',
          tanggal: { [Op.lte]: endDate }
        }
      })
    ]);

    const unrestricted = (parseFloat(totalIncome[0]) || 0) - (parseFloat(totalExpenses[0]) || 0);
    const restricted = (parseFloat(totalIncome[1]) || 0) - (parseFloat(totalExpenses[1]) || 0);

    // Get recent transactions
    const recentTransactions = await Promise.all([
      AsetTidakTerbatas.findAll({
        where: {
          MasjidId: masjidId,
          tanggal: { [Op.between]: [startDate, endDate] }
        },
        attributes: ['id', 'uraian', 'jumlah', 'tipe', 'tanggal', 'kategori'],
        order: [['tanggal', 'DESC']],
        limit: 10
      }),
      AsetTerbatas.findAll({
        where: {
          MasjidId: masjidId,
          tanggal: { [Op.between]: [startDate, endDate] }
        },
        attributes: ['id', 'uraian', 'jumlah', 'tipe', 'tanggal', 'tujuan_dana'],
        order: [['tanggal', 'DESC']],
        limit: 10
      })
    ]);

    // Combine and sort transactions
    const allTransactions = [
      ...recentTransactions[0].map(t => ({
        id: t.id,
        keterangan: t.uraian,
        jumlah: parseFloat(t.jumlah),
        tipe: t.tipe,
        tanggal: t.tanggal,
        kategori: t.kategori || 'Dana Tidak Terikat',
        isRestricted: false
      })),
      ...recentTransactions[1].map(t => ({
        id: t.id,
        keterangan: t.uraian,
        jumlah: parseFloat(t.jumlah),
        tipe: t.tipe,
        tanggal: t.tanggal,
        kategori: t.tujuan_dana || 'Dana Terikat',
        isRestricted: true
      }))
    ].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)).slice(0, 10);

    // Get category breakdown for expenses
    const expenseCategories = await AsetTidakTerbatas.findAll({
      where: {
        MasjidId: masjidId,
        tipe: 'pengeluaran',
        tanggal: { [Op.between]: [startDate, endDate] }
      },
      attributes: [
        'kategori',
        [sequelize.fn('SUM', sequelize.col('jumlah')), 'total']
      ],
      group: ['kategori'],
      raw: true
    });

    // Format period
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                       'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const periode = `${monthNames[currentMonth]} ${currentYear}`;

    res.json({
      data: {
        nama_masjid: masjid.nama_masjid,
        alamat: masjid.alamat,
        saldo_awal: saldoAwal,
        saldo_akhir: saldoAkhir,
        periode: periode,
        period_income: periodIncome,
        period_expense: periodExpense,
        surplus: surplus,
        unrestricted_funds: unrestricted,
        restricted_funds: restricted,
        total_assets: unrestricted + restricted,
        recent_transactions: allTransactions,
        expense_categories: expenseCategories.map(cat => ({
          name: cat.kategori || 'Lainnya',
          value: parseFloat(cat.total)
        })),
        year: currentYear,
        month: currentMonth
      }
    });

  } catch (error) {
    console.error('Error fetching public balance:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get list of all masjids for public access
exports.getAllMasjids = async (req, res) => {
  try {
    const masjids = await Masjid.findAll({
      attributes: ['id', 'nama_masjid', 'alamat'],
      order: [['nama_masjid', 'ASC']]
    });

    res.json({
      data: masjids
    });

  } catch (error) {
    console.error('Error fetching masjids:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get masjid detail for public
exports.getMasjidDetail = async (req, res) => {
  try {
    const { masjidId } = req.params;

    const masjid = await Masjid.findByPk(masjidId, {
      attributes: [
        'id',
        'nama_masjid',
        'alamat',
        'telepon',
        'email',
        'ketua_pengurus',
        'countdown_duration',
        'announcements'
      ]
    });

    if (!masjid) {
      return res.status(404).json({ message: 'Masjid tidak ditemukan' });
    }

    res.json({
      data: masjid
    });

  } catch (error) {
    console.error('Error fetching masjid detail:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
