const express = require('express');
const session = require('express-session');
const cors = require('cors')
const path = require("path");
const axios = require("axios").default;
require('dotenv').config()

const { fnoDataFetch, search, getSpotData,
    signIn, signup, signOut, signInArduino,
    mktSnapShot, globalMktData, nseTicker,
    getWatchLists, getExpiryandStrikes } = require('./routes');

const { FBsignIn, authStateCheck, chckLogin, FBsignInArduino } = require('./firebaseFunctions');

const app = express()
const port = process.env.PORT || 3161


var corsOptions = {
    origin: ['https://investobaba.web.app', 'http://localhost:3161'],
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(express.json());
app.use(session({
    secret: '@BCD2023',
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: true,
        httpOnly: false,
        sameSite: 'none',
        maxAge: (30 * 86400 * 1000)
    }
}));
app.use(cors(corsOptions));


// Middlewares Starts Here

const useNoCache = (req, res, next) => {
    // res.setHeader('Cache-Control', 'must-revalidate');
    // res.setHeader('Cache-Control', 'no-store');
    return next();
}

const mainRoute = (req, res) => {

    // if (req.session.logedIn) {
    //     res.redirect('/dashboard')
    //     // res.sendFile(path.join(__dirname, '/public/dashboard.html'));
    // } else {
    //     res.redirect('/')
    //     // res.sendFile(path.join(__dirname, '/public/index.html'));
    // }
}

const checkUserData = async (req, res, next) => {

    let errorObj = {}
    let userName = req.body.name

    if (userName.length < 3) {
        errorObj.userNameError = "User Name too Short"
    }

    let config = {
        method: 'get',
        headers: {
            "Authorization": process.env.KV_REST_API_TOKEN,
            "Content-Type": "application/json"
        }
    }
    const data = await axios(`${process.env.KV_REST_API_URL}/get/users`, config)
    const rawUserData = JSON.parse(data.data.result)

    try {
        rawUserData.forEach(userData => {
            if (userData.name == userName) errorObj.error = "User Name Already Exist"
        })
    } catch (error) {
        res.locals.userList = []
        return next()
    }


    if (Object.keys(errorObj).length > 0) {
        res.status(500).json(errorObj)
    } else {
        res.locals.userList = rawUserData
        return next()
    }

}

const apiAuthCheck = (req, res, next) => {
    if (req.session.logedIn) {
        return next()
    } else {
        res.status(401).send("Unautorized Access")
    }
}

// Middlewares Ends Here

// API Request Starts

// Un-Authenticated
app.get('/all/:script/:data', fnoDataFetch)
app.get('/all/:script/', getSpotData)
app.get('/search/:script', search)
app.get('/marketSnapShot', mktSnapShot)
app.get('/globalMktData', globalMktData)
app.get('/nseTicker', nseTicker)
app.get('/expStrike/:scripCode', getExpiryandStrikes)

// DataBase Commands Starts

app.post('/getWatchList', getWatchLists);


// DataBase Commands Ends

// Authenticated
app.get('/spot/:script/', apiAuthCheck, getSpotData)
app.get('/fno/:script/:data', apiAuthCheck, fnoDataFetch)

// API Request Ends


// Page Navigation

// app.get('/dashboard', authPageRout);
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, '/public/dashboard.html')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '/public/index.html')));


// Sign-In Sign-Up Handler

app.post('/signIn', FBsignIn)
// app.post('/signIn', signIn)
app.post('/signInArduino', FBsignInArduino) //Arduino Specific
app.post('/signOut', signOut)
app.post('/signUp', checkUserData, signup)

// app.post('/loginStatus', (req, res) => {

//     // if (!req.session.logedIn) req.session.logedIn = false
//     // if (!req.session.userName) req.session.userName = null

//     res.status(200).json({ "logInStat": req.session.logedIn, "userName": req.session.userName })
// })
app.post('/loginStatus', chckLogin)
// app.post('/loginStatus', authStateCheck)


app.use(express.static(path.join(__dirname, 'public')));
app.listen(port, () => console.log(`Server Running at http://localhost:${port}`))
