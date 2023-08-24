import { Model, Table, Column, DataType } from "sequelize-typescript";
@Table({
  tableName: "history-insert-order",
  version: true,
  underscored: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
})
export default class HistoryInsertOrderEntity extends Model {
  @Column({ type: DataType.INTEGER })
  user_id: number;
  @Column({ type: DataType.STRING })
  title: string;
}
