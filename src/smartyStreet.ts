import fetch from "node-fetch";

const smartyApiURL = 'https://us-zipcode.api.smartystreets.com/lookup'

const authId = process.env.SS_AUTH_ID
const authToken = process.env.SS_AUTH_TOKEN

export const getZip = async (zipcode: string) => {
   const url = new URL( smartyApiURL );

   url.searchParams.append("auth-id", authId);
   url.searchParams.append("auth-token", authToken);
   url.searchParams.append("zipcode", zipcode);

  const resp = await fetch(url);

  return resp.json()
}
