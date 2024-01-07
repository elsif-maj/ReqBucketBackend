import { Sequelize } from 'sequelize';

const connectionString = process.env.POSTGRES_URI!;

const sequelize = new Sequelize(connectionString, {
  dialect: 'postgres',
  logging: console.log,  // Set to true if you want to see SQL queries in the console
});

export default sequelize;