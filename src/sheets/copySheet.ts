import { google } from "googleapis";

const sheets = google.sheets("v4");

const copySheet = async (
  auth,
  templateSheetId: string,
  templateWorkSheetId: number,
  destinationSpreadsheetId: string
) => {
  const { sheetId, title } = (
    await sheets.spreadsheets.sheets.copyTo({
      spreadsheetId: templateSheetId,
      sheetId: templateWorkSheetId,
      resource: { destinationSpreadsheetId },
      auth,
    })
  ).data;

  const newTitle = title.replace("Copy of ", "");

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: destinationSpreadsheetId,
    resource: {
      requests: [
        {
          updateSheetProperties: {
            properties: {
              sheetId,
              title: newTitle,
            },
            fields: "title",
          },
        },
      ],
    },
    auth,
  });

  return { title: newTitle, sheetId };
};

export default copySheet;
