import { getZip } from "./src/smartyStreet";
import { sendElectAdmin } from "./src/mailGun";

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

const sendElectMail = async (event) => {
  const { jurisdictionId, ...data } = JSON.parse(event.body);
  let statusCode = 200;
  let message = "Message sent";

  try {
    await sendElectAdmin(jurisdictionId, data);
  } catch (e) {
    console.error(e);
    message = "Could not send";
    statusCode = 422;
  }

  return {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify({ message }),
    statusCode,
  };
};

module.exports = {
  handleGetZip,
  sendElectMail,
};
