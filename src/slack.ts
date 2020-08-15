import fetch from "node-fetch";

export const notifySlack = async (text: string) =>
  await fetch(process.env.SLACK_HOOK, {
    method: "POST",
    body: JSON.stringify({ text }),
    headers: { "Content-Type": "application/json" },
  });
