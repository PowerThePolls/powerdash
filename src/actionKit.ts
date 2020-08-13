import { createConnection, Connection } from "typeorm";
import { Query, Sheet } from "./queries";

export interface Result {
  sheet: Sheet;
  data: string[][];
}

export const actionKit = async (queries: Query[]) => {
  const connection: Connection = await createConnection({
    type: "mysql",
    host: process.env.PTP_HOST,
    port: 3306,
    username: process.env.PTP_USER,
    password: process.env.PTP_PASS,
    database: process.env.PTP_DB,
  });

  const data: Result[] = await Promise.all(
    queries.map(async (query: Query) => ({
      data: await actionKitData(connection, query),
      sheet: query.sheet,
    }))
  );

  await connection.close();

  const totals = data.find(({ sheet }) => sheet === Sheet.Totals);
  const sources = data.find(({ sheet }) => sheet === Sheet.Sources);

  if (totals && sources) {
    totals.data.unshift([
      sources.data
        .reduce((total, [_, srcTotal]) => parseInt(srcTotal, 10) + total, 0)
        .toString(),
    ]);
    totals.data.push([new Date().toUTCString()]);
  }

  return data;
};

const actionKitData = async (connection: Connection, { sql, cols }: Query) =>
  (await connection.manager.query(sql)).map((row) =>
    cols.map((col) => row[col])
  );
