const db = require('./models');
async function showUsers() {
   const users = await db.User.findAll({attributes: ['id', 'username', 'email', 'role']});
   console.log(JSON.stringify(users, null, 2));
   process.exit(0);
}
showUsers();
