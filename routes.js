const axios = require("axios").default;
const { generateUrlList, batchHttpRequest, sendHttpRequest, searchSpot, fetchSpotData } = require('./helperFunctions');

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

exports.getSpotData = async (req, res) => {

    const scripCode = req.params.script.toUpperCase();
    const jsonData = await fetchSpotData(scripCode)

    res.status(200).json(jsonData)
}

exports.landingPage = (req, res) => {
    const url = 'https://appfeeds.moneycontrol.com/jsonapi/fno/overview&format=json&inst_type=options&option_type=CE&id=NIFTY'
    sendHttpRequest(req, res, url)
}


