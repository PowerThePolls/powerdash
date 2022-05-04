import { Sheet } from "../queries";

import getWorkSheets from "./getWorkSheets";
import copySheet from "./copySheet";

const createSignUpSheet = async (auth, destinationSpreadsheetId: string) => {
  const templateSheet = process.env.TEMPLATE_PII || "";

  const [{ sheetId: baseSheetId }] = await getWorkSheets(auth, templateSheet);

  if (!baseSheetId) return null;

  const { title, sheetId } = await copySheet(
    auth,
    templateSheet,
    baseSheetId,
    destinationSpreadsheetId
  );

  return { title: Sheet[title], sheetId };
};

export default createSignUpSheet;
