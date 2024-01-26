const axios = require("axios").default;

const { generateUrlList, batchHttpRequest,
    searchSpot, fetchSpotData, fetchFutData,
    getMarketLot, batchStockData, dataUrl, getMCIds,
    multipleApiCalls, searchMCIds } = require('./helperFunctions');

const { structuredSpotData,
    structuredCurrencyData } = require('./constants');

const auth = require('./firebaseFunctions')

exports.singleSpotData = async (req, res) => {
    const spotList = req.params.scripts.toUpperCase().split(",")[0]
    const functions = req.query.data

    let datas = []

    let spotMcIds = await getMCIds(spotList)
    let spotUrls = dataUrl(spotMcIds)

    let allOptSpotResponses = await multipleApiCalls(spotUrls)

    allOptSpotResponses.map(response => {

        if (!Array.isArray(response.data)) {
            if (response.data != null) datas.push(structuredSpotData(response.data, functions))
        } else {
            datas.push(structuredCurrencyData(response.data[0]))
        }

    })


    res.send(datas.pop())

}

exports.batchSpotData = async (req, res) => {

    const spotList = req.params.scripts

    let datas = []

    let spotMcIds = await getMCIds(spotList)
    let spotUrls = dataUrl(spotMcIds)

    let allOptSpotResponses = await multipleApiCalls(spotUrls)

    allOptSpotResponses.map(response => {

        if (!Array.isArray(response.data)) {
            if (response.data != null) datas.push(structuredSpotData(response.data))
        } else {
            datas.push(structuredCurrencyData(response.data[0]))
        }

    })


    res.send(datas)

}

exports.getTechnicalData = async (req, res) => {

    let scripCode = req.params.scripts.toUpperCase()

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
        arrayData.push(data.data)
    })

    objData.min5data = arrayData[0]
    objData.min15data = arrayData[1]
    objData.min60data = arrayData[2]
    objData.dailydata = arrayData[3]



    let allData = []

    let spotMcIds = await getMCIds(scripCode)
    let spotUrls = dataUrl(spotMcIds)

    let allOptSpotResponses = await multipleApiCalls(spotUrls)

    allOptSpotResponses.map(response => {

        if (!Array.isArray(response.data)) {
            if (response.data != null) allData.push(structuredSpotData(response.data))
        } else {
            allData.push(structuredCurrencyData(response.data[0]))
        }

    })

    objData.spotdata = allData[0]

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
        if (parseFloat(spotData[x]) && x != "futExpiry") spotData[x] = parseFloat(spotData[x])
    })

    let futExpDate = this.timeStamapToMCDate((new Date(`${spotData.futExpiry} ${new Date().getFullYear()}`)).getTime())

    try {
        const mktData = await getMarketLot(scripCode, futExpDate)
        // consol.log(mktData)
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



exports.mktSnapShot = async (req, res) => {

    const response = await axios.get('https://webapi.niftytrader.in/webapi/symbol/top-gainers-data')
    delete response.data.result
    delete response.data.resultMessage

    res.status(200).json(response.data)
}

exports.getOptionsChain = async (req, res) => {

    const scriptCode = req.params.scriptCode.toLowerCase() || "nifty";
    const expDate = req.params.expDate || '';
    const response = await axios.get(`https://webapi.niftytrader.in/webapi/option/fatch-option-chain?symbol=${scriptCode}&expiryDate=${expDate}`)

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
