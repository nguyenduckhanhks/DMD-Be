import { Sequelize } from "sequelize-typescript";
import {
  HistoryInsertOrderEntity,
  Order17TrackEntity,
  OrderEntity,
  PasswordEntity,
  RoleEntity,
  UserEntity,
} from "./entities";
export const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),
  host: process.env.DB_HOST,
  dialect: "mysql",
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  models: [
    UserEntity,
    RoleEntity,
    PasswordEntity,
    OrderEntity,
    HistoryInsertOrderEntity,
    Order17TrackEntity,
  ],
  // query: { raw: true },
  logging: false,
  pool: {
    max: 100,
  },
});
export default async function init() {
  await sequelize.sync({ alter: true });
}
