const axios = require("axios").default;
const url = require('url')
const { exceptionsScripCode } = require('./constants');

let finalDataObj = {}

exports.generateUrlList = (lists, scripCode) => {

    let optUrlLists = []
    let urlParamList = []
    let index = 0
    let indexList = []
    finalDataObj = {}


    let scriptsArrray = lists.split("&")

    scriptsArrray.map(data => {

        index++

        let myArrayData = data.split(',')
        try {

            let strikeLength = myArrayData[1].length - 2
            myArrayData.splice(1, 0, myArrayData[1].slice(-2)); //CE or PE
            myArrayData.splice(2, 0, parseFloat(myArrayData[2].substring(0, strikeLength)).toFixed(2)); //Strike Price
            myArrayData.splice(3, 0, myArrayData[4]); //Long or
            // myArrayData.splice(3, 0, myArrayData[4].slice(-1)); //Long or
            // myArrayData.splice(4, 0, myArrayData[5].substring(0, 1)); // Lot Size
            myArrayData.splice(4, 6)
        } catch (error) {
            console.log(error)
            indexList.push(index)
            finalDataObj.stringError = `Query -> ${indexList.join()} Error`;
        }

        urlParamList.push(myArrayData)

    })


    urlParamList.map(data => {
        optUrlLists.push(`https://appfeeds.moneycontrol.com/jsonapi/fno/overview&format=json&inst_type=options&option_type=${data[1]}&id=${scripCode}&ExpiryDate=${data[0]}&strike_price=${data[2]}?tr_lot=${data[3]}&ce_pe=${data[1]}`)
    })

    return optUrlLists

}

exports.batchHttpRequest = async (allUrls, scripCode) => {

    let finalData = []

    const spotDataObj = await this.fetchSpotData(scripCode)

    finalDataObj.scriptName = spotDataObj.spotName
    finalDataObj.spotPrice = spotDataObj.spotPrice;
    finalDataObj.spotChng = spotDataObj.spotChng;
    finalDataObj.spotChngPct = spotDataObj.spotChngPct
    finalDataObj.spotHigh = spotDataObj.dayHigh
    finalDataObj.spotLow = spotDataObj.dayLow
    if (spotDataObj.adv) {
        finalDataObj.adv = spotDataObj.adv
        finalDataObj.decl = spotDataObj.decl
    }

    const vixData = await this.fetchSpotData("INDVIX")

    finalDataObj.vixCmp = vixData.spotPrice
    finalDataObj.vixChng = vixData.spotChng
    finalDataObj.vixPerChng = vixData.spotChngPct
    finalDataObj.vixDayHigh = vixData.dayHigh
    finalDataObj.vixDayLow = vixData.dayLow

    finalDataObj.optData = await this.fetchOptData(allUrls)
    finalDataObj.futData = await this.fetchFutData(scripCode)



    return finalDataObj

}

exports.fetchOptData = async (allUrls) => {

    let index = 0
    let indexList = []
    let finalData = []

    let allOptRequests = await allUrls.map(data => axios(data));
    let allOptResponses = await Promise.all(allOptRequests);

    allOptResponses.map(response => {

        index++
        let urlParts = url.parse(response.config.url, true)
        let queryData = urlParts.query

        try {

            let objData = {
                "expiry": response.data.fno_list.item[0].exp_date.substring(0, 6),
                "strikePrice": new String(parseInt(response.data.fno_list.item[0].strikeprice)),
                "ltp": response.data.fno_list.item[0].lastprice,
                "tr_lot": queryData.tr_lot,
                "tr_type": queryData.tr_type,
                "ce_pe": queryData.ce_pe
            }

            finalData.push(objData)

            finalDataObj.mktLot = response.data.fno_list.item[0].fno_details.mkt_lot;

        } catch (error) {
            console.log(error)
            indexList.push(index)
            finalDataObj.urlError = `URL -> ${indexList.join()} Error`;
        }

    });

    return finalData
}

exports.fetchFutData = async (scripCode) => {

    const futUrl = `https://appfeeds.moneycontrol.com/jsonapi/fno/overview&format=json&inst_type=Futures&id=${scripCode}`
    futArrayData = []

    let allFutRequests = await axios.get(futUrl);

    allFutRequests.data.fno_list.item.map(data => {

        let objData = {
            "futExpiry": data.expiry_date_d.substring(0, 6),
            "futLtp": data.lastprice,
            "futChange": data.change
        }

        futArrayData.push(objData)
    })

    return futArrayData

}

exports.getMarketLot = async (scripCode, exp) => {

    const futUrl = `https://priceapi.moneycontrol.com/pricefeed/notapplicable/indicesfuture/${scripCode}?expiry=${exp}`

    let futData = await axios.get(futUrl);
    let objData = {}

    if (futData.data.data.MarketLot) objData.mktLot = futData.data.data.MarketLot;

    return objData

}

