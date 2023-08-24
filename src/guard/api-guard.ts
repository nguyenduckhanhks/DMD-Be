import _ from "lodash";
import { RoleEntity } from "../entities";
import UserEntity from "../entities/user.entity";
import parseAdminToken from "../services/customer/parse-admin-token";
import { admin } from "../services/user";
export default async function APIGuard(
  req: any,
  res: any,
  done: CallableFunction
) {
  const auth = req.headers.authorization;
  if (!auth) {
    throw new Error("permission_denied");
  }
  try {
    let token = auth.split(" ")[1];
    let { userInfo } = await parseAdminToken(token);
    req.user = <UserEntity>userInfo;
    let roleInfo = RoleEntity.getById(userInfo.role);
    let api = null;
    api = admin.getApiByName(req.url);
    if (_.intersection(roleInfo.permissions, api.permissions).length === 0) {
      throw new Error("permission_denied");
    }
  } catch (error) {
    throw new Error("permission_denied");
  }
}
