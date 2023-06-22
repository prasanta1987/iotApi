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

exports.getAllOptData = async (req, res) => {
    const jsonData = await batchOptFetch()

    res.status(200).json(jsonData)
}

exports.login = async (req, res) => {

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

    const data = await axios(config)
    let userDatas = JSON.parse(data.data.result)

    userDatas.forEach(userData => {
        if (userData.name == userName) {
            if (userData.passwd == password) {
                req.session.logedIn = true
                res.status(200).json({ "msg": "Login Successful" })
            } else {
                res.status(200).json({ "msg": "Wrong Password" })
            }
        } else {
            res.status(200).json({ "msg": "User Name Not Found" })
        }
    })

}

exports.signup = async (req, res) => {

    const userLists = res.locals.userList

    let userName = req.body.name || false
    let password = req.body.passwd || false

    let objData = {
        "name": userName,
        "passwd": password
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