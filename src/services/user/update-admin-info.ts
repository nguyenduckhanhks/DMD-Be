import { ApiConfig } from "../../config";
import { UserEntity } from "../../entities";
import redis from "../redis";

export default async function updateAdminInfo(userInfo: UserEntity) {
  let key = `admin_token_${userInfo.id}`;
  if (userInfo) {
    await redis.hmset(key, {
      user_info: JSON.stringify(userInfo),
    });
    await redis.expire(key, ApiConfig.JWT_EXPIRE);
  }
}
