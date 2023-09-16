"use strict";
import * as fastify from "fastify";
import { CancelStatus } from "../../config/interface";
import { OrderEntity } from "../../entities";
import APIGuard from "../../guard/api-guard";
export default async function (app: fastify.FastifyInstance) {
  app.route({
    method: "POST",
    url: "/request-cancel",
    schema: {
      body: {
        type: "object",
        properties: {
          order_id: { type: "number" },
          new_tracking_id: { type: "string" },
        },
        required: ["order_id"],
      },
    },
    preHandler: APIGuard,
    handler: async function (request: any, reply: any) {
      const { order_id, new_tracking_id } = request.body;
      const orderInfo = await OrderEntity.findByPk(order_id);
      if (!orderInfo) {
        throw new Error("not_found");
      }

      if (new_tracking_id) {
        let ordernew = await OrderEntity.findOne({
          where: {
            tracking_id: new_tracking_id,
          },
        });

        if (!ordernew) {
          throw new Error("new_tracking_not_found");
        }
      }

      orderInfo.cancel_status = CancelStatus.Cancelling;
      orderInfo.new_tracking_id = new_tracking_id;

      await orderInfo.save();
      return orderInfo;
    },
  });
}
