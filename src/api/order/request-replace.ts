"use strict";
import * as fastify from "fastify";
import { Transaction } from "sequelize";
import { CancelStatus } from "../../config/interface";
import { sequelize } from "../../database";
import { OrderEntity } from "../../entities";
import APIGuard from "../../guard/api-guard";
export default async function (app: fastify.FastifyInstance) {
  app.route({
    method: "POST",
    url: "/request-replace",
    preHandler: APIGuard,
    handler: async function (request: any, reply: any) {
      const payload = request.body;
      let { id } = payload;
      let orderInfo = await OrderEntity.findByPk(id);
      if (!orderInfo) {
        throw new Error("invalid_order");
      }

      if (orderInfo.cancel_status !== CancelStatus.None) {
        throw new Error("invalid_order")
      }

      if (orderInfo.tracking_id === payload.tracking_id) {
        throw new Error("same_tracking_id");
      }

      delete payload.id;
      let newOrder = new OrderEntity({
        ...payload,
        old_labels: [...(payload.old_labels ?? []), orderInfo.pdf],
        cancel_status: CancelStatus.Pending
      });

      orderInfo.cancel_status = CancelStatus.Cancelling;
      orderInfo.last_approve_cancel = new Date();
      orderInfo.new_tracking_id = payload.tracking_id;

      await sequelize.transaction(async (transaction: Transaction) => {
        await newOrder.save({ transaction });
        await orderInfo.save({ transaction });
      });

      return newOrder;
    },
  });
}
