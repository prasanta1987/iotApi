const axios = require("axios").default;
const { generateUrlList,
    batchHttpRequest,
    sendHttpRequest,
    searchSpot,
    fetchSpotData,
    batchOptFetch } = require('./helperFunctions');

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

exports.mktSnapShot = async (req, res) => {

    const response = await axios.get('https://webapi.niftytrader.in/webapi/symbol/top-gainers-data')
    delete response.data.result
    delete response.data.resultMessage

    console.log(response.data)
    res.status(200).json(response.data)
}

exports.globalMktData = async (req, res) => {

    const response = await axios.get('https://webapi.niftytrader.in/webapi/usstock/global-market')
    res.status(200).json(response.data)
}

exports.nseTicker = async (req, res) => {

    const response = await axios.get('https://webapi.niftytrader.in/webapi/symbol/nifty50-data')
    res.status(200).json(response.data)
}


exports.signIn = async (req, res) => {
    req.session.logedIn = false
    let userName = req.body.name || false
    let password = req.body.passwd || false

    let errorObj = {}

    let config = {
        method: 'get',
        url: `${process.env.KV_REST_API_URL}/get/users`,
        headers: {
            "Authorization": process.env.KV_REST_API_TOKEN,
            "Content-Type": "application/json"
        }
    }

    try {
        const data = await axios(config)
        let userDatas = JSON.parse(data.data.result)
        console.log(userDatas)
        userDatas.forEach(userData => {
            if (userData.name == userName) {
                if (userData.passwd == password) {
                    req.session.logedIn = true
                    req.session.userName = userName
                }
            }
        })
        if (req.session.logedIn == true) {
            res.status(200).json({ "msg": "success" })
        } else {
            res.status(200).json({ "msg": "failed" })
        }

    } catch (error) {
        res.status(500).json({ "error": error })
    }



}

exports.signInArduino = async (req, res) => {

    req.session.logedIn = false;

    let userName = req.headers.uname || false;
    let apiKey = req.headers.code || false;

    console.log(userName, "=>", apiKey)
    let config = {
        method: 'get',
        url: `${process.env.KV_REST_API_URL}/get/users`,
        headers: {
            "Authorization": process.env.KV_REST_API_TOKEN,
            "Content-Type": "application/json"
        }
    }

    try {
        const data = await axios(config)
        let userDatas = JSON.parse(data.data.result)

        userDatas.forEach(userData => {
            if (userData.name == userName) {
                if (userData.apiKey == apiKey) {
                    req.session.logedIn = true
                }
            }
        })

        if (req.session.logedIn == true) {
            res.status(200).send("Login Successfull")
        } else {
            res.status(200).send("Login Failed")
        }

    } catch (error) {
        res.status(500).send("Internal Server Error")
    }
}

exports.signup = async (req, res) => {

    const userLists = res.locals.userList

    let userName = req.body.name || false
    let password = req.body.passwd || false

    let objData = {
        "name": userName,
        "passwd": password,
        "apiKey": Math.random().toString(36).substring(4) + Math.random().toString(16).substring(6)
    }

    userLists.push(objData)


    var config = {
        method: 'post',
        url: `${process.env.KV_REST_API_URL}/pipeline`,
        headers: {
            "Authorization": process.env.KV_REST_API_TOKEN,
            "Content-Type": "application/json"
        },
        data: [
            ['SET', 'users', JSON.stringify(userLists)],
            ['SET', 'watchlists', JSON.stringify(
                [
                    {
                        [userName]: [
                            { "scripName": "NIFTY", "buyPrice": 1234.56, "epoc": 12344567890 }
                        ]
                    }
                ]
            )]
        ]
    };

    const data = await this.kvWrite(config)

    res.status(200).json({ data })

}

exports.signOut = (req, res) => {

    req.session.logedIn = false
    req.session.userName = null
    res.status(200).json({ "msg": "success" })
}

exports.kvWrite = async (config) => {

    await axios(config)
        .then(data => {
            console.log(data.data)
            return data.data
        })
        .catch(err => {
            console.log(err)
            return err
        })

}
