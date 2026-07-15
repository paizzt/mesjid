const bcrypt = require('bcryptjs');
const db = require('./models');

async function fixUsers() {
  try {
    // Delete duplicate users that were added separately
    await db.User.destroy({ where: { id: [10, 11] } });
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('12345678', salt);

    // Update real takmir (id 1)
    await db.User.update(
      { email: 'takmir@gmail.com', password: hashedPassword },
      { where: { id: 1 } }
    );

    // Update real bendahara (id 2)
    await db.User.update(
      { email: 'bendahara@gmail.com', password: hashedPassword },
      { where: { id: 2 } }
    );

    console.log("Berhasil memperbarui email dan password di database!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
fixUsers();
