import * as mailgun from "mailgun-js";
import fetch from "node-fetch";

const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: "powerthepolls.org",
});

const getElectEmail = async (jurisdiction) => {
  const resp = await fetch(
    `https://workelections.powerthepolls.org/jurisdictions/${jurisdiction}/`
  );
  const { email } = await resp.json();

  return email;
};

export const sendElectAdmin = async (jurisdiction, data) => {
  const to = await getElectEmail(jurisdiction);

  return await new Promise((resolve, reject) => {
    mg.messages().send(
      {
        from: "Power the Polls <no-reply@powerthepolls.org>",
        subject: "Serving as a Poll Worker",
        template: "election-admin-email",
        "h:X-Mailgun-Variables": JSON.stringify(data),
        to,
      },
      (error, body) => {
        error ? reject(error, body) : resolve(body);
      }
    );
  });
};
