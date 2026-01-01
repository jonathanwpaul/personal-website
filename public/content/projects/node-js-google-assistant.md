# Installation

## get secret

- create a new project at https://console.cloud.google.com/ (you'll need a Google account)
  - you'll need the project id in later steps
- select `APIs & Services`
- select `Enable APIs &Services`
- search for and enable Google Assistant API
- go back to `APIs & Services`
- - if you haven't enabled the consent screen already, do so by following the prompts. Make sure to add the `Google Assistant API` as a scope and yourself as a test user (now you don't have to push the app to production)
  - NOTE: if you don't submit the app for verification, the refresh token ends up expiring after 7 days. The app shouldn't actually need to be verified
- select create credentials
  - for `OAuth Client Id`
  - for `application type`, use `Web application`
  - add a redirect uri of `http://localhost:<PORT>/code` for the port you plan on using
- download client_secret JSON
- I renamed mine to client_secret.json

## register device model

> feel free to change the type, manufacturer, or product-name.
> the model must be a globally unique identifier, so Google recommends you to prefix w/ your project id

```sh
python -m pip install --upgrade google-assistant-sdk
googlesamples-assistant-devicetool --project-id YOUR_PROJECT_ID --credentials credentials.json register-model --model YOUR_PROJECT_ID-node-js-server1 --type LIGHT --manufacturer YOUR_NAME --product-name "Node JS Server"
googlesamples-assistant-devicetool --project-id YOUR_PROJECT_ID --credentials credentials.json register-device --device node-js-server --model YOUR_PROJECT_ID-
node-js-server1 --client-type SERVICE
```

check that it's registered:

```
googlesamples-assistant-devicetool --project-id YOUR_PROJECT_ID --credentials credentials.json list --model
```

- you'll need the Device Instance ID and Model for your env variables

## configuring .env

use .env.template as starter:
|variable|definition|
|---|---|
|PORT| port to run express server on/expose|
|CREDENTIALS_PATH| path to token file (not client_secret)|
|DEVICE_MODEL_ID|project's device model id|
|DEVICE_INSTANCE_ID|project's device instance id|
|GRCP_TRACE|trace logging level|
|GRCP_VERBOSITY|logging level (i think this is deprecated, but kept it in for now)|

## run

### Docker

```sh
docker compose up -d
```
> this should output a url for authentication in the logs (`docker logs <CONTAINER NAME>`). If you have a browser installed on the server running the container and configured the redirect uri correctly in the console, the code should automatically be read by the express server. 
- if you don't have a browser available, you can open the url on another computer and you should see the browser try to redirect to `http://localhost:3000/code?code=<SOME_CODE>`. You can manually send a get request via curl or your browser with the server's IP in place of localhost:3000 and it will be authenticated.

### Node (v20)

```sh
node --env-file .env src/index.js
```

