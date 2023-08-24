import UserEntity from "../../entities/user.entity";
import checkPassword from "../password/check-password";
import { RoleEntity } from "../../entities";
import { generateAdminToken } from "../user";
export default async function login(
  user_name: string,
  password: string
): Promise<any> {
  let userInfo: UserEntity = await UserEntity.findOne({
    where: { user_name: user_name },
  });

  if (!userInfo) {
    throw new Error("invalid_username_password");
  }
  if (userInfo.is_block) {
    throw new Error("user_is_blocked");
  }
  await checkPassword(userInfo.id, password);
  let token = await generateAdminToken(userInfo);
  let roleInfo = RoleEntity.getById(userInfo.role);
  console.log({roleInfo})

  userInfo.permissions = roleInfo.permissions;
  return { userInfo, token };
}
