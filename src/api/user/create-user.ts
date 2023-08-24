"use strict";
import * as fastify from "fastify";
import { createUser } from "../../services/user";
import APIGuard from "../../guard/api-guard";
export default async function (app: fastify.FastifyInstance) {
  app.route({
    method: "POST",
    url: "/create-user",
    schema: {
      body: {
        type: "object",
        properties: {
          user_name: { type: "string" },
          name: { type: "string" },
          password: { type: "string" },
          role: { type: "number" },
        },
        required: ["user_name", "name", "role", "password"],
      },
    },
    preHandler: APIGuard,
    handler: async function (req: any, res: any) {
      const { user_name, name, role, password } = req.body;
      let rs = await createUser({ user_name, password, name, role });
      return rs;
    },
  });
}
