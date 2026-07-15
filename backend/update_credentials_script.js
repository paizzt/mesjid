const bcrypt = require('bcryptjs');
const db = require('./models');

async function updateDb() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('12345678', salt);

    await db.User.update(
      { email: 'takmir@gmail.com', username: 'takmir', password: hashedPassword },
      { where: { role: 'takmir' } }
    );

    await db.User.update(
      { email: 'bendahara@gmail.com', username: 'bendahara', password: hashedPassword },
      { where: { role: 'bendahara' } }
    );
    
    console.log("Berhasil memperbarui email dan password di database!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

updateDb();
