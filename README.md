# Power Dash

Scripts deployed to lambda via serverless to sync partner data with google sheets - consists of two handlers

## partnerUpdate

Command to update a given spreadsheet with data from a given list of sources.

```
curl -X POST \
    -H 'Authorization: secret-key' \
    -H 'Content-Type: application/json' \
    -d "{\"sources\":\"source1, source2\",\"sheetId\":\"some-sheet\"}" \
    https://aws-url.com/dev/sheet
```

## partnerUpdates

Checks `BASE_SHEET` for a list of sheets and sources - updates each.

# Local Dev

See `env-example` for required ENV variables - additionally will need to create `service.json` with a Google Dev service account which has access to the Sheets API.
