const axios = require("axios").default;
const { generateUrlList, batchHttpRequest, sendHttpRequest,
    searchSpot, fetchSpotData, fetchFutData, getMarketLot } = require('./helperFunctions');

const auth = require('./firebaseFunctions')

exports.getTechnicalData = async (req, res) => {

    let scripCode = req.params.scripCode.toUpperCase()

    if (scripCode == "NIFTY") {
        scripCode = "NIFTY 50"
    } else if (scripCode == "BANKNIFTY") {
        scripCode = "NIFTY BANK"
    }


    const urlList = [
        `https://intradayscreener.com/api/CandlestickAnalysis/Indicators/${scripCode}/5`,
        `https://intradayscreener.com/api/CandlestickAnalysis/Indicators/${scripCode}/15`,
        `https://intradayscreener.com/api/CandlestickAnalysis/Indicators/${scripCode}/60`,
        `https://intradayscreener.com/api/CandlestickAnalysis/Indicators/${scripCode}/daily`
    ]

    let allRequests = await urlList.map(url => axios(url));
    let allResponses = await Promise.all(allRequests);

    let objData = {}
    let arrayData = []

    allResponses.map(data => {
        console.log(data)
        arrayData.push(data.data)
    })

    objData.min5data = arrayData[0]
    objData.min15data = arrayData[1]
    objData.min60data = arrayData[2]
    objData.dailydata = arrayData[3]

    res.status(200).json(objData)
}

exports.fnoDataFetch = async (req, res) => {

    const code = req.params.script.toUpperCase();
    const scripCode = await searchSpot(code)


    const urlLists = generateUrlList(req.params.data.toUpperCase(), scripCode)
    const jsonData = await batchHttpRequest(urlLists, scripCode)
    res.status(200).json(jsonData)

}

exports.getSpotFut = async (req, res) => {

    const code = req.params.script.toUpperCase();

    const scripCode = await searchSpot(code)
    const spotData = await fetchSpotData(scripCode)
    let futData = await fetchFutData(scripCode)

    futData = futData.slice(0, 1)

    futData.map(x => {
        spotData.futExpiry = x.futExpiry
        spotData.futLtp = x.futLtp
        spotData.futChange = x.futChange
    })

    delete spotData.adv
    delete spotData.decl
    delete spotData.dayLow
    delete spotData.dayHigh
    delete spotData.spotChngPct

    Object.keys(spotData).map(x => {

        if (x != "spotName" && x != "futExpiry" && x != "mktStatus") spotData[x] = parseFloat(spotData[x])

    })

    let futExpDate = this.timeStamapToMCDate((new Date(`${spotData.futExpiry} ${new Date().getFullYear()}`)).getTime())

    try {
        const mktData = await getMarketLot(scripCode, futExpDate)
        spotData.mktLot = mktData.mktLot

    } catch (error) {

    }

    res.status(200).json(spotData)
}

exports.timeStamapToMCDate = (ts) => {

    let rawDate = new Date(ts)
    let fullYear = rawDate.getFullYear()
    let month = parseInt(rawDate.getMonth()) + 1;
    let date = parseInt(rawDate.getDate())

    month = (month < 10) ? `0${month}` : month;
    date = (date < 10) ? `0${date}` : date;

    const mcDate = `${fullYear}-${month}-${date}`

    return mcDate

}


exports.search = async (req, res) => {

    const scripCode = req.params.script.toLowerCase();
    const jsonData = await searchSpot(scripCode)

    res.status(200).json(jsonData)
}

