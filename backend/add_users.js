const bcrypt = require('bcryptjs');
const db = require('./models'); // Assuming models/index.js exports the Sequelize instance and models

async function createUsers() {
  try {
    const hashedPassword = await bcrypt.hash('12345678', 10);
    
    // Takmir
    await db.User.upsert({
      username: 'takmir@gmail.com',
      email: 'takmir@gmail.com',
      password: hashedPassword,
      nama_lengkap: 'Takmir Masjid',
      no_hp: '081111111111',
      role: 'takmir',
      status_verifikasi: 'approved',
    });

    // Bendahara
    await db.User.upsert({
      username: 'bendahara@gmail.com',
      email: 'bendahara@gmail.com',
      password: hashedPassword,
      nama_lengkap: 'Bendahara Masjid',
      no_hp: '082222222222',
      role: 'bendahara',
      status_verifikasi: 'approved',
    });

    console.log("Akun berhasil dibuat!");
  } catch (err) {
    console.error("Gagal membuat akun:", err);
  } finally {
    process.exit();
  }
}

createUsers();
