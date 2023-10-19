import {
  Model,
  Table,
  Column,
  DataType,
  Unique,
  Default,
  BeforeCreate,
  BeforeUpdate,
  BeforeBulkCreate,
  BeforeBulkUpdate,
  Index,
} from "sequelize-typescript";
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
  @Index("tracking_idx")
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
  @Column({ type: DataType.TEXT("long") })
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
  @Index("is_upload_cloud")
  @Default(false)
  @Column({ type: DataType.BOOLEAN })
  is_upload_cloud: boolean;
  @Column({ type: DataType.DATE })
  required_upload_cloud_at: Date;

  @BeforeCreate
  @BeforeUpdate
  static checkTrackingId(inst: OrderEntity) {
    inst.tracking_id = inst.tracking_id.replace(" ", "");
  }

  @BeforeBulkCreate
  @BeforeBulkUpdate
  static async checkTrackingIds(inst: OrderEntity[]) {
    inst.forEach((data) => {
      data.tracking_id = data.tracking_id.replace(" ", "");
    });
  }

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
