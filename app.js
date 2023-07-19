const express = require('express');
const session = require('express-session');
const cors = require('cors')
const path = require("path");
const axios = require("axios").default;
const jwt = require('jsonwebtoken');
require('dotenv').config()

const { fnoDataFetch, search, getSpotData,
    signInArduino,
    mktSnapShot, globalMktData, nseTicker,
    getWatchLists, getExpiryandStrikes, getSpotFut,
    getTechnicalData } = require('./routes');

const { FBsignIn, authStateCheck, chckLogin,
    FBsignInArduino, authApiCall,
    arduinoSignInRout, arduinoAskCred } = require('./firebaseFunctions');

// R8Mht71A6kZTglkHjzrMjiiVMP12

const app = express()
const port = process.env.PORT || 3161
// require('events').EventEmitter.defaultMaxListeners = 0

var corsOptions = {
    origin: ['https://investobaba.web.app', 'http://localhost:3161'],
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(express.json());
app.use(cors());
// app.use(cors(corsOptions));
app.use(session({
    secret: 'IMPK3161',
    resave: true,
    saveUninitialized: true
}));

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

// Un-Authenticated
app.get('/all/:script/:data', fnoDataFetch)
app.get('/all/:script/', getSpotData)
app.get('/technicals/:scripCode/', getTechnicalData)
app.get('/search/:script', search)
app.get('/marketSnapShot', mktSnapShot)
app.get('/globalMktData', globalMktData)
app.get('/nseTicker', nseTicker)


// Authenticated
app.get('/expStrike/:scripCode/:opType', verifyIdToken, getExpiryandStrikes)
app.get('/spotFut/:script', verifyIdToken, getSpotFut)
// app.get('/getFutureData/:scripcode/:expiry', getFutureDataWithdate)

// Arduino Specific Routes
app.post('/signInArduino', arduinoSignInRout)
app.post('/addArduinoDevice', arduinoAskCred)
app.get('/spotArduino/:script/', apiAuthCheck, getSpotData)

// app.post('/getWatchList', getWatchLists);


// DataBase Commands Ends

// Authenticated
// app.get('/spot/:script/', authApiCall, getSpotData)
// app.get('/fno/:script/:data', authApiCall, fnoDataFetch)

// API Request Ends


// Page Navigation

// app.get('/dashboard', authPageRout);
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '/public/index.html')));
app.get('/strategy', (req, res) => res.sendFile(path.join(__dirname, '/public/strategy.html')));


// Sign-In Sign-Up Handler

// app.post('/signIn', FBsignIn)
// app.post('/signIn', signIn)
// app.post('/signOut', signOut)
// app.post('/signUp', checkUserData, signup)


// Arduino Specific Routes
// app.post('/signInArduino', FBsignInArduino) //Arduino Specific

// Arduino Specific Routes

// app.post('/loginStatus', (req, res) => {

//     // if (!req.session.logedIn) req.session.logedIn = false
//     // if (!req.session.userName) req.session.userName = null

//     res.status(200).json({ "logInStat": req.session.logedIn, "userName": req.session.userName })
// })
// app.post('/loginStatus', chckLogin)
// app.post('/loginStatus', authStateCheck)


app.use(express.static(path.join(__dirname, 'public')));
app.listen(port, () => console.log(`Server Running at http://localhost:${port}`))
