import { PasswordEntity } from "../../entities";
import crypt from "../crypt";

export default async function setPassword(id: number, password: string) {
  let hash = await crypt.hash(password);
  let passwordInfo = await PasswordEntity.findOne({ where: { user_id: id } });
  if (!passwordInfo) {
    throw new Error("password_not_found");
  }
  passwordInfo.hash = hash;
  passwordInfo.save();
  return passwordInfo;
}
