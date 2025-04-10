import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USERS,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port:process.env.DB_PORT,
        dialect: 'mysql',
        logging: false,
    }
);

sequelize.authenticate()
    .then(() => console.log('conexion con exito a la base de datos'))
    .catch(err => console.log('No se a podido conectar a la base de datos bd.js: ', err))

export default sequelize;