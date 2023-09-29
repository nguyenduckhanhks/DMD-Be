"use strict";
import dayjs from "dayjs";
import * as fastify from "fastify";
import { Transaction } from "sequelize";
import { CancelStatus } from "../../config/interface";
import { sequelize } from "../../database";
import { OrderEntity } from "../../entities";
import APIGuard from "../../guard/api-guard";
export default async function (app: fastify.FastifyInstance) {
  app.route({
    method: "POST",
    url: "/decline-cancel",
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

      orderInfo.cancel_status = CancelStatus.None;
      orderInfo.new_tracking_id = null;

      let newOrder: OrderEntity = null;
      if (orderInfo.new_tracking_id) {
        newOrder = await OrderEntity.findOne({ where: { tracking: orderInfo.new_tracking_id } });
      }
      await sequelize.transaction(async (transaction: Transaction) => {
        await orderInfo.save({ transaction });
        await newOrder?.destroy({ transaction });
      });
      return orderInfo;
    },
  });
}
