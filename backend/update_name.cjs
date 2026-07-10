const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.run("UPDATE Masjid SET alamat = 'Kampus II UIN Alauddin'", function(err) {
  if (err) {
    return console.error(err.message);
  }
  console.log(`Address updated. Row(s) changed: ${this.changes}`);
});
