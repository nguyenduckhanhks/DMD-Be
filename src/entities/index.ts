import { Model, Table } from "sequelize-typescript";
export { default as UserEntity } from "./user.entity";
export { default as RoleEntity } from "./role.entity";
export { default as PasswordEntity } from "./password.entity";
export { default as HistoryInsertOrderEntity } from "./history-insert-order.entity";
export { default as OrderEntity } from "./order.entity";
@Table({})
export default class UselessEntity extends Model {}
