const axios = require("axios").default;
const url = require('url')

let finalDataObj = {}

exports.generateUrlList = (lists, scripCode) => {

    let optUrlLists = []
    let urlParamList = []
    let index = 0
    let indexList = []
    finalDataObj = {}

    try {
        let scriptsArrray = lists.split("&")

        scriptsArrray.map(data => {

            index++

            let myArrayData = data.split(',')

            let strikeLength = myArrayData[1].length - 2
            myArrayData.splice(1, 0, myArrayData[1].slice(-2)); //CE or PE
            myArrayData.splice(2, 0, parseFloat(myArrayData[2].substring(0, strikeLength)).toFixed(2)); //Strike Price
            myArrayData.splice(3, 0, myArrayData[4]); //Long or
            // myArrayData.splice(3, 0, myArrayData[4].slice(-1)); //Long or
            // myArrayData.splice(4, 0, myArrayData[5].substring(0, 1)); // Lot Size
            myArrayData.splice(4, 6)

            urlParamList.push(myArrayData)
        })

    } catch (error) {
        console.log(error)
        indexList.push(index)
        finalDataObj.stringError = `Query -> ${indexList.join()} Error`;
    }


    urlParamList.map(data => {
        optUrlLists.push(`https://appfeeds.moneycontrol.com/jsonapi/fno/overview&format=json&inst_type=options&option_type=${data[1]}&id=${scripCode}&ExpiryDate=${data[0]}&strike_price=${data[2]}?tr_lot=${data[3]}&ce_pe=${data[1]}`)
    })

    return optUrlLists

}

exports.makeOptDataObject = (response, queryData) => {
    let objData = {
        "expiry": response.data.fno_list.item[0].exp_date.substring(0, 6),
        "strikePrice": new String(parseInt(response.data.fno_list.item[0].strikeprice)),
        "ltp": response.data.fno_list.item[0].lastprice,
        "tr_lot": queryData.tr_lot,
        "tr_type": queryData.tr_type,
        "ce_pe": queryData.ce_pe
    }

    return objData
}

exports.batchHttpRequest = async (allUrls, scripCode) => {

    let finalData = []
    let index = 0
    let indexList = []

    const spotDataObj = await this.fetchSpotData(scripCode)

    finalDataObj.scriptName = spotDataObj.spotName
    finalDataObj.spotPrice = spotDataObj.spotPrice;
    finalDataObj.spotChng = spotDataObj.spotChng;
    finalDataObj.spotChngPct = spotDataObj.spotChngPct

    let allOptRequests = allUrls.map(data => axios(data));
    let allOptResponses = await Promise.all(allOptRequests);

    allOptResponses.map(response => {

        index++
        let urlParts = url.parse(response.config.url, true)
        let queryData = urlParts.query

        try {

            finalData.push(this.makeOptDataObject(response, queryData))
            finalDataObj.mktLot = response.data.fno_list.item[0].fno_details.mkt_lot;
            finalDataObj.optData = finalData;

        } catch (error) {
            console.log(error)
            indexList.push(index)
            finalDataObj.urlError = `URL -> ${indexList.join()} Error`;
        }

    });

    finalDataObj.futData = await this.fetchFutData(scripCode)

    return finalDataObj

}

exports.fetchFutData = async (scripCode) => {

    const futUrl = `https://appfeeds.moneycontrol.com/jsonapi/fno/overview&format=json&inst_type=Futures&id=${scripCode}`
    futArrayData = []

    let allFutRequests = await axios.get(futUrl);

    allFutRequests.data.fno_list.item.map(data => {

        let objData = {
            "futExpiry": data.expiry_date_d.substring(0, 6),
            "futLtp": data.lastprice
        }

        futArrayData.push(objData)
    })

    return futArrayData

}

exports.fetchSpotData = async (param) => {

    let baseUrl
    let objData = {}
    let scripCode = param.toUpperCase()

    if (scripCode == "NIFTY") {
        baseUrl = "https://priceapi.moneycontrol.com/pricefeed/notapplicable/inidicesindia/in%3BNSX";
    } else if (scripCode == "BANKNIFTY") {
        baseUrl = "https://priceapi.moneycontrol.com/pricefeed/notapplicable/inidicesindia/in%3Bnbx";
    } else if (scripCode == "USDINR") {
        baseUrl = "https://api.moneycontrol.com/mcapi/v1/us-markets/getCurrencies";
    } else {
        baseUrl = "https://priceapi.moneycontrol.com/pricefeed/nse/equitycash/" + scripCode;
    }


    let soptDataRequest = await axios.get(baseUrl);
    try {
        objData = {
            "spotName": soptDataRequest.data.data.company || "Not Found",
            "spotPrice": soptDataRequest.data.data.pricecurrent || null,
            "spotChng": soptDataRequest.data.data.pricechange || null,
            "spotChngPct": soptDataRequest.data.data.pricepercentchange || null,
            "dayHigh": soptDataRequest.data.data.HP || soptDataRequest.data.data.HIGH,
            "dayLow": soptDataRequest.data.data.LP || soptDataRequest.data.data.LOW,
        }

        if (soptDataRequest.data.data.decl) {
            objData.decl = new String(soptDataRequest.data.data.decl)
            objData.adv = new String(soptDataRequest.data.data.adv)
        }


    } catch (error) {
        console.log(error)
    }

    return objData

}

exports.searchSpot = async (param) => {
    const url = `https://www.moneycontrol.com/mccode/common/autosuggestion_solr.php?query=${param}&type=0&format=json`

    let searchData = await axios.get(url)

    return searchData.data[0].sc_id
}

exports.sendHttpRequest = (req, res, url) => {

    var config = {
        method: 'get',
        url: url,
        headers: {
            'Content-Type': 'application/json',
            // 'cookie': res.locals.myCookie || ""
        },
    };

    axios(config)
        .then(response => { res.status(200).json(response.data) })
        .catch(error => res.status(501).json(error));
}

