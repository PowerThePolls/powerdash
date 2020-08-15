import fetch from "node-fetch";

export const notifySlack = async (text: string) =>
  await fetch(
    "https://hooks.slack.com/services/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",
    {
      method: "POST",
      body: JSON.stringify({ text }),
      headers: { "Content-Type": "application/json" },
    }
  );
