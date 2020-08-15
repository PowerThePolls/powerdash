import { google } from "googleapis";

const googleAuth = () =>
  new google.auth.GoogleAuth({
    keyFile: "./service.json",
    scopes: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  });

export default googleAuth;