exports.fetchSpotData = async (param) => {

    let baseUrl
    let objData = {}
    let scripCode = param.toUpperCase()

    if (scripCode == "NIFTY" || scripCode == "NIFTY 50") {
        baseUrl = "https://priceapi.moneycontrol.com/pricefeed/notapplicable/inidicesindia/in%3BNSX";
    } else if (scripCode == "BANKNIFTY" || scripCode == "BANK NIFTY") {
        baseUrl = "https://priceapi.moneycontrol.com/pricefeed/notapplicable/inidicesindia/in%3Bnbx";
    } else if (scripCode == "INDVIX") {
        baseUrl = "https://priceapi.moneycontrol.com/pricefeed/notapplicable/inidicesindia/in%3BIDXN";
    } else {
        baseUrl = "https://priceapi.moneycontrol.com/pricefeed/nse/equitycash/" + scripCode;

    }

    let soptDataRequest = await axios.get(baseUrl);

    try {
        objData = {
            "spotName": soptDataRequest.data.data.company,
            "spotPrice": soptDataRequest.data.data.pricecurrent,
            "spotChng": soptDataRequest.data.data.pricechange,
            "spotChngPct": soptDataRequest.data.data.pricepercentchange,
            "mktStatus": soptDataRequest.data.data.market_state,
            "dayHigh": soptDataRequest.data.data.HP || soptDataRequest.data.data.HIGH,
            "dayLow": soptDataRequest.data.data.LP || soptDataRequest.data.data.LOW,
            "MCID": scripCode
        }

        if (soptDataRequest.data.data.MKT_LOT) objData.mktLot = soptDataRequest.data.data.MKT_LOT
        if (soptDataRequest.data.data.decl) {
            objData.decl = new String(soptDataRequest.data.data.decl)
            objData.adv = new String(soptDataRequest.data.data.adv)
        }


    } catch (error) {
        console.log(error)
        objData.ERROR = "Not Found"
    }

    return objData

}


exports.searchSpot = async (param) => {

    param = param.toUpperCase()

    if (param == "NIFTY") {
        return "NIFTY"
    } else if (param == "BANKNIFTY") {
        return "BANKNIFTY"
    } else if (param == "INDVIX") {
        return "INDVIX"
    } else {
        const url = `https://www.moneycontrol.com/mccode/common/autosuggestion_solr.php?query=${param}&type=0&format=json`
        let searchData = await axios.get(url)
        let searchRes = searchData.data[0].sc_id
        return searchRes
    }


}




// for Batch SPOT Data cum Search 
exports.filterSpotIds = async (spotList) => {

    spotMcIdsUrls = []
    spotList.forEach(spotName => {

        if (exceptionsScripCode.includes(spotName)) {
            spotMcIdsUrls.push(spotName)
        } else {
            let data = this.genUrlList(spotName)
            spotMcIdsUrls.push(data)
        }
    })


    let spotMcIds = []
    let filteredUrls = []

    spotMcIdsUrls.forEach(url => {
        if (!exceptionsScripCode.includes(url)) {
            filteredUrls.push(url)
        } else {
            spotMcIds.push(url)
        }
    })

    let allMcIdsResponse = await this.multipleApiCalls(filteredUrls)
    allMcIdsResponse.map(response => spotMcIds.push(response[0].sc_id))


    let spotUrls = []
    let datas = []

    spotMcIds.forEach(scripCode => {
        if (scripCode == "NIFTY" || scripCode == "NIFTY 50") {
            spotUrls.push("https://priceapi.moneycontrol.com/pricefeed/notapplicable/inidicesindia/in%3BNSX");
        } else if (scripCode == "BANKNIFTY" || scripCode == "BANK NIFTY") {
            spotUrls.push("https://priceapi.moneycontrol.com/pricefeed/notapplicable/inidicesindia/in%3Bnbx");
        } else if (scripCode == "INDVIX") {
            spotUrls.push("https://priceapi.moneycontrol.com/pricefeed/notapplicable/inidicesindia/in%3BIDXN");
        } else {
            spotUrls.push("https://priceapi.moneycontrol.com/pricefeed/nse/equitycash/" + scripCode);
        }
    })


    let allOptSpotResponses = await this.multipleApiCalls(spotUrls)


    allOptSpotResponses.map(response => {
        const data = response.data

        if (data != null) {
            let dataObj = {
                spotName: data.company,
                nseId: data.NSEID || data.company,
                open: data.OPN || data.OPEN,
                cmp: data.pricecurrent,
                dayHigh: data.HIGH || data.HP,
                dayLow: data.LOW || data.LP,
                prevClose: data.priceprevclose,
                spotChng: data.pricechange,
                spotChngPct: data.pricepercentchange,
                adv: data.adv,
                decl: data.decl
            }

            datas.push(dataObj)
        }

    })

    return datas

}

exports.genUrlList = (param) => {

    param = param.toUpperCase()

    if (param == "NIFTY") {
        return "NIFTY"
    } else if (param == "BANKNIFTY") {
        return "BANKNIFTY"
    } else if (param == "INDVIX") {
        return "INDVIX"
    } else {
        return `https://www.moneycontrol.com/mccode/common/autosuggestion_solr.php?query=${param}&type=0&format=json`
    }
}


exports.multipleApiCalls = async (allUrls) => {

    let allData = []
    let allRequests = await allUrls.map(data => axios(data));
    let allResponses = await Promise.all(allRequests);

    allResponses.forEach(data => allData.push(data.data))
    return allData

}

// exports.searchSpot = async (param) => {

//     param = param.toUpperCase()

//     if (param == "NIFTY") {
//         return "NIFTY"
//     } else if (param == "BANK NIFTY") {
//         return "BANK NIFTY"
//     } else if (param == "INDVIX") {
//         return "INDVIX"
//     } else {
//         let searchDataObj = {}
//         let dataArray = []

//         const url = `https://www.moneycontrol.com/mccode/common/autosuggestion_solr.php?query=${param}&type=0&format=json`

//         let searchData = await axios.get(url)

//         searchData.data.map(data => {

//             let objData = {
//                 "id": data.sc_id,
//                 "Name": data.stock_name
//             }

//             dataArray.push(objData)
//         })
//         searchDataObj.searchResult = dataArray

//         return searchDataObj
//     }


// }
