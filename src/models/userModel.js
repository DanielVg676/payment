import { DataTypes } from "sequelize";
import Sequelize from '../config/bd.js';

const User = Sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    rol: {
        type: DataTypes.ENUM('admin', 'customer', 'seller'),
        allowNull: false,
        defaultValue: 'customer'
    },
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    creationDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    timestamps: false, // Esto debe estar dentro del objeto de configuración
    tableName: 'users', // Esto también debe estar dentro del objeto de configuración
});

export default User;