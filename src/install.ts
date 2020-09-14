import * as fs from "fs";
import * as path from "path";
import * as AWS from "aws-sdk";
import { parse } from "node-html-parser";
import fetch from "node-fetch";

AWS.config.update({ region: "us-east-1" });

const s3 = new AWS.S3();
const cloudfront = new AWS.CloudFront();

const FOLDER_LOC = "@ptp-us/power-the-polls-form@latest/power-the-polls-form/";
const PACKAGE_PATH = `https://unpkg.com/browse/${FOLDER_LOC}`;
const RAW_PATH = `https://unpkg.com/${FOLDER_LOC}`;

const BUCKET = "src.powerthepolls.org";
const BUCKET_FOLDER = "assets/scripts/power-the-polls-form";

const DISTRIBUTION_ID = "EPB6EAXTIDCWA";

const uploadFile = (fileName, blob) =>
  new Promise((resolve, reject) => {
    s3.upload(
      {
        Bucket: BUCKET,
        Key: `${BUCKET_FOLDER}/${fileName}`,
        Body: blob,
        ACL: "public-read",
        ContentType: "application/javascript",
      },
      (err, data) => (err ? reject(err) : resolve(data))
    );
  });

const createInvalidation = async (files) =>
  new Promise((resolve, reject) => {
    cloudfront.createInvalidation(
      {
        DistributionId: DISTRIBUTION_ID,
        InvalidationBatch: {
          CallerReference: new Date().toISOString(),
          Paths: {
            Quantity: files.length,
            Items: files.map((fileName) => `/${BUCKET_FOLDER}/${fileName}`),
          },
        },
      },
      (err, data) => (err ? reject(err) : resolve(data))
    );
  });

export const installLatest = async () => {
  const resp = await fetch(PACKAGE_PATH);
  const files = parse(await resp.text())
    .querySelectorAll("table a")
    .map((el) => el.text)
    .filter((file) => file.includes(".js"));

  for (const file of files) {
    const response = await fetch(`${RAW_PATH}${file}`);
    await uploadFile(file, await response.text());
    await new Promise((accept) => setTimeout(accept, 10_000));
  }

  await createInvalidation(files);
};
