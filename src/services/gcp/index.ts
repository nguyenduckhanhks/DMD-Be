import { format } from "util";
import { Storage } from "@google-cloud/storage";

const storage = new Storage({ keyFilename: "cloud-storage.json" });
const bucketName = "dmd-order";
const bucket = storage.bucket(bucketName);

const uploadBase64Image = async (inputImage: string, fileName: string): Promise<string> => {
  const base64Img = inputImage.split(';base64,').pop();

  return new Promise((res, rej) => {
    try {
      const blob = bucket.file(fileName);
      const blobStream = blob.createWriteStream({
        resumable: false,
      });

      blobStream.on("error", (err) => {
        rej(err);
      });

      blobStream.on("finish", async () => {
        const publicUrl = format(`https://storage.cloud.google.com/${bucketName}/${fileName}`);

        try {
          await blob.makePublic();
        } catch (error) {
          rej(error);
        }

        return res(publicUrl);
      });

      blobStream.end(Buffer.from(base64Img, "base64"));
    } catch (err) {
      rej(err);
    }
  });
};

const gcp = {
  uploadBase64Image,
};

export default gcp;
