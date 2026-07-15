require('dotenv').config();
const app = require('./app');
const db = require('./models');

const PORT = process.env.PORT || 3000;

// Test DB Connection and Start Server
const startServer = async () => {
    try {
        await db.sequelize.authenticate();
        console.log('Connection to SQLite has been established successfully.');
        
        // Sync database automatically for SQLite
        await db.sequelize.sync({ force: false });
        console.log('Database & tables synced!');

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Run 'npm run migrate' to apply migrations`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

startServer();
