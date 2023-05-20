const express = require('express');

const { fnoDataFetch, landingPage } = require('./routes');

const app = express()

app.get('OPT/:script/:data', fnoDataFetch)
app.get('/', landingPage)


// app.get('/marketStatus', getCookie, marketStatus)
// app.get('/historicalData', getCookie, historicalData)
// app.get('/symbol/:symbol', getCookie, stockData)


const port = process.env.PORT || 3000

app.listen(port, () => console.log(`Server Running at http://localhost:${port}`))
