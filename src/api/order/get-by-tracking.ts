"use strict";
import * as fastify from "fastify";
import { OrderEntity } from "../../entities";
export default async function (app: fastify.FastifyInstance) {
  app.route({
    method: "POST",
    url: "/get-by-tracking",
    schema: {
      body: {
        type: "object",
        properties: {
          tracking: { type: "string" },
        },
      },
    },
    handler: async function (request: any, reply: any) {
      const { tracking } = request.body;
      const orderInfo = await OrderEntity.findOne({
        where: { tracking_id: tracking },
      });
      if (!orderInfo) {
        throw new Error("not_found");
      }
      return {
        pdf: orderInfo.pdf,
      };
    },
  });
}
