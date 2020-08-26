import { google } from "googleapis";
import { Result } from "../actionKit";
import { Sheet } from "../queries";

import createSignUpSheet from "./createSignUpSheet";
import getWorkSheets from "./getWorkSheets";
import googleAuth from "./googleAuth";

const sheets = google.sheets("v4");

const updateSheets = async (
  results: Result[],
  spreadsheetId: string
): Promise<void> => {
  const auth = googleAuth();

  const worksheets = await getWorkSheets(auth, spreadsheetId);


  if (
    results.find(({ sheet }) => sheet === Sheet.Signups) &&
    !worksheets.find(({ title }) => title === Sheet.Signups)
  ) {
    const signupSheet = await createSignUpSheet(auth, spreadsheetId);
    if (signupSheet) {
      worksheets.push(signupSheet);
    }
  }

  const requests = results.map((result: Result) =>
    updateRequest(worksheets, result)
  );

  await sheets.spreadsheets.batchUpdate({
    resource: { requests },
    auth,
    spreadsheetId,
  });
};

const updateRequest = (
  worksheets: { title: Sheet; sheetId: number }[],
  { data, sheet }: Result
) => {
  const { sheetId } = worksheets.find(({ title }) => title === sheet) || {};

  const { rowIndex, columnIndex } =
    sheet === Sheet.Totals
      ? { rowIndex: 0, columnIndex: 1 }
      : { rowIndex: 1, columnIndex: 0 };

  return {
    updateCells: {
      rows: data.map((row) => ({
        values: row.map((col) => ({
          userEnteredValue: (col || "-").toString().match(/[^0-9\.]/)
            ? { stringValue: col }
            : { numberValue: parseFloat(col) },
        })),
      })),
      fields: "*",
      start: {
        sheetId,
        rowIndex,
        columnIndex,
      },
    },
  };
};

export default updateSheets;
