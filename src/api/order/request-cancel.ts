"use strict";
import * as fastify from "fastify";
import { CancelStatus } from "../../config/interface";
import { OrderEntity } from "../../entities";
import APIGuard from "../../guard/api-guard";
export default async function (app: fastify.FastifyInstance) {
  app.route({
    method: "POST",
    url: "/request-cancel",
    preHandler: APIGuard,
    handler: async function (request: any, reply: any) {
      const { id: order_id, tracking_id } = request.body;
      const orderInfo = await OrderEntity.findByPk(order_id);
      if (!orderInfo) {
        throw new Error("not_found");
      }
      if (orderInfo.cancel_status !== CancelStatus.None) {
        throw new Error('invalid_status')
      }
      orderInfo.cancel_status = CancelStatus.Cancelling;
      orderInfo.new_tracking_id = "";
      await orderInfo.save();
      return orderInfo;
    },
  });
}
