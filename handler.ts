import { actionKit } from "./actionKit";
import { updateSheets, getRange } from "./googleSheets";
import { queriesForSources } from "./queries";

const isNotAuthorized = (event) =>
  (event.headers || {})["Secret-Key"] !== process.env.SECRET_KEY;

const returnData = (statusCode: number, message: string) => ({
  statusCode,
  body: JSON.stringify({ message }),
});

const updatePartner = async (
  sources: string,
  sheetId: string
): Promise<void> => {
  const results = await actionKit(queriesForSources(sources));

  return await updateSheets(results, sheetId);
};

const handleUpdatePartner = async (event) => {
  if (isNotAuthorized(event)) return returnData(401, "fail");

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

  await Promise.all(
    sheets
      .filter(([sheetId, _, sources]) => sheetId && sources)
      .map(
        async ([sheetId, _, sources]) => await updatePartner(sources, sheetId)
      )
  );

  return returnData(200, "success");
};

module.exports = {
  handleUpdatePartner,
  handleUpdatePartners,
};
