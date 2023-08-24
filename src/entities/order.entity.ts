import { Model, Table, Column, DataType, Unique } from "sequelize-typescript";
@Table({
  tableName: "order",
  version: true,
  underscored: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
})
export default class OrderEntity extends Model {
  @Column({ type: DataType.INTEGER })
  history_id: number;
  @Unique("tracking")
  @Column({ type: DataType.STRING })
  tracking_id: string;
  @Column({ type: DataType.STRING })
  customer_name: string;
  @Column({ type: DataType.STRING })
  address: string;
  @Column({ type: DataType.STRING })
  city: string;
  @Column({ type: DataType.STRING })
  state: string;
  @Column({ type: DataType.STRING })
  zip: string;
  @Column({ type: DataType.STRING })
  country: string;
  @Column({ type: DataType.TEXT })
  pdf: string;
  @Column({ type: DataType.INTEGER })
  page: number;
  @Column({ type: DataType.BOOLEAN })
  status: boolean;
  @Column({ type: DataType.TEXT })
  text_note: string;
}
