import { UserEntity } from "../../entities";
import { sequelize } from "../../database";
import PasswordEntity from "../../entities/password.entity";
import crypt from "../crypt";
interface Input {
  user_name: string;
  password: string;
  name: string;
  role: number;
}
export default async function createUser({
  user_name,
  password,
  name,
  role,
}: Input): Promise<UserEntity> {
  const hash = await crypt.hash(password);
  const createdUser: UserEntity = await sequelize.transaction(async (t) => {
    const userExists = await UserEntity.findOne({ where: { user_name } });
    if (userExists) {
      throw new Error("user_already_exists");
    }
    let createdUser: UserEntity = await UserEntity.create(
      {
        user_name,
        name,
        role,
      },
      { transaction: t }
    );
    await PasswordEntity.create(
      { user_id: createdUser.id, hash },
      { transaction: t }
    );
    return createdUser;
  });

  return createdUser;
}
