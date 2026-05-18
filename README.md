# Powerdash
Serverless TypeScript APIs that support Power the Polls operations by validating zip codes and routing election-admin outreach emails.

## Why this project exists
Power the Polls coordinates with election offices and volunteers across many jurisdictions. This repository provides backend utility endpoints used by that workflow.

The project solves two operational problems:
- It validates or enriches ZIP code data through SmartyStreets.
- It sends templated emails to election administrators using Mailgun, with recipient lookup from the WorkElections WordPress API.

In the broader ecosystem, `powerdash` is a lightweight integration service that connects Power the Polls applications to external systems without requiring those systems to be called directly from frontend clients.

## Features
- `GET /zip` endpoint for SmartyStreets ZIP code lookup.
- `POST /electmail` endpoint for election-admin email delivery.
- Local API simulation with `serverless-offline`.
- AWS Lambda deployment through the Serverless Framework.
- TypeScript codebase with linting and formatting scripts.

## Prerequisites
- Node.js `16.x` (required by this repo and `.nvmrc`).
- npm `7+` (the lockfile uses version 2 format).
- AWS credentials for deployment:
  - `AWS_PROFILE`
  - `AWS_REGION`
- External service credentials:
  - `SS_AUTH_ID`
  - `SS_AUTH_TOKEN`
  - `MAILGUN_API_KEY`

Optional but recommended:
- `nvm` for Node version management.
- `direnv` for automatic loading of `.env` values through `.envrc`.

## Local setup
1. Clone the repository.
```bash
git clone https://github.com/PowerThePolls/powerdash.git
cd powerdash
```
2. Use the expected Node version.
```bash
nvm use
```
3. Install dependencies.
```bash
npm install
```
4. Create your environment file.
```bash
cp env-example .env
```
5. Add required values to `.env`.
```env
# AWS credentials and region used by serverless deploy
AWS_PROFILE=your_aws_profile
AWS_REGION=us-east-1

# SmartyStreets API credentials for /zip
SS_AUTH_ID=your_smarty_auth_id
SS_AUTH_TOKEN=your_smarty_auth_token

# Mailgun API key for /electmail
MAILGUN_API_KEY=your_mailgun_api_key
```
6. Load environment variables into your shell.

If you use `direnv`:
```bash
direnv allow
```
If you do not use `direnv`, export variables manually before running the app.
```bash
export AWS_PROFILE=your_aws_profile
export AWS_REGION=us-east-1
export SS_AUTH_ID=your_smarty_auth_id
export SS_AUTH_TOKEN=your_smarty_auth_token
export MAILGUN_API_KEY=your_mailgun_api_key
```
7. Start the local API.
```bash
npm start
```

Expected local URL:
- `http://localhost:3000/dev`

Expected routes:
- `GET http://localhost:3000/dev/zip?zipcode=20036`
- `POST http://localhost:3000/dev/electmail`

## Common setup issues
- If `MAILGUN_API_KEY` is missing or invalid, `POST /electmail` returns HTTP `422`.
- If `SS_AUTH_ID` or `SS_AUTH_TOKEN` is missing or invalid, `GET /zip` fails against SmartyStreets.
- If port `3000` is already in use, run:
```bash
npx serverless offline --httpPort 3001
```

## How to make changes
1. Create a branch from `master`.
```bash
git checkout -b your-branch-name
```
2. Make code changes in:
- `handler.ts` for request handling.
- `src/smartyStreet.ts` for ZIP lookup logic.
- `src/mailGun.ts` for election email logic.
3. Run formatting and linting.
```bash
npm run prettier
npm run lint
```
4. Run locally and validate endpoint behavior with curl requests.
5. Commit and open a pull request with a clear summary and test notes.

## Deployment and GitHub Actions
Current deployment path is manual.

Deploy to AWS from your local environment:
```bash
npm run deploy
```

Notes:
- Deployment uses the Serverless Framework configuration in `serverless.yml`.
- Required environment variables must be available in your shell before deploy.
- The repository currently contains a disabled GitHub Actions workflow at `.github/disabled-workflows/deploy.yml`.
- There is no active CI or CD workflow under `.github/workflows` right now.

To re-enable automated deployment, move or recreate a workflow file under `.github/workflows` and update it to use supported action versions and Node 16.

## Issues and testing
### Reporting issues
- Open a GitHub issue in this repository with:
  - Clear reproduction steps.
  - Expected result.
  - Actual result.
  - Relevant request payloads or logs, without secrets.

### Testing and validation
There is no dedicated automated test suite configured in this repository today.

Validate changes with:
```bash
npm run lint
npm start
```

Then verify both endpoints with usage examples below.

## Usage examples
### ZIP lookup
```bash
curl -X GET "http://localhost:3000/dev/zip?zipcode=20036"
```

Expected behavior:
- Returns SmartyStreets response payload.
- Uses status code from SmartyStreets API.

### Election-admin email send
```bash
curl -X POST "http://localhost:3000/dev/electmail" \
  -H "Content-Type: application/json" \
  -d '{
    "jurisdictionId": 123,
    "firstName": "Alex",
    "lastName": "Rivera",
    "email": "alex@example.com"
  }'
```

Expected behavior:
- Success response: `{"message":"Message sent"}` with HTTP `200`.
- Failure response: `{"message":"Could not send"}` with HTTP `422`.

### Example deployed ZIP lookup
```bash
curl -X GET "https://smartystreet.powerthepolls.org/dev/zip?zipcode=20036"
```

## Contributing guidelines
- Keep changes focused and scoped to a clear problem.
- Follow existing TypeScript style and naming conventions.
- Run `npm run prettier` and `npm run lint` before opening a pull request.
- Document behavior changes in the PR description, including manual validation steps.
- Do not commit secrets or real API credentials.

## License
MIT. See `LICENSE` for full text.
