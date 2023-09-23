"use strict";
import * as fastify from "fastify";
import { Op } from "sequelize";
import { OrderEntity } from "../../entities";
import APIGuard from "../../guard/api-guard";
import { admin } from "../../services/user";

export default async function (app: fastify.FastifyInstance) {
  app.route({
    method: "POST",
    url: "/get-download-data",
    schema: {
      body: {
        type: "object",
        properties: {
          gridName: { type: "string" },
          isDownloadAll: { type: "boolean" },
          ids: { type: "array" },
        },
      },
    },
    preHandler: APIGuard,
    handler: async function (request: any, reply: any) {
      let { gridName, isDownloadAll, ids } = request.body;
      let gridInfo = admin.getGridByName(gridName);

      let data: any[] = [];
      let fieldInfos = gridInfo.columns.map((column: any) => column.field);
      if (["order", "valid-order", "invalid-order", "canceling-order", "canceled-order"].includes(gridName)) {
        if (isDownloadAll) {
          data = await OrderEntity.findAll({
            where: {},
            limit: 200,
            offset: 0,
            attributes: fieldInfos,
          });
        } else {
          data = await OrderEntity.findAll({
            where: {
              id: {
                [Op.in]: ids,
              },
            },
            attributes: fieldInfos,
          });
        }
      }

      return data;
    },
  });
}
