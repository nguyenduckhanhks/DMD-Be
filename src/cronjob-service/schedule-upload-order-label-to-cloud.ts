import dayjs from "dayjs";
import { OrderEntity } from "../entities";
import gcp from "../services/gcp";

export default async function scheduleUploadOrderLabelToCloud() {
  for (; true; ) {
    try {
      let events = await OrderEntity.findAll({
        where: {
          is_upload_cloud: false,
        },
        limit: 5,
      });
    
      for (var i = 0; i < events.length; i++) {
        try {
          await handleUploadLabel(events[i]);
        } catch (error) {
          console.error("handle upload label error ", events[i].id);
        }
      }
    } catch (error) {
      console.log("cronjob error ", error);
    } finally {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(null);
        }, 60000);
      });
    }
  }
}

async function handleUploadLabel(orderInfo: OrderEntity) {
  let label = orderInfo.pdf;
  let fileName = `${dayjs().format("DD-MM-YYYY")}-${orderInfo.tracking_id}.png`;
  let publicUrl = await gcp.uploadBase64Image(label, fileName);

  if (!publicUrl) {
    return;
  }
  orderInfo.pdf = publicUrl;
  orderInfo.is_upload_cloud = true;
  await orderInfo.save();
}
