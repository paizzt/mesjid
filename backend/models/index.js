const sequelize = require('../config/database');
const { DataTypes, Sequelize } = require('sequelize');

// Import models
const User = require('./User');
const Masjid = require('./Masjid');
const Kategori = require('./Kategori');
const AsetTidakTerbatas = require('./AsetTidakTerbatas');
const AsetTerbatas = require('./AsetTerbatas');
const AkunKas = require('./AkunKas');
const Jamaah = require('./Jamaah');
const Zakat = require('./Zakat');
const QurbanHewan = require('./QurbanHewan');
const QurbanPeserta = require('./QurbanPeserta');
const TabunganQurban = require('./TabunganQurban');
const TabunganQurbanSetoran = require('./TabunganQurbanSetoran');
const Agenda = require('./Agenda');
const Pengumuman = require('./Pengumuman');
const Inventaris = require('./Inventaris');

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Register models
db.User = User;
db.Masjid = Masjid;
db.Kategori = Kategori;
db.AsetTidakTerbatas = AsetTidakTerbatas;
db.AsetTerbatas = AsetTerbatas;
db.AkunKas = AkunKas;
db.Jamaah = Jamaah;
db.Zakat = Zakat;
db.QurbanHewan = QurbanHewan;
db.QurbanPeserta = QurbanPeserta;
db.TabunganQurban = TabunganQurban;
db.TabunganQurbanSetoran = TabunganQurbanSetoran;
db.Agenda = Agenda;
db.Pengumuman = Pengumuman;
db.Inventaris = Inventaris;

// Associations
// 1 User can manage 1 (or many) Masjid. Let's assume 1-to-many for flexibility.
User.hasMany(Masjid);
Masjid.belongsTo(User);

// Akun Kas
Masjid.hasMany(AkunKas);
AkunKas.belongsTo(Masjid);

// Jamaah
Masjid.hasMany(Jamaah);
Jamaah.belongsTo(Masjid);

// Zakat
Masjid.hasMany(Zakat);
Zakat.belongsTo(Masjid);

// Qurban
Masjid.hasMany(QurbanHewan);
QurbanHewan.belongsTo(Masjid);

QurbanHewan.hasMany(QurbanPeserta, { as: 'peserta' });
QurbanPeserta.belongsTo(QurbanHewan);

Masjid.hasMany(TabunganQurban);
TabunganQurban.belongsTo(Masjid);

TabunganQurban.hasMany(TabunganQurbanSetoran, { as: 'setoran' });
TabunganQurbanSetoran.belongsTo(TabunganQurban);

// Modul Masjid
Masjid.hasMany(Agenda);
Agenda.belongsTo(Masjid);

Masjid.hasMany(Pengumuman);
Pengumuman.belongsTo(Masjid);

Masjid.hasMany(Inventaris);
Inventaris.belongsTo(Masjid);

// Aset belongs to Masjid
Masjid.hasMany(AsetTidakTerbatas);
AsetTidakTerbatas.belongsTo(Masjid);

Masjid.hasMany(AsetTerbatas);
AsetTerbatas.belongsTo(Masjid);

// Aset belongs to Kategori
Kategori.hasMany(AsetTidakTerbatas);
AsetTidakTerbatas.belongsTo(Kategori);

Kategori.hasMany(AsetTerbatas);
AsetTerbatas.belongsTo(Kategori);

// Sync function to help with development
db.sync = async () => {
    try {
        await sequelize.sync({ alter: true }); // alter: true updates tables without dropping them
        console.log('Database & tables synced!');
    } catch (error) {
        console.error('Error syncing database:', error);
    }
};

module.exports = db;
