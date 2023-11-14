const express = require('express');
const session = require('express-session');
const cors = require('cors')
const path = require("path");
const axios = require("axios").default;
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser')
require('dotenv').config()

const { fnoDataFetch, search, getSpotData,
    signInArduino,
    mktSnapShot, globalMktData, nseTicker,
    getWatchLists, getExpiryandStrikes, getSpotFut,
    getTechnicalData, batchSpotData, getOptionsChain } = require('./routes');

const { arduinoAskCred,
    authArduino, arduinoDevData,
    listPics, getPicUrl, updatePic } = require('./firebaseFunctions');



const app = express()
const port = process.env.PORT || 3161
app.use(bodyParser.json({ type: 'application/*+json' }))
app.use(bodyParser.text({ type: 'text/html' }))

// require('events').EventEmitter.defaultMaxListeners = 0

var corsOptions = {
    origin: ['https://investobaba.web.app', 'http://localhost:3161'],
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}


app.use(express.json());
app.use(cors());
// app.use(cors(corsOptions));


// Middlewares Starts Here

const apiAuthCheck = (req, res, next) => {
    if (req.session.logedIn) {
        return next()
    } else {
        res.status(401).send("Unautorized Access")
    }
}

const verifyIdToken = (req, res, next) => {

    let userIdToken = req.headers.authorization || null;
    userIdToken = (userIdToken) && userIdToken.split(" ")[1];

    const resulData = jwt.decode(userIdToken, { complete: true });

    if (resulData) {
        return next()
    } else {
        res.status(401).json({ 'Msg': 'Unauthorized' })
    }

}



// Middlewares Ends Here

// API Request Starts

app.get('/spots/:scripts', batchSpotData)



// OLD
app.get('/all/:script/:data', fnoDataFetch)
app.get('/all/:script/', getSpotData)
app.get('/technicals/:scripCode/', getTechnicalData)


app.get('/search/:script', search) //Will be Depricated

// Front-End Specific Routes
app.get('/marketSnapShot', mktSnapShot)
app.get('/globalMktData', globalMktData)
app.get('/nseTicker', nseTicker)
app.get('/optionChain/:scriptCode/:expDate', getOptionsChain)


// Authenticated
app.get('/expStrike/:scripCode/:opType', getExpiryandStrikes)
app.get('/spotFut/:script', getSpotFut)
app.post('/authArduinoDevice', authArduino)
// app.get('/getFutureData/:scripcode/:expiry', getFutureDataWithdate)


// Arduino Specific Routes Starts
app.post('/addArduinoDevice', arduinoAskCred)
app.get('/getArduinoData/:userUID', arduinoDevData)
app.get('/pic/:tags', getPicUrl)
app.get('/pic', getPicUrl)
app.get('/listPics/:tag', listPics)
app.get('/listPics', listPics)
app.get('/updatePics/:fileId/:tags', updatePic)
// Arduino Specific Routes Ends

app.post('/pingTest', (req, res) => {

    console.log(req.body)

    res.status(200).json({
        "msg": "Success"
    })
})



// Page Navigation
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '/public/index.html')));
app.get('/strategy', (req, res) => res.sendFile(path.join(__dirname, '/public/strategy.html')));




// MQTT


const mqtt = require("mqtt");
const client = mqtt.connect("mqtt://broker.hivemq.com");

client.on("connect", () => {
    client.subscribe("pk_text", (err) => {
        if (!err) {
            client.publish("pk_text", (new Date().getTime()).toString());
        }
    });

});

client.on("message", (topic, message) => {
    // message is Buffer
    // console.log(topic)
    console.log(message.toString());
    // client.end();
});


app.use(express.static(path.join(__dirname, 'public')));
app.listen(port, () => console.log(`Server Running at http://localhost:${port}`))
