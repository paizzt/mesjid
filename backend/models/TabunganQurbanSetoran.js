const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TabunganQurbanSetoran = sequelize.define('TabunganQurbanSetoran', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tanggal: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    nominal: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    keterangan: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = TabunganQurbanSetoran;
