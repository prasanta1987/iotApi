const axios = require("axios").default;
const { generateUrlList, batchHttpRequest, sendHttpRequest, searchSpot } = require('./helperFunctions');

exports.fnoDataFetch = async (req, res) => {

    const scripCode = req.params.script.toUpperCase();
    const urlLists = generateUrlList(req.params.data.toUpperCase(), scripCode)
    const jsonData = await batchHttpRequest(urlLists, scripCode)
    res.status(200).json(jsonData)

}

exports.search = async (req, res) => {

    const scripCode = req.params.script.toLowerCase();
    const jsonData = await searchSpot(scripCode)

    res.status(200).json(jsonData)

}

exports.marketStatus = (req, res) => {
    const url = 'https://www.nseindia.com/api/marketStatus'
    sendHttpRequest(req, res, url)
}

exports.landingPage = (req, res) => {
    const url = 'https://appfeeds.moneycontrol.com/jsonapi/fno/overview&format=json&inst_type=options&option_type=CE&id=NIFTY'
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


