import * as mailgun from "mailgun-js";
import fetch from "node-fetch";

const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: "email.powerthepolls.org",
});

const getElectEmail = async (jurisdiction) => {
  console.log("jurisdiction: ", jurisdiction);
  const resp = await fetch(
    `https://workelections.powerthepolls.org/wp-json/wp/v2/jurisdiction/${jurisdiction}/`
  );
  const json = await resp.json();
  console.log(JSON.stringify(json));
  const email = json.acf.email;
  console.log("email: ", email);
  return email;
};

export const sendElectAdmin = async (jurisdiction, data) => {
  const to = await getElectEmail(jurisdiction);

  return await new Promise((resolve, reject) => {
    mg.messages().send(
      {
        to,
        from: "Power the Polls <no-reply@email.powerthepolls.org>",
        subject: "Serving as a Poll Worker",
        template: "election-admin-email",
        "h:X-Mailgun-Variables": JSON.stringify(data),
      },
      (error, body) => {
        // @ts-ignore
        error ? reject(error, body) : resolve(body);
      }
    );
  });
};
