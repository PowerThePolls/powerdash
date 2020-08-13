import { actionKit } from "./src/actionKit";
import { updateSheets, getRange } from "./src/googleSheets";
import { queriesForSources } from "./src/queries";

const isNotAuthorized = (event) =>
  event.headers?.Authorization !== process.env.SECRET_KEY;

const returnData = (statusCode: number, message: string) => ({
  statusCode,
  body: JSON.stringify({ message }),
});

const updatePartner = async (
  sources: string,
  sheetId: string
): Promise<void> => {
  const results = await actionKit(queriesForSources(sources));

  await updateSheets(results, sheetId);

  console.log(`Pushed "${sources}" to ${sheetId}`);
};

const handleUpdatePartner = async (event) => {
  if (isNotAuthorized(event)) {
    return returnData(403, "fail");
  }

  const { sources, sheetId } = JSON.parse(event.body);

  if (sources && sheetId) {
    await updatePartner(sources, sheetId);
  }

  return returnData(200, "success");
};

const handleUpdatePartners = async (event) => {
  const sheets =
    (await getRange(
      process.env.BASE_SHEET || "",
      "'Partner Data Pages'!A2:E"
    )) || [];

  try {
    await Promise.all(
      sheets
        .filter(([sheetId, _, sources]) => sheetId && sources)
        .map(
          async ([sheetId, _, sources]) => await updatePartner(sources, sheetId)
        )
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

module.exports = {
  handleUpdatePartner,
  handleUpdatePartners,
};
