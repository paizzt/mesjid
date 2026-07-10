const sequelize = require('./config/database');

async function updateDB() {
  try {
    await sequelize.query("UPDATE masjid SET nama_masjid = 'Masjid Raya Al-Falah' WHERE nama_masjid = 'Masjid Agung Sultan Alauddin'");
    console.log('DB Updated');
  } catch(e) {
    console.error('Error:', e);
  } finally {
    process.exit(0);
  }
}

updateDB();
