import { google } from "googleapis";

import googleAuth from "./googleAuth";

const sheets = google.sheets("v4");

const getRange = async (spreadsheetId: string, range: string) => {
  const auth = googleAuth();

  return (
    await sheets.spreadsheets.values.get({
      spreadsheetId,
      auth,
      range,
    })
  ).data?.values;
};

export default getRange;
