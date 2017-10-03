# FETS - Fire Emergency Tactical System

## An early alert system for fire preventions

[!Main page](screenshots/fets-main.jpeg "FETS main page")

FETS is an early fire detection system utilizing public awareness in order to collect early indications of potential wildfires. The web application, receives data such as GPS coordinates and timestamps from the accompaning Android application and renders the related information locally in Google maps.

The application uses a WebSocket connection in order to render the incoming data in user's browser without reloading the page. Additionaly it plays an alerting sound to catch user's attention.

[!Event settings menu](screenshots/fets-event-settings.jpeg "FETS event settings menu")

[!Login page](screenshots/fets-login.jpeg "FETS login page")

## Stack

* Adonisjs
* Bulma
* jQuery
* Gulp
* Browserify
* ES2015

## Setup

1. checkout the code
1. npm i

after finishing the installation of dependencies run

```bash
adonis serve --dev
```

### Migrations

Run the following command to run startup migrations.

```js
adonis migration:run
```

### Google Maps Key

You must get an API key from Google's console site and add it to .env file.

### API

The public API has one endpoint used to receive new alert notifications

**Example:**

```bash
curl -H "Content-Type: application/json" -X POST -d '{"phonenumber":"1111111111","lat": 40.064977, "lon": 23.913121}' http://127.0.0.1:3333/api/v1/alerts/create
curl -H "Content-Type: application/json" -X POST -d '{"phonenumber":"2222222222","lat": 40.5, "lon": 23.1}' http://127.0.0.1:3333/api/v1/alerts/create

```

### Global Variables in Views

To add - remove a global variable from the views, modify the `Http.onStart` function located at `app/Listeners/Http.js` file.


### Deployment

Reference links

https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-16-04
http://pm2.keymetrics.io/docs/usage/quick-start/
