export enum Sheet {
  Cities = "Cities",
  Counties = "Counties",
  States = "States",
  Dates = "Dates",
  Sources = "Sources",
  Totals = "Totals",
  Signups = "Signups",
}

export interface Query {
  sql: string;
  cols: string[];
  sheet: Sheet;
}

export const queriesForSources = (
  rawSources: string,
  includePii = false
): Query[] => {
  const sources = `(${rawSources
    .split(",")
    .map((source) => `'${source.trim()}'`)
    .join(",")})`.toLowerCase();

  const COUNTIES_QUERY = `
    SELECT (
        SELECT
        GROUP_CONCAT(core_userfield.value separator ', ' )
        FROM core_userfield
        WHERE core_userfield.parent_id = core_user.id
          AND core_userfield.name = 'county'
      ) as "county",
      core_user.state as "state",
      count(distinct core_user.id) as "total"
    FROM core_user
    WHERE lower(source) in ${sources}
    GROUP BY county, state
    ORDER BY state
  `;
  const CITIES_QUERY = `
    SELECT (
        SELECT
        GROUP_CONCAT(core_userfield.value separator ', ' )
        FROM core_userfield
        WHERE core_userfield.parent_id = core_user.id
          AND core_userfield.name = 'county'
      ) as "county",
      core_user.city as "city",
      core_user.state as "state",
      count(distinct core_user.id) as "total"
    FROM core_user
    WHERE lower(source) in ${sources}
    GROUP BY city, county, state
    ORDER BY state
  `;
  const STATES_QUERY = `
    SELECT core_user.state as "state",
      count(distinct core_user.id) as "total"
    FROM core_user
    WHERE lower(source) in ${sources}
    GROUP BY state
    ORDER BY state
  `;

  const DATES_QUERY = `
    SELECT date_format(created_at, '%M %d, %Y') as "joined",
      count(distinct core_user.id) as "total"
    FROM core_user
    WHERE lower(source) in ${sources}
    GROUP BY joined
    ORDER BY created_at DESC
  `;

  const SOURCES_QUERY = `
    SELECT core_user.source as "source",
      count(distinct core_user.id) as "total"
    FROM core_user
    WHERE lower(source) in ${sources}
    GROUP BY source
    ORDER BY total DESC
  `;

  const TOTALS_QUERY = `
    SELECT count(distinct core_user.id) as "total"
    FROM core_user
  `;

  const queries = [
    {
      sql: CITIES_QUERY,
      cols: ["city", "county", "state", "total"],
      sheet: Sheet.Cities,
    },
    {
      sql: COUNTIES_QUERY,
      cols: ["county", "state", "total"],
      sheet: Sheet.Counties,
    },
    {
      sql: STATES_QUERY,
      cols: ["state", "total"],
      sheet: Sheet.States,
    },
    {
      sql: DATES_QUERY,
      cols: ["joined", "total"],
      sheet: Sheet.Dates,
    },
    {
      sql: SOURCES_QUERY,
      cols: ["source", "total"],
      sheet: Sheet.Sources,
    },
    {
      sql: TOTALS_QUERY,
      cols: ["total"],
      sheet: Sheet.Totals,
    },
  ];

  const SIGNUPS_QUERY = `
    SELECT
      core_user.created_at AS "date_joined",
      core_user.first_name as "first_name",
      core_user.last_name as "last_name",
      core_user.email AS "email",
      (
        SELECT
          coalesce(
            group_concat(
              phone ORDER BY core_phone.id DESC separator ', '
            ),
          ''
          )
        FROM core_phone
        WHERE core_phone.user_id = core_user.id
      ) AS "phone",
      core_user.city as "city",
      core_user.state as "state",
      if( core_user.zip,
          concat_ws( '-', core_user.zip,
          if( length( core_user.plus4 ), core_user.plus4, null ) ),
          core_user.postal
      ) as "zip",
      (
        SELECT
        GROUP_CONCAT(core_userfield.value separator ', ' )
        FROM core_userfield
        WHERE core_userfield.parent_id = core_user.id
          AND core_userfield.name = 'county'
      ) as "county",
      core_user.source AS "source",
      (
        SELECT
        GROUP_CONCAT(core_userfield.value separator ', ' )
        FROM core_userfield
        WHERE core_userfield.parent_id = core_user.id
          AND core_userfield.name = 'partner_field'
      ) as "partner_field"
    FROM core_user
    WHERE lower(SOURCE) IN ${sources}
    GROUP BY core_user.id
    ORDER BY Date_Joined ASC
  `;

  if (includePii)
    queries.push({
      sql: SIGNUPS_QUERY,
      sheet: Sheet.Signups,
      cols: [
        "date_joined",
        "first_name",
        "last_name",
        "email",
        "phone",
        "city",
        "state",
        "zip",
        "county",
        "source",
        "partner_field",
      ],
    });

  return queries;
};
