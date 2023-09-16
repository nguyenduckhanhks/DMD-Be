"use strict";
import dayjs from "dayjs";
import * as fastify from "fastify";
import { CancelStatus } from "../../config/interface";
import { OrderEntity } from "../../entities";
import APIGuard from "../../guard/api-guard";
export default async function (app: fastify.FastifyInstance) {
  app.route({
    method: "POST",
    url: "/confirm-cancel",
    schema: {
      body: {
        type: "object",
        properties: {
          id: { type: "number" },
        },
        required: ["id"],
      },
    },
    preHandler: APIGuard,
    handler: async function (request: any, reply: any) {
      const { id: order_id } = request.body;
      const orderInfo = await OrderEntity.findByPk(order_id);
      if (!orderInfo) {
        throw new Error("not_found");
      }

      if (orderInfo.cancel_status !== CancelStatus.Cancelling) {
        throw new Error("invalid_status");
      }

      orderInfo.cancel_status = CancelStatus.Canceled;
      // orderInfo.old_tracking_id = orderInfo.tracking_id;
      // orderInfo.tracking_id = orderInfo.new_tracking_id;
      // orderInfo.new_tracking_id = null;
      orderInfo.last_approve_cancel = dayjs().toDate();

      await orderInfo.save();
      return orderInfo;
    },
  });
}
