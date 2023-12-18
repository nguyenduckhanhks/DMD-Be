"use strict";
import * as fastify from "fastify";
import { Order17TrackEntity } from "../../entities";
import APIGuard from "../../guard/api-guard";
export default async function (app: fastify.FastifyInstance) {
  app.route({
    method: "POST",
    url: "/get-tracking-by-dmd",
    schema: {
      body: {
        type: "object",
        properties: {
          id: { type: "string" },
        },
        required: ["id"],
      },
    },
    preHandler: APIGuard,
    handler: async function (request: any, reply: any) {
      const { id: dmd_tracking_id } = request.body;
      const order17TrackInfo = await Order17TrackEntity.findOne({
        where: {
          dmd_tracking_id,
        },
      });
      if (!order17TrackInfo) {
        throw new Error("not_found");
      }
      let data: any = {
        number: order17TrackInfo.dmd_tracking_id,
        track_info: null,
      };
      if (order17TrackInfo.data_tracking) {
        const trackingData = order17TrackInfo.data_tracking;
        if (trackingData[order17TrackInfo.container_tracking_id]) {
          data.track_info =
            trackingData[order17TrackInfo.container_tracking_id].track_info;
        }
        if (trackingData[order17TrackInfo.tracking_id]) {
          data.track_info = {
            ...data.track_info,
            latest_status:
              trackingData[order17TrackInfo.tracking_id].track_info
                .latest_status,
            latest_event:
              trackingData[order17TrackInfo.tracking_id].track_info
                .latest_event,
            shipping_info:
              trackingData[order17TrackInfo.tracking_id].track_info
                .shipping_info,
            time_metrics:
              trackingData[order17TrackInfo.tracking_id].track_info
                .time_metrics,
            misc_info:
              trackingData[order17TrackInfo.tracking_id].track_info.misc_info,
            milestone: data.track_info.milestone.concat(
              trackingData[order17TrackInfo.tracking_id].track_info.milestone
            ),
            tracking: {
              ...trackingData[order17TrackInfo.tracking_id].track_info.tracking,
              providers: trackingData[
                order17TrackInfo.tracking_id
              ].track_info.tracking.providers.concat(
                data.track_info.tracking.providers
              ),
            },
          };
        }
      }
      return data;
    },
  });
}
