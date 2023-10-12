"use strict";
import * as fastify from "fastify";
import { OrderEntity } from "../../entities";
import gcp from "../../services/gcp";
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
      if (!orderInfo.status && !orderInfo.bypass) {
        throw new Error("order_invalid_data");
      }
      let pdf = await orderInfo.getPdf();
      if (pdf.includes("https")) {
        pdf = await gcp.getSignedUrl(gcp.extractBucketUrl(pdf));
      }

      return {
        pdf,
      };
    },
  });
}
