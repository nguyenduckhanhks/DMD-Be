import { Transaction } from "sequelize";
import { sequelize } from "../../database";
import { UserEntity } from "../../entities";
import redis from "../redis";

export default async function blockUser(id: number) {
  let userInfo = await UserEntity.findByPk(id);
  userInfo.is_block = true;
  userInfo = await sequelize.transaction(async (t: Transaction) => {
    await userInfo.save({ transaction: t });
    await redis.del(`admin_token_${id}`);
    return userInfo;
  });
  return userInfo;
}