exports.getSpotData = async (req, res) => {

    const code = req.params.script.toUpperCase();

    const scripCode = await searchSpot(code)
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


exports.getWatchLists = async (req, res) => {

    const uname = req.headers.uname
    const watchList = await this.kvRead('watchlists')
    res.status(200).json(watchList[uname])

}

exports.addToWatchList = async (req, res) => {

    const uname = req.headers.uname
    const updatedWatchList = req.body.watchList || null

    const allWatchLists = await this.kvRead('watchlists')



    // var config = {
    //     method: 'post',
    //     url: `${process.env.KV_REST_API_URL}/pipeline`,
    //     headers: {
    //         "Authorization": process.env.KV_REST_API_TOKEN,
    //         "Content-Type": "application/json"
    //     },
    //     data: [
    //         ['SET', 'watchlists', JSON.stringify(
    //             {
    //                 [userName]: updatedWatchList
    //             }
    //         )]
    //     ]
    // };

    // const data = await this.kvWrite(config)

    // res.status(200).json({ data })
    res.status(200).json({})

}

// exports.signIn = async (req, res) => {
//     req.session.logedIn = false
//     let userName = req.body.name || false
//     let password = req.body.passwd || false

//     const userDatas = await this.kvRead("users")
//     try {

//         userDatas.forEach(userData => {
//             if (userData.name == userName) {
//                 if (userData.passwd == password) {
//                     req.session.logedIn = true
//                     req.session.userName = userName
//                 }
//             }
//         })

//         if (req.session.logedIn == true) {
//             res.status(200).json({ "msg": "success" })
//         } else {
//             res.status(200).json({ "msg": "failed" })
//         }

//     } catch (error) {
//         res.status(500).json({ "error": error })
//     }

// }


// exports.signInArduino = async (req, res) => {

//     req.session.logedIn = false;

//     let userName = req.headers.uname || false;
//     let apiKey = req.headers.code || false;

//     console.log(userName, "=>", apiKey)
//     let config = {
//         method: 'get',
//         url: `${process.env.KV_REST_API_URL}/get/users`,
//         headers: {
//             "Authorization": process.env.KV_REST_API_TOKEN,
//             "Content-Type": "application/json"
//         }
//     }

//     try {
//         const data = await axios(config)
//         let userDatas = JSON.parse(data.data.result)

//         userDatas.forEach(userData => {
//             if (userData.name == userName) {
//                 if (userData.apiKey == apiKey) {
//                     req.session.logedIn = true
//                 }
//             }
//         })

//         if (req.session.logedIn == true) {
//             res.status(200).send("Login Successfull")
//         } else {
//             res.status(200).send("Login Failed")
//         }

//     } catch (error) {
//         res.status(500).send("Internal Server Error")
//     }
// }

// exports.signup = async (req, res) => {

//     const userLists = res.locals.userList

//     let userName = req.body.name || false
//     let password = req.body.passwd || false

//     let objData = {
//         "name": userName,
//         "passwd": password,
//         "apiKey": Math.random().toString(36).substring(4) + Math.random().toString(16).substring(6)
//     }

//     userLists.push(objData)


//     var config = {
//         method: 'post',
//         url: `${process.env.KV_REST_API_URL}/pipeline`,
//         headers: {
//             "Authorization": process.env.KV_REST_API_TOKEN,
//             "Content-Type": "application/json"
//         },
//         data: [
//             ['SET', 'users', JSON.stringify(userLists)],
//             ['SET', 'watchlists', JSON.stringify(
//                 {
//                     [userName]: [
//                         { "scripName": "NIFTY", "buyPrice": 1234.56, "epoc": 12344567890 }
//                     ]
//                 }
//             )]
//         ]
//     };

//     const data = await this.kvWrite(config)

//     res.status(200).json({ data })

// }

// exports.signOut = (req, res) => {

//     req.session.logedIn = false
//     req.session.userName = null
//     res.status(200).json({ "msg": "success" })
// }

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

exports.kvRead = async (path) => {

    let config = {
        method: 'get',
        url: `${process.env.KV_REST_API_URL}/get/${path}`,
        headers: {
            "Authorization": process.env.KV_REST_API_TOKEN,
            "Content-Type": "application/json"
        }
    }

    const data = await axios(config)
    let parsedData = JSON.parse(data.data.result)

    return parsedData

}

exports.getExpiryandStrikes = async (req, res) => {

    const code = req.params.scripCode.toUpperCase();
    const scripCode = await searchSpot(code)

    const opType = req.params.opType.toUpperCase();

    const url = `https://appfeeds.moneycontrol.com/jsonapi/fno/overview&format=json&inst_type=options&option_type=${opType}&id=${scripCode}&ExpiryDate=`


    let expiryStrikeLists = []

    const expiryArray = []
    const dataObj = {}

    const response = await axios.get(url)
    const data = response.data.fno_list.item

    data.map(data => expiryArray.push(data.fno_exp))


    dataObj.expiry = [...new Set(expiryArray)];

    dataObj.expiry.forEach(exp => {
        const currentExp = exp

        let expDataObj = {
            "expiry": currentExp, "data": []
        }

        data.forEach(str => {

            if (str.fno_exp == currentExp) {
                let dataObj = {
                    "strike": str.strikeprice,
                    "ltp": str.lastvalue
                }
                expDataObj.data.push(dataObj)
            }

        })

        expiryStrikeLists.push(expDataObj)

    })

    res.status(200).json(expiryStrikeLists)
}

exports.removeDuplicates = (arr) => {
    return [...new Set(arr)];
}
