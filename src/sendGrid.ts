import * as sgMail from "@sendgrid/mail";
import fetch from "node-fetch";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const getElectEmail = async (jurisdiction) => {
  const resp = await fetch(
    `https://workelections.powerthepolls.org/jurisdictions/${jurisdiction}/`
  );
  const { email } = await resp.json();

  return email;
};

export const sendElectAdmin = async (jurisdiction, dynamicTemplateData) => {
  const to = await getElectEmail(jurisdiction);
  const from = "no-reply@powerthepolls.org";

  sgMail.send({
    to,
    from,
    dynamicTemplateData,
    templateId: "d-9abfd8149a6f4b0e9921c10b756b25b8",
  });
};
