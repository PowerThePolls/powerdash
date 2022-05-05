import { getZip } from "./src/smartyStreet";
import { installLatest } from "./src/install";

const handleGetZip = async (event) => {
  const { zipcode } = event.queryStringParameters;
  const { body, statusCode } = await getZip(zipcode);

  return {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Cache-Control": "max-age=1314000, s-maxage=1314000, immutable, public",
    },
    body,
    statusCode,
  };
};

const publishPackage = async (event) => {
  await installLatest();
};

module.exports = {
  handleGetZip,
  publishPackage,
};
