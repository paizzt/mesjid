const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite'
});
const User = sequelize.define('User', {
  username: DataTypes.STRING,
  email: DataTypes.STRING,
  nama_lengkap: DataTypes.STRING
}, { timestamps: true });

async function check() {
  const users = await User.findAll();
  console.log(users.map(u => ({ id: u.id, username: u.username, email: u.email, nama_lengkap: u.nama_lengkap })));
}
check();
