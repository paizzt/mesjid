const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite'
});
const Masjid = sequelize.define('Masjid', {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  nama_masjid: DataTypes.STRING,
  alamat: DataTypes.TEXT
}, { tableName: 'masjid', timestamps: true });

async function check() {
  const masjids = await Masjid.findAll();
  console.log('Masjids in DB:', masjids.map(m => ({ id: m.id, nama_masjid: m.nama_masjid })));
}
check();
