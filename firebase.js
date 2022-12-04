require("dotenv").config();
const fetch = require("node-fetch");
var admin = require("firebase-admin");

const getFirebaseToken = async function (req, res, next) {

    var userInfoUrl = process.env.ISSUER_BASE_URL + "/userinfo";
    try {
        const response = await fetch(userInfoUrl, {
            method: "get",
            headers: {
                Authorization: req.get("Authorization"),
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();
        const { sub: uid } = data;

        admin.auth().createCustomToken(uid)
            .then(customToken =>
                res.json({ firebaseToken: customToken })
            )
            .catch(err =>
                res.status(500).send({
                    message: 'Something went wrong acquiring a Firebase token.',
                    error: err
                })
            );


    } catch (err) {
        console.error(err);
        next(err);
    }
};

module.exports = getFirebaseToken;
