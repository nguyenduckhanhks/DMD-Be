"use strict";
import * as fastify from "fastify";
import UserGuard from "../../guard/user-guard";
import UserEntity from "../../entities/user.entity";
//admin
import { HistoryInsertOrderEntity, Order17TrackEntity, OrderEntity, PasswordEntity, RoleEntity } from "../../entities";
//admin
import { Op } from "sequelize";
import _ from "lodash";
import ExcelJS from "exceljs";

// import { ServiceMap } from '../../services';
import Config from "../../config/api-config";
import dayjs from "dayjs";
import { admin } from "../../services/user";
import gcp from "../../services/gcp";
const modelMap: { [key: string]: any } = {
  password: PasswordEntity,
  user: UserEntity,
  role: RoleEntity,
  order: OrderEntity,
  "history-insert-order": HistoryInsertOrderEntity,
  "17track-order": Order17TrackEntity,
};
export default async function (app: fastify.FastifyInstance) {
  app.route({
    method: "POST",
    url: "/api/:name",
    preHandler: UserGuard,
    handler: async function (req: any, reply: any) {
      const body: any = req.body;
      const { name } = <{ [key: string]: string }>req.params;
      const apiInfo = admin.getApiByName(name);
      let roleInfo = RoleEntity.getById(req.user.role);
      if (apiInfo.permissions && apiInfo.permissions.length && !_.intersection(roleInfo.permissions, apiInfo.permissions).length) {
        throw new Error("invalid_permission");
      }
      const model = modelMap[apiInfo.model];
      if (!model) {
        throw new Error("model_not_found");
      }
      if (apiInfo.request_fields) {
        for (var i in body) {
          if (!apiInfo.request_fields.includes(i) && i !== "version" && i !== "id") {
            delete body[i];
          }
        }
      }
      switch (apiInfo.action) {
        case "create":
          if (!body) {
            throw new Error("invalid_create_data");
          }
          let createQuery: any = apiInfo.query;
          let input: any = Object.assign(body, apiInfo.query || {});
          delete input.id;
          delete input.version;
          for (var i in input) {
            input[i] = convertValue(input[i], req.user);
          }
          //@ts-ignore
          const created = await model.create(input);
          return created;
        case "delete":
          if (!body.id) {
            throw new Error("id_not_found");
          }
          let deleteQuery: any = convertWhere({ id: body.id }, apiInfo?.query?.where || {}, req.user);
          //@ts-ignore
          const deletedDocument = await model.destroy({ where: deleteQuery });
          if (!deletedDocument) {
            throw new Error("no_data_deleted");
          }
          return { msg: "ok" };
        case "update":
          if (!(body.id && body.version !== undefined)) {
            throw new Error("id_or_version_not_found");
          }

          let updateQuery: any = convertWhere({ id: body.id, version: body.version }, apiInfo?.query?.where || [], req.user);
          for (var i in updateQuery) {
            updateQuery[i] = convertValue(updateQuery[i], req.user);
          }
          let updateData = Object.assign(body, apiInfo?.query?.payload || {});
          delete updateData.id;
          delete updateData.version;
          for (var i in updateData) {
            updateData[i] = convertValue(updateData[i], req.user);
          }
          //@ts-ignore
          let updatedDocument = await model.findOne({ where: updateQuery });
          if (!updatedDocument) {
            throw new Error("no_data_updated");
          }
          Object.assign(updatedDocument, updateData);
          //@ts-ignore
          await updatedDocument.save();
          return updatedDocument;
        case "find":
          let query: any = apiInfo.query || {};
          query.where = convertWhere(body.where || {}, apiInfo?.query?.where || {}, req.user);
          query.offset = body.offset || 0;
          query.limit = body.export ? Config.MAX_LIMIT : Math.min(body.limit || Config.MAX_LIMIT, Config.MAX_LIMIT);
          query.order = body.order || [["id", "desc"]];
          query.export = body.export ?? false;
          if (query.include && query.include.length) {
            query.include.forEach((i: any) => {
              i.model = modelMap[i.model];
              if (i.include) {
                i.include.forEach((sub: any) => {
                  sub.model = modelMap[sub.model];
                });
              }
            });
          }
          //@ts-ignore
          let rs = await model.findAndCountAll(query);
          let data = rs.rows.map((i: any) => i.dataValues);
          if (["get-orders"].includes(name) && data.length === 1) {
            data = await Promise.all(
              data.map(async (d: OrderEntity) => {
                if (d.is_upload_cloud) {
                  d.pdf = await gcp.getImageDataAndConvertToBase64(d.pdf);
                }
                return d;
              })
            );
          }

          if (query.export) {
            const now = dayjs().format("DD_MM_YYYY");
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Sheet1");

            const headers = Object.keys(data[0]).map((key) => key);

            worksheet.columns = headers.map((header) => {
              return {
                header: header,
                key: header,
                width: 15,
              };
            });

            worksheet.addRows(data);

            reply.raw.writeHead(200, {
              "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            reply.raw.writeHead(200, {
              "Content-Disposition": `attachment; filename=${now}.xlsx`,
            });
            reply.raw.writeHead(200, { "access-control-allow-origin": "*" });
            await workbook.xlsx.write(reply.raw);
            reply.sent = true;
          }
          return { count: rs.count, data };
      }
    },
  });
}
function convertValue(val: number | string, user: UserEntity) {
  if (!val) return val;
  if (typeof val === "number") {
    return val;
  }
  if (val[0] === "$") {
    const key: string = val.substr(1, val.length - 1);
    //@ts-ignore
    return user[key];
  }
  return val;
}
function convertKey(k: string) {
  if (k && k[0] === "$") {
    //==>operator
    const key = k.substr(1, k.length - 1);
    //@ts-ignore
    return Op[key];
  }
  return k;
}
function convertWhere(inputWhere: any, baseWhere: any, userInfo: UserEntity): any {
  let where: any = { ...baseWhere };
  if (!where["$and"]) {
    where["$and"] = [];
  }
  for (var i in inputWhere) {
    where["$and"].push({ [i]: inputWhere[i] });
  }
  convertWhereObject(where, baseWhere, userInfo);
  return where;
}
function convertWhereObject(where: any, baseWhere: any, userInfo: UserEntity): any {
  if (typeof where == "string") return;
  for (var i in where) {
    let key = convertKey(i);
    let val = where[i];
    delete where[i];
    if (typeof val === "object") {
      if (Array.isArray(val)) {
        val.forEach((w) => {
          convertWhereObject(w, baseWhere, userInfo);
        });
        Object.assign(where, { [key]: val });
      } else {
        convertWhereObject(val, baseWhere, userInfo);
        Object.assign(where, { [key]: val });
      }
    } else {
      val = convertValue(val, userInfo);
      Object.assign(where, { [key]: val });
    }
  }
}
