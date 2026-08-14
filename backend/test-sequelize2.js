const { Sequelize, DataTypes, Op } = require('sequelize');
const sequelize = new Sequelize('sqlite::memory:');

const User = sequelize.define('User', {
  username: DataTypes.STRING,
  email: DataTypes.STRING,
});

async function test() {
  await sequelize.sync();
  await User.create({ username: 'test', email: 'test@test.com' });

  const username = undefined;
  const email = undefined;
  const userId = 1;

  try {
      const existingUser = await User.findOne({ 
          where: { 
              [Op.or]: [
                  username ? { username } : null, 
                  email ? { email } : null
              ].filter(Boolean),
              id: { [Op.ne]: userId }
          } 
      });
      console.log('Query succeeded!', existingUser ? existingUser.toJSON() : null);
  } catch (err) {
      console.error('Query failed:', err.message);
  }
}
test();
