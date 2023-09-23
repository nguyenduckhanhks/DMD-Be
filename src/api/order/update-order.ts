"use strict";
import * as fastify from "fastify";
import { OrderEntity } from "../../entities";
import APIGuard from "../../guard/api-guard";
export default async function (app: fastify.FastifyInstance) {
  app.route({
    method: "POST",
    url: "/update-order",
    preHandler: APIGuard,
    handler: async function (request: any, reply: any) {
      const payload = request.body;
      let orderInfo = await OrderEntity.findByPk(payload.id);
      if (!orderInfo) {
        throw new Error("not_found");
      }

      let { tracking_id, text_note } = payload;
      if (tracking_id !== orderInfo.tracking_id) {
        throw new Error("cannot_edit_tracking_id");
      }
      if (text_note !== orderInfo.text_note) {
        throw new Error("cannot_edit_label");
      }

      await orderInfo.update({
        ...payload,
      });
      return orderInfo;
    },
  });
}
