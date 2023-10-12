import { format } from "util";
import { Storage } from "@google-cloud/storage";

const storage = new Storage({ keyFilename: "cloud-storage.json" });
const bucketName = process.env.GCP_BUCKET;
const bucket = storage.bucket(bucketName);

const getBucketUrl = (fileName: string) => {
  return `https://storage.cloud.google.com/${bucketName}/${fileName}`;
};

const extractBucketUrl = (link: string) => {
  return link.replace(`https://storage.cloud.google.com/${bucketName}/`, "");
};

const getSignedUrl = async (fileName: string) => {
  try {
    const [signedUrl] = await storage
      .bucket(bucketName)
      .file(fileName)
      .getSignedUrl({
        action: "read",
        expires: Date.now() + 15 * 60 * 1000,
      });
    return signedUrl;
  } catch (error) {
    console.error("Error fetching the signed URL:", error);
  }
};

const uploadBase64Image = async (inputImage: string, fileName: string): Promise<string> => {
  const base64Img = inputImage.split(";base64,").pop();

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
        const publicUrl = format(`${getBucketUrl(fileName)}`);

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

const getSignedUrlFromPdf = async (pdf: string) => {
  if (pdf.includes("https")) {
    pdf = await gcp.getSignedUrl(gcp.extractBucketUrl(pdf));
  }
  return pdf;
};

async function getImageDataAndConvertToBase64(pdf: string) {
  let fileName = extractBucketUrl(pdf);
  try {
    // Get the image file from the Google Cloud Storage bucket.
    const [file] = await storage.bucket(bucketName).file(fileName).download();

    // Convert the image data to base64 format.
    const base64String = Buffer.from(file).toString("base64");
    return `data:image/jpeg;base64,${base64String}`;
  } catch (error) {
    console.error("Error fetching or converting image:", error);
  }
}

const gcp = {
  uploadBase64Image,
  getSignedUrl,
  extractBucketUrl,
  getBucketUrl,
  getSignedUrlFromPdf,
  getImageDataAndConvertToBase64
};

export default gcp;
