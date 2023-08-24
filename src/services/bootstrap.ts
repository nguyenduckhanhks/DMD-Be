import { Environment } from "../config/environment";
import { RoleEntity } from "../entities";

export default async function bootstrap() {
  await RoleEntity.runRefresh();
  if (Environment.IS_WORKER) {
    return;
  }
}
