const express = require('express');
const session = require('express-session');
const path = require("path");
const axios = require("axios").default;
// const fs = require('fs')


const { fnoDataFetch,
    landingPage,
    search,
    getSpotData,
    login,
    signup } = require('./routes');

const app = express()
const port = process.env.PORT || 3000

app.use(express.json());
app.use(session({
    secret: 'SDApp',
    resave: true,
    saveUninitialized: true
}));

const isLogedIn = (req, res, next) => {
    if (req.session.logedIn) {
        return next()
    } else {
        res.sendFile(path.join(__dirname, '/login.html'));
    }
}

app.get('/', isLogedIn, (req, res) => res.sendFile(__dirname + '/index.html'));
app.get('/all/:script/:data', fnoDataFetch)
app.get('/all/:script/', getSpotData)
app.get('/search/:script', search)
// app.use(express.static(path.join(__dirname, 'assets')));

// Sign-In Sign-Up Handler

app.post('/login', login)
app.post('/signup', signup)


// req.session.logedIn = true
// console.log(process.env.KV_REST_API_URL);
// console.log(process.env.KV_REST_API_TOKEN);

// var config = {
//     method: 'post',
//     url: `${process.env.KV_REST_API_URL}/set/users/`,
//     headers: {
//         "Authorization": process.env.KV_REST_API_TOKEN,
//         "Content-Type": "application/json"
//     },
//     data: { "name": "PKS" }
// };

// var config = {
//     method: 'get',
//     url: `${process.env.KV_REST_API_URL}/get/users/`,
//     headers: {
//         "Authorization": process.env.KV_REST_API_TOKEN
//     }
// };

// axios(config)
//     .then(data => {
//         // console.log(data.data)
//         console.log(JSON.parse(data.data.result))
//     })
//     .catch(err => console.log(err))

// app.get('/marketStatus', getCookie, marketStatus)
// app.get('/historicalData', getCookie, historicalData)
// app.get('/symbol/:symbol', getCookie, stockData)



app.listen(port, () => console.log(`Server Running at http://localhost:${port}`))
