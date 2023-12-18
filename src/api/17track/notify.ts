"use strict";
import * as fastify from "fastify";
import { Event17TrackName } from "../../config/interface";
import { Order17TrackEntity } from "../../entities";
import { Op } from "sequelize";

export default async function (app: fastify.FastifyInstance) {
  app.route({
    method: "POST",
    url: "/notify",
    preHandler: [],
    handler: async function (request: any, reply: any) {
      console.log(request.body);
      console.log(JSON.stringify(request.body));
      const { event, data } = request.body;
      console.log({event, data})
      switch (event) {
        case Event17TrackName.TRACKING_UPDATED:
          const { number: tracking17NumberUpdate, carrier, track_info } = data;
          const order17trackUpdate = await Order17TrackEntity.findOne({
            where: {
              [Op.or]: {
                tracking_id: tracking17NumberUpdate,
                container_tracking_id: tracking17NumberUpdate,
              },
            },
          });
          if (order17trackUpdate) {
            if (!order17trackUpdate.data_tracking) {
              order17trackUpdate.data_tracking = {};
            }
            if (order17trackUpdate.is_complete_tracking) {
              return;
            } else if (order17trackUpdate.is_complete_container) {
              return;
            }
            order17trackUpdate.data_tracking[tracking17NumberUpdate] = {
              track_info,
              carrier,
            };
            order17trackUpdate.changed("data_tracking", true);
            await order17trackUpdate.save();
          }
          break;
        case Event17TrackName.TRACKING_STOPPED:
          const { number: tracking17NumberStop } = data;
          const order17trackStop = await Order17TrackEntity.findOne({
            where: {
              [Op.or]: {
                tracking_id: tracking17NumberStop,
                container_tracking_id: tracking17NumberStop,
              },
            },
          });
          if (order17trackStop) {
            if (order17trackStop.tracking_id == tracking17NumberStop) {
              order17trackStop.is_complete_tracking = true;
            } else if (
              order17trackStop.container_tracking_id == tracking17NumberStop
            ) {
              order17trackStop.is_complete_container = true;
            }
            await order17trackStop.save();
          }
          break;
      }
      return;
    },
  });
}
