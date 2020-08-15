import { google } from "googleapis";
import { Sheet } from "../queries";

const sheets = google.sheets("v4");

const getWorkSheets = async (
  auth,
  spreadsheetId: string
): Promise<{ title: Sheet; sheetId: number }[]> => {
  const result = await sheets.spreadsheets.get({
    spreadsheetId,
    auth,
  });

  if (!result) return [];

  return (result?.data?.sheets || []).map(
    ({ properties: { title, sheetId } }) => ({
      title: Sheet[title],
      sheetId,
    })
  );
};

export default getWorkSheets;
