"use strict";
import * as fastify from "fastify";
import UserGuard from "../../guard/user-guard";
import { UserEntity, RoleEntity } from "../../entities";
import { admin } from "../../services/user";

export default async function (app: fastify.FastifyInstance) {
  app.route({
    method: "POST",
    url: "/get-meta",
    preHandler: UserGuard,
    handler: async function (request: any, reply: any) {
      let menuInfos = admin.getAllMenus();
      let formInfos = admin.getAllForms();
      let gridInfos = admin.getAllGrids();
      let enumInfos = admin.getAllEnums();
      let userInfo = await UserEntity.findByPk(request.user.id);
      let roleInfo = RoleEntity.getById(userInfo.role);
      userInfo.permissions = roleInfo.permissions;
      return {
        code: "ok",
        userInfo,
        menuInfos,
        gridInfos,
        formInfos,
        enumInfos,
      };
    },
  });
}
