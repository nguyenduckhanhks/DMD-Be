import { RoleEntity } from "./entities";

export default async function bootstrap() {
  await RoleEntity.runRefresh();
}
