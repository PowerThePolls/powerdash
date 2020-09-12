import * as fs from "fs";
import * as path from "path";
import * as pacote from 'pacote';
import * as AWS from "aws-sdk";

AWS.config.update({
  region: 'us-east-1',
  accessKeyId: process.env.SRC_AWS_ACCESS_KEY,
  secretAccessKey: process.env.SRC_AWS_SECRET_KEY,
});

const s3 = new AWS.S3();
const cloudfront = cloudfront = new AWS.CloudFront();

const PACKAGE = '@ptp-us/power-the-polls-form@latest'
const INSTALL_PATH = path.join("./ptp-form")
const FILES_PATH = path.join(INSTALL_PATH, "power-the-polls-form")

const BUCKET = "src.powerthepolls.org"
const BUCKET_FOLDER = "assets/scripts/power-the-polls-form"

const DISTRIBUTION_ID = 'EPB6EAXTIDCWA'

const uploadFile = (fileName) => (
  new Promise((resolve, reject) => {
    s3.upload({
      Bucket: BUCKET,
      Key: `${BUCKET_FOLDER}/${fileName}`,
      Body: fs.readFileSync(path.join(FILES_PATH, fileName), 'UTF-8'),
      ACL: 'public-read',
      ContentType: 'application/javascript'
    }, (err, data) => (err ? reject(err) : resolve(data)))
  })
)

const createInvalidation = async (files) => (
  new Promise((resolve, reject) => {
    cloudfront.createInvalidation({
      DistributionId: DISTRIBUTION_ID,
      InvalidationBatch: {
        CallerReference: (new Date()).toISOString(),
        Paths: {
          Quantity: files.length,
          Items: files.map(fileName => `/${BUCKET_FOLDER}/${fileName}`)
        }
      }
    }, (err, data) => (err ? reject(err) : resolve(data)))
  })
)

export const installLatest = async () => {
  await pacote.extract(PACKAGE, INSTALL_PATH, {})

  fs.readdir(FILES_PATH, async (err, files) => {
    console.log(await Promise.all(files.map(file => uploadFile(file))))
    console.log(await createInvalidation(files))
  });
}
