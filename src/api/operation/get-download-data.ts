"use strict";
import * as fastify from "fastify";
import { Op } from "sequelize";
import { OrderEntity } from "../../entities";
import APIGuard from "../../guard/api-guard";
import gcp from "../../services/gcp";
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
          isLabel: { type: "boolean" },
        },
      },
    },
    preHandler: APIGuard,
    handler: async function (request: any, reply: any) {
      let { gridName, isDownloadAll, ids, isLabel } = request.body;
      let gridInfo = admin.getGridByName(gridName);

      let data;
      let fieldInfos = gridInfo.columns.map((column: any) => column.field);
      fieldInfos.push("is_upload_cloud");
      if (!isLabel) {
        fieldInfos = fieldInfos.filter((field: string) => field !== "pdf");
      }

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
          data = await Promise.all(
            data.map(async (d) => {
              if (d.is_upload_cloud && isLabel) {
                d.pdf = await gcp.getImageDataAndConvertToBase64(d.pdf);
              }
              return d;
            })
          );
        }
      }

      return data ?? [];
    },
  });
}
