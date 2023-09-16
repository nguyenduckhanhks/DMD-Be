"use strict";
import * as fastify from "fastify";
import APIGuard from "../../guard/api-guard";
import { HistoryInsertOrderEntity, OrderEntity } from "../../entities";
import { sequelize } from "../../database";
import { Transaction } from "sequelize";
export default async function (app: fastify.FastifyInstance) {
  app.route({
    method: "POST",
    url: "/insert-order",
    schema: {
      body: {
        type: "object",
        properties: {
          title: { type: "string" },
          data: { type: "array" },
        },
      },
    },
    preHandler: [APIGuard],
    handler: async function (request: any, reply: any) {
      const { title, data } = request.body;
      const historyInsertInfo = new HistoryInsertOrderEntity({
        title,
        user_id: request.user.id,
      });
      const orderInfos: OrderEntity[] = data.map(
        (dt: {
          tracking_id: string;
          customer_name: string;
          address: string;
          state: string;
          zip: string;
          country: string;
          city: string;
          pdf: string;
          page: number;
          status: boolean;
          text_note: number;
        }) => {
          return new OrderEntity(dt);
        }
      );
      await sequelize.transaction(async (t: Transaction) => {
        await historyInsertInfo.save({ transaction: t });
        await Promise.all(
          orderInfos.map(async (orderInfo) => {
            try {
              orderInfo.history_id = historyInsertInfo.id;
              await orderInfo.save({ transaction: t });
            } catch (err) {
              console.log(err)
            }
          })
        );
      });
      return {
        historyInsertInfo,
        orderInfos,
      };
    },
  });
}
