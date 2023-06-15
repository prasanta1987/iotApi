const axios = require("axios").default;
const { generateUrlList,
    batchHttpRequest,
    sendHttpRequest,
    searchSpot,
    fetchSpotData,
    allCE } = require('./helperFunctions');

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

exports.getAllCE = async (req, res) => {
    const scripCode = req.params.script.toUpperCase();
    const jsonData = await allCE(scripCode)

    res.status(200).json(jsonData)
}

exports.login = (req, res) => {


    let userName = req.body.name || false
    let password = req.body.passwd || false

    console.log(userName)
    console.log(password)

    res.status(200).json({})
}

exports.signup = async (req, res) => {

    let userName = req.body.name || false
    let password = req.body.passwd || false

    var config = {
        method: 'post',
        url: `${process.env.KV_REST_API_URL}/pipeline`,
        headers: {
            "Authorization": process.env.KV_REST_API_TOKEN,
            "Content-Type": "application/json"
        },
        data: [
            ['SET', 'users', JSON.stringify(
                [
                    { "name": userName, "passwd": password }
                ]
            )],
            ['SET', 'watchlists', JSON.stringify(
                [
                    {
                        [userName]: ['Stock1', 'Stock2']
                    }
                ]
            )]
        ]
    };

    const data = await this.kvWrite(config)

    res.status(200).json({ data })

}

exports.kvWrite = async (config) => {

    axios(config)
        .then(data => {
            return data.data
        })
        .catch(err => {
            console.log(err)
            return err
        })

}

exports.axiosReadOnKv = (config) => {

    axios(config)
        .then(data => {
            console.log(data.data)
            return data.data
        })
        .catch(err => {
            console.log(err)
            return err
        })

}