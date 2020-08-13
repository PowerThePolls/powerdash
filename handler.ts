import { actionKit } from "./actionKit";
import { updateSheets, getRange } from "./googleSheets";
import { queriesForSources } from "./queries";

const isNotAuthorized = (event) =>
  event.headers?.SECRET_KEY !== process.env.SECRET_KEY;

const updatePartner = async (
  sources: string,
  sheetId: string
): Promise<void> => {
  const results = await actionKit(queriesForSources(sources));

  return await updateSheets(results, sheetId);
};

const handleUpdatePartner = async (event) => {
  if (isNotAuthorized(event)) return { statusCode: 500, body: "fail" };

  const { sources, sheetId } = JSON.parse(event.body);

  if (sources && sheetId) {
    await updatePartner(sources, sheetId);
  }

  return { statusCode: 200, body: "success" };
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

  return { statusCode: 200, body: "success" };
};

module.exports = {
  handleUpdatePartner,
  handleUpdatePartners,
};
