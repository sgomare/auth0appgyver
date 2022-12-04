var https = require("https");
var fs = require("fs");
const express = require("express");
const app = express();
const { auth, requiredScopes } = require("express-oauth2-jwt-bearer");
const cors = require("cors");
const getFirebaseToken = require("./firebase.js");

var admin = require("firebase-admin");
require("dotenv").config();

// Setup HTTPS
var privateKey = fs.readFileSync(
  "./certs/host.key",
  "utf8"
);
var certificate = fs.readFileSync(
  "./certs/host.crt",
  "utf8"
);

if (!process.env.ISSUER_BASE_URL || !process.env.AUDIENCE || !process.env.DATABASEURL ) {
  throw "Make sure you have ISSUER_BASE_URL, AUDIENCE and DATABASEURL in your .env file";
}

var credentials = { key: privateKey, cert: certificate };
const serviceAccount = require("./serviceaccount.json");

var fapp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASEURL
});

const corsOptions = {
  origin: "http://localhost:3000",
};

app.use(cors(corsOptions));

// Check Auth0 Jwt
const checkJwt = auth();

app.use('/', function (req, res, next) {
  //   console.log(JSON.stringify(req.headers));
  next();
});

app.get(
  "/api/firebase",
  checkJwt,
  getFirebaseToken,
  function (req, res) {
  }
);

app.use(function (err, req, res, next) {
  return res.set(err.headers).status(404).json({ message: err.message });
});

var httpsServer = https.createServer(credentials, app);
httpsServer.listen(443);
console.log("Listening on 443");
