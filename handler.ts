import { actionKit } from "./src/actionKit";
import { updateSheets, getRange } from "./src/sheets";
import { queriesForSources } from "./src/queries";
import { notifySlack, errorSlack } from "./src/slack";
import { getZip } from "./src/smartyStreet";
import { sendElectAdmin } from "./src/mailGun";
import { installLatest } from "./src/install";

const isNotAuthorized = (event) =>
  event.headers?.Authorization !== process.env.SECRET_KEY;

const returnData = (statusCode: number, message: string) => ({
  statusCode,
  body: JSON.stringify({ message }),
});

const updatePartner = async (
  sources: string,
  sheetId: string,
  includePii: boolean
): Promise<void> => {
  const results = await actionKit(queriesForSources(sources, includePii));

  try {
    await updateSheets(results, sheetId);

    console.log(`Pushed "${sources}" to ${sheetId}`);
  } catch (error) {
    const errored = error.errors ? error.errors : "Too large";

    console.error(error);

    errorSlack(
      `\`${sources}\` hit an exception updating <https://docs.google.com/spreadsheets/d/${sheetId}/edit|this sheet> \n\n\`\`\`\n${JSON.stringify(
        errored
      )}\n\`\`\``
    );

    throw error;
  }
};

const handleUpdatePartner = async (event) => {
  if (isNotAuthorized(event)) {
    return returnData(403, "fail");
  }

  const { sources, sheetId, includePii } = JSON.parse(event.body);

  if (sources && sheetId) {
    await updatePartner(sources, sheetId, includePii === "Yes");

    await notifySlack(
      `Updated \`${sources}\` <https://docs.google.com/spreadsheets/d/${sheetId}/edit|Partner Dashboard>`
    );
  }

  return returnData(200, "success");
};

const handleUpdatePartners = async (event) => {
  const sheets = (
    (await getRange(
      process.env.BASE_SHEET || "",
      "'Partner Data Pages'!A2:E"
    )) || []
  ).filter(
    ([_, sources, __, sheetId]) =>
      (sheetId || "").length > 0 && (sources || "").length > 0
  );

  const rate = 120;
  const interval = 360;
  const count = interval / rate;
  const today = new Date();
  const now = Math.floor(
    ((today.getMinutes() +
      60 * (today.getHours() % Math.floor(interval / 60))) /
      interval) *
      count
  );
  const batchSize = Math.ceil(sheets.length / count);
  const success = [];
  const errors = [];

  const batch = sheets.slice(
    Math.floor(batchSize * now),
    Math.floor(batchSize * (now + 1))
  );

  console.log(`Sending batch ${now}/${count} with size of ${batchSize}`);

  for (const item of batch) {
    const [_, sources, includePii, sheetId] = item;

    try {
      await updatePartner(sources, sheetId, includePii === "Yes");
      await new Promise((accept) => setTimeout(accept, 10_000));
      if (sources) success.push(sources);
    } catch (error) {
      console.error(error);
      await new Promise((accept) => setTimeout(accept, 100_000));
      if (sources) errors.push(sources);
    }
  }

  notifySlack(
    `Updated \`${success.join("`, `")}\`${
      errors.length > 0
        ? `\n\nFailed to updated \`${errors.join("`, `")}\``
        : ""
    }`
  );

  return returnData(200, "success");
};

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

const publishPackage = async (event) => {
  await installLatest();
};

module.exports = {
  handleUpdatePartner,
  handleUpdatePartners,
  handleGetZip,
  sendElectMail,
  publishPackage,
};
