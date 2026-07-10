const sequelize = require('./config/database');

async function fixDB() {
  try {
    // Check if AkunKasId exists in aset_tidak_terbatas
    try {
      await sequelize.query('ALTER TABLE aset_tidak_terbatas ADD COLUMN AkunKasId INTEGER REFERENCES akun_kas(id) ON UPDATE CASCADE ON DELETE SET NULL;');
      console.log('Added AkunKasId to aset_tidak_terbatas');
    } catch (err) {
      console.log('Error aset_tidak_terbatas:', err.message);
    }
    
    // Check if AkunKasId exists in aset_terbatas
    try {
      await sequelize.query('ALTER TABLE aset_terbatas ADD COLUMN AkunKasId INTEGER REFERENCES akun_kas(id) ON UPDATE CASCADE ON DELETE SET NULL;');
      console.log('Added AkunKasId to aset_terbatas');
    } catch (err) {
      console.log('Error aset_terbatas:', err.message);
    }

    // Check if KategoriId exists in aset_tidak_terbatas
    try {
      await sequelize.query('ALTER TABLE aset_tidak_terbatas ADD COLUMN KategoriId INTEGER REFERENCES kategori(id) ON UPDATE CASCADE ON DELETE SET NULL;');
      console.log('Added KategoriId to aset_tidak_terbatas');
    } catch (err) {
      console.log('Error aset_tidak_terbatas (KategoriId):', err.message);
    }
    
    // Check if KategoriId exists in aset_terbatas
    try {
      await sequelize.query('ALTER TABLE aset_terbatas ADD COLUMN KategoriId INTEGER REFERENCES kategori(id) ON UPDATE CASCADE ON DELETE SET NULL;');
      console.log('Added KategoriId to aset_terbatas');
    } catch (err) {
      console.log('Error aset_terbatas (KategoriId):', err.message);
    }

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

fixDB();
