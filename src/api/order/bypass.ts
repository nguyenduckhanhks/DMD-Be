"use strict";
import * as fastify from "fastify";
import { OrderEntity } from "../../entities";
import APIGuard from "../../guard/api-guard";
export default async function (app: fastify.FastifyInstance) {
  app.route({
    method: "POST",
    url: "/bypass",
    preHandler: APIGuard,
    handler: async function (request: any, reply: any) {
      const { id: order_id } = request.body;
      const orderInfo = await OrderEntity.findByPk(order_id);

      if (orderInfo.status) {
        throw new Error("not_required_bypass");
      }
      if (!orderInfo.bypass) {
        orderInfo.bypass = true;
      }

      await orderInfo.save();
      return orderInfo;
    },
  });
}
