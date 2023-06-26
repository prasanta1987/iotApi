const express = require('express');
const session = require('express-session');
const path = require("path");
const axios = require("axios").default;

const { fnoDataFetch,
    search,
    getSpotData,
    signIn,
    signup, signOut } = require('./routes');

const app = express()
const port = process.env.PORT || 3000

app.use(express.json());
app.use(session({
    secret: 'SDApp',
    resave: true,
    saveUninitialized: true,
    logedIn: false,
    userName: null
}));


// Middlewares Starts Here

// const useNoCache = (req, res, next) => {
//     res.setHeader('Cache-Control', 'no-store,no-cache');
//     return next();
// }

const isLogedIn = (req, res, next) => {

    if (req.session.logedIn) {
        return next()
    } else {
        res.sendFile(path.join(__dirname, '/public/login.html'));
    }
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

// Middlewares Ends Here

// API Request Starts
app.get('/all/:script/:data', fnoDataFetch)
app.get('/all/:script/', getSpotData)
app.get('/search/:script', search)
// API Request Ends


// Page Navigation
app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));


// Sign-In Sign-Up Handler
app.post('/loginStatus', (req, res) => {

    res.setHeader('Cache-Control', 'no-store, no-cache');
    if (!req.session.logedIn) req.session.logedIn = false
    if (!req.session.userName) req.session.userName = null

    res.status(200).json({ "logInStat": req.session.logedIn, "userName": req.session.userName })
})

app.post('/signIn', signIn)
app.post('/signOut', signOut)
app.post('/signUp', checkUserData, signup)


app.use(express.static(path.join(__dirname, 'public')));
app.listen(port, () => console.log(`Server Running at http://localhost:${port}`))
