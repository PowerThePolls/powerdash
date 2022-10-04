# Power Dash

Scripts deployed to lambda via serverless to sync partner data with google sheets - consists of two handlers

### Deployment

```shell
serverless deploy
```

### getZip in AWS

```shell
curl -X GET https://smartystreet.powerthepolls.org/dev/zip?zipcode=20036
```

# Local Dev

- See `env-example` for required ENV variables.

### getZip local

```shell
serverless offline
```

```shell
curl -X GET http://localhost:3000/dev/zip?zipcode=20036
```
