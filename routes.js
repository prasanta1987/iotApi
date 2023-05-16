const axios = require("axios").default;

exports.marketStatus = (req, res) => {
    const url = 'https://www.nseindia.com/api/marketStatus'
    sendHttpRequest(req, res, url)
}

exports.landingPage = (req,res)=>{
const url = 'https://api.openweathermap.org/data/2.5/weather?q=rourkela&units=metric&appid=0c6ddcd4bf425f7a1ecc76a92d9f9eb9'
sendHttpRequest(req, res, url)
}

exports.historicalData = (req, res) => {
    const url = 'https://www.nseindia.com/api/historical/fo/derivatives/meta?&from=09-03-2023&to=09-04-2023&instrumentType=FUTIDX&symbol=NIFTY&CSV=TRUE'
    sendHttpRequest(req, res, url)
}

exports.stockData = (req, res) => {
    const scripCode = (req.params.symbol).toUpperCase();
    const url = `https://www.nseindia.com/api/quote-equity?symbol=${scripCode}`

    sendHttpRequest(req, res, url)
}


// https://www.nseindia.com/api/search/autocomplete?q=abb
// https://www.nseindia.com/api/equity-meta-info?symbol=ABBOTINDIA
// https://www.nseindia.com/api/quote-equity?symbol=ABBOTINDIA&section=trade_info
// https://www.nseindia.com/api/quote-equity?symbol=ABBOTINDIA


sendHttpRequest = (req, res, url) => {

    var config = {
        method: 'get',
        url: url,
        headers: {
            // 'Content-Type': 'application/json',
            'cookie': res.locals.myCookie || ""
        },
    };

    axios(config)
        .then(response => res.status(200).json(response.data))
        .catch(error => res.status(501).json(error));
}
