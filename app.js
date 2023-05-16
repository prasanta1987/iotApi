const express = require('express');
const {
    marketStatus,
    historicalData,
    stockData,
    landingPage
} = require('./routes');

const axios = require("axios").default;

const app = express()

let ceRawData = {}
let peRawData = {}
let urlList = [
    { "type": "CE", "url": 'https://appfeeds.moneycontrol.com/jsonapi/fno/overview&format=json&inst_type=options&option_type=CE&id=NIFTY' },
    { "type": "PE", "url": 'https://appfeeds.moneycontrol.com/jsonapi/fno/overview&format=json&inst_type=options&option_type=PE&id=NIFTY' }
]

urlList.map(data => {
    if (data.type == "CE") {
        ceRawData = getHttpRequest(data.url);
    }

    if (data.type == "PE") {
        peRawData = getHttpRequest(data.url);
    }
})

const getCookie = (req, res, next) => {

    var config = {
        method: 'get',
        url: 'https://www.nseindia.com/',
    };

    axios(config)
        .then(response => {
            const rawCookie = response.headers["set-cookie"];
            const formattedCookie = `${rawCookie[0].split(";")[0]};${rawCookie[1].split(";")[0]}`
            res.locals.myCookie = formattedCookie
            return next();
        })
        .catch(error => console.log(error));

}

app.get('/',)
app.get('/marketStatus', getCookie, marketStatus)
app.get('/historicalData', getCookie, historicalData)
app.get('/symbol/:symbol', getCookie, stockData)

const getHttpRequest = (url) => {

    var config = {
        method: 'get',
        url: url,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // axios(config)
    // .then(response => return response.data)
    // .catch(error => return error);
}

const port = process.env.PORT || 3000

app.listen(port, () => console.log(`Server Running at http://localhost:${port}`))