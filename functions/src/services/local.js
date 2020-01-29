// import * as functions from 'firebase-functions';
const admin = require('firebase-admin');
const saKey = require('./service-account-key.json');

admin.initializeApp({
    credential: admin.credential.cert(saKey),
    databaseURL: 'https://monopolygony.firebaseio.com',
});

// run anything
