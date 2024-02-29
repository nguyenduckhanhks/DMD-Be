import cache from '../utils/cache';
import customEncrypt from '../utils/custom-encrypt';

export default async function onSend(req: any, res: any, payload: any) {
  if (req.cacheKey && !req.isCached) {
    cache.set(req.cacheKey, payload);
  }
  if (req.customEncrypt) {
    let encrypt = customEncrypt.encrypt(
      payload,
      process.env.REQUEST_ENCRYPT_KEY
    );
    payload = encrypt;
  }
  return payload;
}
