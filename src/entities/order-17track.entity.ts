import {
  Model,
  Table,
  Column,
  DataType,
  Unique,
  BeforeCreate,
  BeforeUpdate,
  BeforeBulkCreate,
  BeforeBulkUpdate,
  Index,
  Default,
} from "sequelize-typescript";
@Table({
  tableName: "order-17track",
  version: true,
  underscored: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
})
export default class Order17TrackEntity extends Model {
  @Column({ type: DataType.INTEGER })
  history_id: number;
  @Index("tracking_idx")
  @Unique("tracking")
  @Column({ type: DataType.STRING })
  tracking_id: string;
  @Index("container_tracking_idx")
  @Column({ type: DataType.STRING })
  container_tracking_id: string;
  @Index("dmd_tracking_idx")
  @Unique("dmd_tracking_id")
  @Column({ type: DataType.STRING })
  dmd_tracking_id: string;
  @Default(false)
  @Column({ type: DataType.BOOLEAN })
  is_complete_container: boolean;
  @Default(false)
  @Column({ type: DataType.BOOLEAN })
  is_complete_tracking: boolean;
  @Default(false)
  @Column({ type: DataType.BOOLEAN })
  is_register_container: boolean;
  @Default(false)
  @Column({ type: DataType.BOOLEAN })
  is_register_tracking: boolean;
  @Column({ type: DataType.JSON })
  data_tracking: any;

  @BeforeCreate
  @BeforeUpdate
  static checkTrackingId(inst: Order17TrackEntity) {
    inst.tracking_id = inst.tracking_id.replace(" ", "");
    inst.container_tracking_id = inst.container_tracking_id.replace(" ", "");
  }

  @BeforeBulkCreate
  @BeforeBulkUpdate
  static async checkTrackingIds(inst: Order17TrackEntity[]) {
    inst.forEach((data) => {
      data.tracking_id = data.tracking_id.replace(" ", "");
      data.container_tracking_id = data.container_tracking_id.replace(" ", "");
    });
  }
}
