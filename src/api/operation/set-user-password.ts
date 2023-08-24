"use strict";
import * as fastify from "fastify";
import APIGuard from "../../guard/api-guard";
import { setPassword } from "../../services/user";
export default async function (app: fastify.FastifyInstance) {
  app.route({
    method: "POST",
    url: "/set-user-password",
    schema: {
      body: {
        type: "object",
        properties: {
          id: { type: "number" },
          password: { type: "string" },
        },
        required: ["id", "password"],
      },
    },
    preHandler: APIGuard,
    handler: async function (req: any, res: any) {
      const { id, password } = req.body;
      let rs = await setPassword(id, password);
      return rs;
    },
  });
}
