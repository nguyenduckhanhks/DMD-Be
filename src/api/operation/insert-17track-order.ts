"use strict";
import * as fastify from "fastify";
import APIGuard from "../../guard/api-guard";
import {
  HistoryInsertOrderEntity,
  Order17TrackEntity,
  OrderEntity,
} from "../../entities";
import { sequelize } from "../../database";
import { Transaction } from "sequelize";
import { crypt } from "../../services";
export default async function (app: fastify.FastifyInstance) {
  app.route({
    method: "POST",
    url: "/insert-17track-order",
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
        title: title ?? "",
        user_id: request.user.id,
      });
      const order17TrackInfos: OrderEntity[] = data.map(
        (dt: { tracking_id: string; container_id: string }) => {
          return new Order17TrackEntity({
            tracking_id: dt.tracking_id,
            container_tracking_id: dt.container_id,
            dmd_tracking_id: `dmd-${crypt.uid()}`,
          });
        }
      );
      await sequelize.transaction(async (t: Transaction) => {
        await historyInsertInfo.save({ transaction: t });
        await Promise.all(
          order17TrackInfos.map(async (order17TrackInfo) => {
            try {
              order17TrackInfo.history_id = historyInsertInfo.id;
              await order17TrackInfo.save({ transaction: t });
            } catch (err) {
              console.log(err);
            }
          })
        );
      });
      return {
        historyInsertInfo,
        order17TrackInfos,
      };
    },
  });
}
