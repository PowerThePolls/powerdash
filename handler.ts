import { actionKit } from "./src/actionKit";
import { updateSheets, getRange } from "./src/sheets";
import { queriesForSources } from "./src/queries";
import { notifySlack, errorSlack } from "./src/slack";
import { getZip } from "./src/smartyStreet";

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
    await notifySlack(
      `Updated \`${sources}\` <https://docs.google.com/spreadsheets/d/${sheetId}/edit|Partner Dashboard>`
    );

    console.log(`Pushed "${sources}" to ${sheetId}`);
  } catch (error) {
    const errored = error.errors ? error.errors : error;

    errorSlack(
      `\`${sources}\` hit an exception \`\`\`\n${JSON.stringify(
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
  }

  return returnData(200, "success");
};

const handleUpdatePartners = async (event) => {
  const sheets =
    (await getRange(
      process.env.BASE_SHEET || "",
      "'Partner Data Pages'!A2:E"
    )) || [].filter(([_, sources, __, sheetId]) => sheetId && sources);

  const rate = 5;
  const interval = 60 / rate;
  const now = Math.floor(new Date().getMinutes() / interval);

  try {
    await Promise.all(
      sheets
        .slice(
          Math.floor((sheets.length / rate) * now),
          Math.floor((sheets.length / rate) * (now + 1))
        )
        .map(async ([_, sources, includePii, sheetId]) => {
          await updatePartner(sources, sheetId, includePii === "Yes");
        })
    );
  } catch (error) {
    console.error(error);
  }

  console.log(
    `Updated ${sheets
      .filter(([sheetId, _, sources]) => sheetId && sources)
      .map(([_, partner]) => partner)
      .join(", ")}`
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
    },
    body,
    statusCode,
  };
};

module.exports = {
  handleUpdatePartner,
  handleUpdatePartners,
  handleGetZip,
};
