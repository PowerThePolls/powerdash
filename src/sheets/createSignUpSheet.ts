import { google } from "googleapis";
import { Sheet } from "../queries";

import getWorkSheets from "./getWorkSheets"

const sheets = google.sheets("v4");

const createSignUpSheet = async (auth, destinationSpreadsheetId: string) => {
  const templateSheet = process.env.TEMPALTE_PII

  const [{ sheetId: baseSheetId }] = await getWorkSheets(auth, templateSheet);

  if( !baseSheetId ) return null

  const { sheetId } = (
    await sheets.spreadsheets.sheets.copyTo({
      spreadsheetId: templateSheet,
      sheetId: baseSheetId,
      resource: { destinationSpreadsheetId },
      auth,
    })
  ).data;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: destinationSpreadsheetId,
    resource: {
      requests: [
        {
          updateSheetProperties: {
            properties: {
              sheetId,
              title: Sheet.Signups,
            },
            fields: "title",
          },
        },
      ],
    },
    auth,
  });

  return sheetId && { title: Sheet.Signups, sheetId };
};

export default createSignUpSheet;
