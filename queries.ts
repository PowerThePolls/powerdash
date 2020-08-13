export enum Sheet {
  Cities = "Cities",
  Counties = "Counties",
  States = "States",
  Dates = "Dates",
  Sources = "Sources",
  Totals = "Totals",
}

export interface Query {
  sql: string;
  cols: string[];
  sheet: Sheet;
}

export const queriesForSources = (rawSources: string): Query[] => {
  const sources = `(${rawSources
    .split(",")
    .map((source) => `'${source.trim()}'`)
    .join(",")})`;

  const COUNTIES_QUERY = `
    SELECT (
        SELECT GROUP_CONCAT( core_actionfield.value separator ', ' )
        FROM core_actionfield
        JOIN core_action on ( core_actionfield.parent_id = core_action.id )
        WHERE core_action.user_id = core_user.id AND
              core_action.page_id in ( 12 ) AND
              core_actionfield.name = 'county'
      ) as "county",
      core_user.state as "state",
      count(distinct core_user.id) as "total"
    FROM core_user
    WHERE source in ${sources}
    GROUP BY county, state
    ORDER BY state
  `;
  const CITIES_QUERY = `
    SELECT (
        SELECT GROUP_CONCAT( core_actionfield.value separator ', ' )
        FROM core_actionfield
        JOIN core_action on ( core_actionfield.parent_id = core_action.id )
        WHERE core_action.user_id = core_user.id AND
              core_action.page_id in ( 12 ) AND
              core_actionfield.name = 'county'
      ) as "county",
      core_user.city as "city",
      core_user.state as "state",
      count(distinct core_user.id) as "total"
    FROM core_user
    WHERE source in ${sources}
    GROUP BY city, county, state
    ORDER BY state
  `;
  const STATES_QUERY = `
    SELECT core_user.state as "state",
      count(distinct core_user.id) as "total"
    FROM core_user
    WHERE source in ${sources}
    GROUP BY state
    ORDER BY state
  `;

  const DATES_QUERY = `
    SELECT date_format(created_at, '%M %d, %Y') as "joined",
      count(distinct core_user.id) as "total"
    FROM core_user
    WHERE source in ${sources}
    GROUP BY joined
    ORDER BY created_at DESC
  `;

  const SOURCES_QUERY = `
    SELECT core_user.source as "source",
      count(distinct core_user.id) as "total"
    FROM core_user
    WHERE source in ${sources}
    GROUP BY source
    ORDER BY total DESC
  `;

  const TOTALS_QUERY = `
    SELECT count(distinct core_user.id) as "total"
    FROM core_user
  `;

  return [
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
};
