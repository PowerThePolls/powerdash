// @ts-nocheck

import { google } from "googleapis";
import { Result } from "./actionKit";
import { Sheet } from "./queries";

const sheets = google.sheets("v4");

export const updateSheets = async (
  results: Result[],
  spreadsheetId: string
): Promise<void> => {
  const auth = googleAuth();

  const worksheets = await getWorkSheets(auth, spreadsheetId);

  const requests = results.map((result: Result) =>
    updateRequest(worksheets, result)
  );

  await sheets.spreadsheets.batchUpdate({
    resource: { requests },
    auth,
    spreadsheetId,
  });
};

export const getRange = async (spreadsheetId: string, range: sting) => {
  const auth = googleAuth();

  return (
    await sheets.spreadsheets.values.get({
      spreadsheetId,
      auth,
      range,
    })
  ).data?.values;
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
          userEnteredValue: isNaN(parseInt(col, 10))
            ? { stringValue: col }
            : { numberValue: parseInt(col, 10) },
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

const googleAuth = () =>
  new google.auth.GoogleAuth({
    keyFile: "./service.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

const getWorkSheets = async (
  auth,
  spreadsheetId: string
): Promise<{ title: Sheet; sheetId: number }[]> => {
  const result = await sheets.spreadsheets.get({
    spreadsheetId,
    auth,
  });

  if (!result) return [];

  return (result?.data?.sheets || [])
    .filter(({ properties: { title, sheetId } }) => title && sheetId)
    .map(({ properties: { title, sheetId } }) => ({
      title: Sheet[title],
      sheetId,
    }));
};
