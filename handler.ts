import { actionKit } from "./src/actionKit";
import { updateSheets, getRange } from "./src/sheets";
import { queriesForSources } from "./src/queries";

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

  await updateSheets(results, sheetId);

  console.log(`Pushed "${sources}" to ${sheetId}`);
};

const handleUpdatePartner = async (event) => {
  if (isNotAuthorized(event)) {
    return returnData(403, "fail");
  }

  const { sources, sheetId, includePii } = JSON.parse(event.body);

  if (sources && sheetId) {
    await updatePartner(sources, sheetId, includePii === 'Yes');
  }

  return returnData(200, "success");
};

const handleUpdatePartners = async (event) => {
  const sheets =
    (await getRange(
      process.env.BASE_SHEET || "",
      "'Partner Data Pages'!A2:E"
    )) || [].filter(([_, sources, __, sheetId]) => sheetId && sources);

  const interval = 10
  const batchDivis = 60 / interval
  const now = Math.floor(new Date().getMinutes() / interval)

  try {
    await Promise.all(
      sheets
        .slice(
          Math.floor(sheets.length/batchDivis * now),
          Math.floor(sheets.length/batchDivis * (now + 1)),
         )
        .map(
          async ([_, sources, includePii, sheetId]) =>
            {
              await updatePartner(sources, sheetId, includePii === "Yes")
            }
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
