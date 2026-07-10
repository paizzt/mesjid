const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Add new columns to masjid table
    console.log('Adding telepon column...');
    await client.query(`
      ALTER TABLE masjid 
      ADD COLUMN IF NOT EXISTS telepon VARCHAR(255);
    `);

    console.log('Adding email column...');
    await client.query(`
      ALTER TABLE masjid 
      ADD COLUMN IF NOT EXISTS email VARCHAR(255);
    `);

    console.log('Adding ketua_pengurus column...');
    await client.query(`
      ALTER TABLE masjid 
      ADD COLUMN IF NOT EXISTS ketua_pengurus VARCHAR(255);
    `);

    console.log('Adding countdown_duration column...');
    await client.query(`
      ALTER TABLE masjid 
      ADD COLUMN IF NOT EXISTS countdown_duration INTEGER DEFAULT 600;
    `);

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
