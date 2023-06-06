const express = require('express');
const path = require("path");
const fs = require('fs')

const { fnoDataFetch, landingPage, search, getSpotData } = require('./routes');

const app = express()
const port = process.env.PORT || 3000

app.get('/', landingPage)
app.get('/all/:script/:data', fnoDataFetch)
app.get('/all/:script/', getSpotData)
app.get('/search/:script', search)


// app.get('/marketStatus', getCookie, marketStatus)
// app.get('/historicalData', getCookie, historicalData)
// app.get('/symbol/:symbol', getCookie, stockData)



app.listen(port, () => console.log(`Server Running at http://localhost:${port}`))
