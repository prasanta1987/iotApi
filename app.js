const express = require('express');
const {
    marketStatus,
    historicalData,
    stockData
} = require('./routes');

const axios = require("axios").default;

const app = express()


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

app.get('/marketStatus', landingPage)
app.get('/marketStatus', getCookie, marketStatus)
app.get('/historicalData', getCookie, historicalData)
app.get('/symbol/:symbol', getCookie, stockData)


const port = process.env.PORT || 3000

app.listen(port, () => console.log(`Server Running at http://localhost:${port}`))
