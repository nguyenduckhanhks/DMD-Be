import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config/api-config";
import { v4 as uuidv4 } from "uuid";
// @ts-ignore
import randomstring from "randomstring";

function uid(): string {
  return uuidv4();
}

async function hash(text: string): Promise<string> {
  return await new Promise((resolve, reject) => {
    bcrypt.hash(text, 10, (err, hash) => {
      resolve(hash);
    });
  });
}
async function compare(text: string, hash: string): Promise<void> {
  return await new Promise((resolve, reject) => {
    bcrypt.compare(text, hash, (err, result) => {
      result ? resolve() : reject(new Error("invalid_password"));
    });
  });
}

async function signJwt(
  data: any,
  expiresIn: number,
  key: string = config.JWT_SECRET
): Promise<string | undefined> {
  return await new Promise((resolve, reject) => {
    jwt.sign(
      data,
      key,
      { algorithm: "HS256", expiresIn },
      (err: Error | null, token: string | undefined) => {
        resolve(token);
      }
    );
  });
}
async function verifyJwt(
  token: string,
  key: string = config.JWT_SECRET
): Promise<any> {
  return await new Promise((resolve, reject) => {
    jwt.verify(token, key, function (err: any, decoded: any) {
      if (err) {
        return reject(err);
      }
      resolve(decoded);
    });
  });
}
function parseJSON(data: any, fields: string[]) {
  let tmp: any = {};
  fields.forEach((field: string, index: number) => {
    let key = "";
    if (index < 26) {
      key = String.fromCharCode(65 + index);
    } else {
      key = `${String.fromCharCode(
        65 + Math.floor(index / 26) - 1
      )}${String.fromCharCode(65 + (index % 26))}`;
    }
    if (!data[key]) return;
    tmp[fields[index]] = data[key];
  });
  return tmp;
}
function returnJSON(data: any, fields: string[]) {
  let tmp: any = {};
  fields.forEach((field: string, index: number) => {
    if (!data[field]) return;
    let key = "";
    if (index < 26) {
      key = String.fromCharCode(65 + index);
    } else {
      key = `${String.fromCharCode(
        65 + Math.floor(index / 26) - 1
      )}${String.fromCharCode(65 + (index % 26))}`;
    }
    tmp[key] = data[field];
  });
  return tmp;
}
function randomString(size: number) {
  return randomstring.generate({
    length: size,
    charset: "alphabetic",
  });
}
function generateToken() {
  return randomString(64);
}
const crypt = {
  generateToken,
  signJwt,
  verifyJwt,
  compare,
  hash,
  uid,
  parseJSON,
  returnJSON,
};
export default crypt;
