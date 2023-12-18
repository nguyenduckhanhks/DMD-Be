import { Op } from "sequelize";
import { Order17TrackEntity } from "../entities";
import axios from "axios";

export default async function scheduleRegister17Track() {
  for (; true; ) {
    console.log("start register 17track");
    try {
      let orders = await Order17TrackEntity.findAll({
        where: {
          [Op.or]: {
            is_register_container: false,
            is_register_tracking: false,
          },
        },
        limit: 40,
      });

      const trackingIds: string[] = [];
      orders.map((order) => {
        if (
          trackingIds.length < 40 &&
          !trackingIds.includes(order.tracking_id)
        ) {
          trackingIds.push(order.tracking_id);
        }
        if (
          trackingIds.length < 40 &&
          !trackingIds.includes(order.container_tracking_id)
        ) {
          trackingIds.push(order.container_tracking_id);
        }
      });
      console.log({ trackingIds });
      const response: any = await axios.post(
        "https://api.17track.net/track/v2.2/register",
        JSON.stringify(
          trackingIds.map((id) => {
            return {
              number: id,
            };
          })
        ),
        {
          headers: {
            "content-type": "application/json",
            "17token": process.env.KEY_17TRACK,
          },
        }
      );
      let trackingIdSuccess: string[] = [];
      if (response && response.data && response.data.code == 0) {
        response.data?.data?.accepted.map((dt: any) => {
          trackingIdSuccess.push(dt.number);
        });
        response.data?.data?.rejected.map((dt: any) => {
          if (
            dt.error.code == "-18019901" &&
            dt.error.message.includes("registered")
          )
            trackingIdSuccess.push(dt.number);
        });
      }
      for (let order of orders) {
        if (trackingIdSuccess.includes(order.tracking_id)) {
          order.is_register_tracking = true;
        }
        if (trackingIdSuccess.includes(order.container_tracking_id)) {
          order.is_register_container = true;
        }
        await order.save();
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
