import { Model, Table, Column, DataType, Unique, Default } from "sequelize-typescript";
import { CancelStatus } from "../config/interface";
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
  @Default(true)
  @Column({ type: DataType.BOOLEAN })
  status: boolean;
  @Column({ type: DataType.TEXT })
  text_note: string;
  @Default(CancelStatus.None)
  @Column({ type: DataType.TINYINT })
  cancel_status: CancelStatus;
  @Column({ type: DataType.STRING })
  new_tracking_id: string;
  @Column({ type: DataType.STRING })
  old_tracking_id: string;
  @Column({ type: DataType.DATE })
  last_approve_cancel: Date;
  @Default(false)
  @Column({ type: DataType.BOOLEAN })
  bypass: boolean;
  @Default([])
  @Column({ type: DataType.JSON })
  old_labels: string[];

  public async getPdf(): Promise<string> {
    if (this.new_tracking_id) {
      let orderInfo = await OrderEntity.findOne({ where: { tracking_id: this.new_tracking_id } });
      if (!orderInfo) {
        throw new Error("invalid_order");
      }
      return orderInfo.getPdf();
    }
    return this.pdf;
  }
}
