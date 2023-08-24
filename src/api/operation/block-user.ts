"use strict";
import * as fastify from "fastify";
import APIGuard from "../../guard/api-guard";
import { blockUser } from "../../services/user";
export default async function (app: fastify.FastifyInstance) {
  app.route({
    method: "POST",
    url: "/block-user",
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
    handler: async function (req: any, res: any) {
      const { id } = req.body;
      let userInfo = await blockUser(id);
      return userInfo;
    },
  });
}
