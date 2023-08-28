const axios = require("axios").default;
const url = require('url')
const { exceptionsScripCode, monthsName } = require('./constants');

let finalDataObj = {}


// APPFEEDS
// exports.generateUrlList = (lists, scripCode) => {

//     let optUrlLists = []
//     let urlParamList = []
//     let index = 0
//     let indexList = []
//     finalDataObj = {}


//     let scriptsArrray = lists.split("&")

//     scriptsArrray.map(data => {

//         index++

//         let myArrayData = data.split(',')
//         try {

//             let strikeLength = myArrayData[1].length - 2
//             myArrayData.splice(1, 0, myArrayData[1].slice(-2)); //CE or PE
//             myArrayData.splice(2, 0, parseFloat(myArrayData[2].substring(0, strikeLength)).toFixed(2)); //Strike Price
//             myArrayData.splice(3, 0, myArrayData[4]); //Long or
//             myArrayData.splice(4, 6)
//         } catch (error) {
//             console.log(error)
//             indexList.push(index)
//             finalDataObj.stringError = `Query -> ${indexList.join()} Error`;
//         }

//         urlParamList.push(myArrayData)

//     })


//     urlParamList.map(data => {
//         optUrlLists.push(`https://appfeeds.moneycontrol.com/jsonapi/fno/overview&format=json&inst_type=options&option_type=${data[1]}&id=${scripCode}&ExpiryDate=${data[0]}&strike_price=${data[2]}?tr_lot=${data[3]}&ce_pe=${data[1]}`)
//     })

//     return optUrlLists

// }

// Price API

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
            myArrayData.splice(3, 5)
        } catch (error) {
            console.log(error)
            indexList.push(index)
            finalDataObj.stringError = `Query -> ${indexList.join()} Error`;
        }

        urlParamList.push(myArrayData)

    })


    // console.log(urlParamList)


    urlParamList.map(data => {
        if (exceptionsScripCode.includes(scripCode)) {
            optUrlLists.push(`https://priceapi.moneycontrol.com/pricefeed/notapplicable/indicesoption/${scripCode}?expiry=${data[0]}&optionType=${data[1]}&strikePrice=${data[2]}`)
        } else {
            optUrlLists.push(`https://priceapi.moneycontrol.com/pricefeed/nse/equityoption/${scripCode}?expiry=${data[0]}&optionType=${data[1]}&strikePrice=${data[2]}`)
        }
    })

    // console.log(optUrlLists)

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

    finalDataObj.futData = await this.fetchFutData(scripCode)

    // fOR appfeedS
    // finalDataObj.optData = await this.fetchOptData(allUrls)


    const allOptionData = await this.multipleApiCalls(allUrls)


    // ============ Remove for Appfeeds
    optDataArray = []

    allOptionData.forEach(res => {

        try {
            const data = res.data
            let objData = {
                "expiry": data.expirydate,
                "strikePrice": data.Strike_Price,
                "ltp": data.pricecurrent,
                "ce_pe": data.opttype
            }

            optDataArray.push(objData)


        } catch (err) {
            console.log(err)
        }

    })


    finalDataObj.optData = optDataArray
    // ==============Remove for Appfeeds




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

    // console.log(futUrl)
    let futData = await axios.get(futUrl);
    let objData = {}

    // console.log("==>  ", futData.data)

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
    const nseId = (soptDataRequest.data.data.NSEID) || scripCode;
    try {
        objData = {
            "spotName": soptDataRequest.data.data.company,
            "spotPrice": soptDataRequest.data.data.pricecurrent,
            "spotChng": parseFloat(soptDataRequest.data.data.pricechange).toFixed(2),
            "spotChngPct": parseFloat(soptDataRequest.data.data.pricepercentchange).toFixed(2),
            "mktStatus": soptDataRequest.data.data.market_state,
            "dayHigh": soptDataRequest.data.data.HP || soptDataRequest.data.data.HIGH,
            "dayLow": soptDataRequest.data.data.LP || soptDataRequest.data.data.LOW,
            "MCID": scripCode,
            "spotNseID": nseId
        }

        if (soptDataRequest.data.data.MKT_LOT) objData.mktLot = soptDataRequest.data.data.MKT_LOT
        if (soptDataRequest.data.data.decl) {
            objData.decl = (soptDataRequest.data.data.decl).toString()
            objData.adv = (soptDataRequest.data.data.adv).toString()
        }

        // console.log(objData)


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
        } else if (scripCode == "NASDAQ") {
            spotUrls.push("https://priceapi.moneycontrol.com/pricefeed/usMarket/index/CCMP:IND");
        }
        else if (scripCode == "USDINR") {
            spotUrls.push("https://api.moneycontrol.com/mcapi/v1/us-markets/getCurrencies?source=webCurrency&currency=USDINR");
        } else {
            spotUrls.push("https://priceapi.moneycontrol.com/pricefeed/nse/equitycash/" + scripCode);
        }
    })


    let allOptSpotResponses = await this.multipleApiCalls(spotUrls)


    allOptSpotResponses.map(response => {

        if (!Array.isArray(response.data)) {

            const data = response.data
            if (data != null) {
                let dataObj = {
                    spotName: data.company || data.name,
                    nseId: data.NSEID || data.company,
                    open: data.OPN || data.OPEN || data.open.replace(",", ""),
                    cmp: data.pricecurrent || data.current_price.replace(",", ""),
                    dayHigh: data.HIGH || data.HP || data.high.replace(",", ""),
                    dayLow: data.LOW || data.LP || data.low.replace(",", ""),
                    prevClose: data.priceprevclose || data.prev_close.replace(",", ""),
                    spotChng: data.net_change || (parseFloat(data.pricechange).toFixed(2)),
                    spotChngPct: (data.percent_change || parseFloat(data.pricepercentchange).toFixed(2)),
                    adv: (data.adv) ? data.adv.toString() : "0",
                    decl: (data.decl) ? data.decl.toString() : "0"
                };

                // (data.adv) ? dataObj.adv = data.adv.toString() : "0";
                // (data.decl) ? dataObj.decl = data.decl.toString() : "0";

                datas.push(dataObj)
            }

        } else {
            // console.log(response)
            const data = response.data[0]
            let dataObj = {
                spotName: data.name,
                open: parseFloat(data.open).toFixed(2),
                dayHigh: parseFloat(data.high).toFixed(2),
                dayLow: parseFloat(data.low).toFixed(2),
                cmp: parseFloat(data.ltp).toFixed(3),
                prevClose: parseFloat(data.prevclose).toFixed(2),
                spotChng: parseFloat(data.chg).toFixed(2),
                spotChngPct: parseFloat(data.chgper).toFixed(2)
            };

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


exports.getStratagryData = async (dataSnap) => {

    const strategies = dataSnap.strategies.data
    const spotName = dataSnap.strategies.spotName
    const MCID = dataSnap.strategies.MCID
    const ULAsset = dataSnap.strategies.nseId
    const dispMode = dataSnap.dispMode

    // strategies,
    //     dataSnap.strategies.spotName,
    //     dataSnap.strategies.MCID, dataSnap.strategies.nseId, dispMode

    let optUrlArrs = [];
    let spotUrlArrs = [];
    let futUrlArrs = [];


    strategies.map(strategy => {
        if (strategy.instrumentType.toUpperCase() == "OPTION") {
            if (exceptionsScripCode.includes(spotName)) {
                optUrlArrs.push(`https://priceapi.moneycontrol.com/pricefeed/notapplicable/indicesoption/${MCID}?expiry=${strategy.expiry}&optionType=${strategy.opType}&strikePrice=${strategy.strike.toFixed(2)}`)
            } else {
                optUrlArrs.push(`https://priceapi.moneycontrol.com/pricefeed/nse/equityoption/${MCID}?expiry=${strategy.expiry}&optionType=${strategy.opType}&strikePrice=${strategy.strike.toFixed(2)}`)
            }
        }
    })

    console.log(optUrlArrs)

    const allOptionData = await this.multipleApiCalls(optUrlArrs)

    let opCurrentStat = []
    allOptionData.forEach(data => {
        // console.log(data)

        let dataObj = {
            slug: this.dateToMcSlug(data.data.sc_id || data.data.Symbol,
                data.data.expirydate,
                parseInt(data.data.Strike_Price),
                data.data.opttype),
            cmp: data.data.pricecurrent
        }

        opCurrentStat.push(dataObj)
    })


    let optStrData = []
    let optStrDataObj = {}
    let totalPnl = 0

    // console.log("==>", opCurrentStat);

    opCurrentStat.forEach(strategy => {

        strategies.forEach(str => {

            // console.log(strategy.slug, "<==>", str.slug)
            if (strategy.slug == str.slug) {

                let rawSlug = strategy.slug.replace(ULAsset, "")

                let Pnl = this.calcPnL(str.instrumentType, str.ltp, strategy.cmp, str.direction, str.lotQty, str.lotSize)
                totalPnl += parseFloat(Pnl)
                let objData = {
                    slug: rawSlug.slice(0, 7) + " " + rawSlug.slice(7),
                    cmp: strategy.cmp,
                    lotQty: ((str.direction == "LONG") ? "+" : "-") + str.lotQty.toString(),
                    pnl: parseInt(Pnl).toString()
                }

                optStrData.push(objData)

            }

        })

    })

    // console.log(optStrData)

    const spotRes = await this.filterSpotIds([ULAsset])

    optStrDataObj.dispMode = dispMode
    optStrDataObj.data = optStrData
    optStrDataObj.spotName = dataSnap.strategies.spotName
    optStrDataObj.cmp = spotRes[0].cmp
    optStrDataObj.chng = parseFloat(spotRes[0].spotChng).toString()
    optStrDataObj.chngPct = parseFloat(spotRes[0].spotChngPct).toFixed(2) + ' %'
    optStrDataObj.ttlPNL = totalPnl.toString()


    // console.log(optStrDataObj)

    return optStrDataObj
}



exports.dateToMcSlug = (symbol, expiry, strike, type) => {

    let d = new Date(expiry)
    let mcDatString = `${d.getDate()}${monthsName[d.getMonth()]}${d.getFullYear().toString().substring(2)}`

    return symbol + mcDatString + strike + type

}


exports.calcPnL = (insType, __ltp, __cmp, __direction, __lotQty, __lotSize) => {

    let cmp = parseFloat(__cmp);
    let ltp = parseFloat(__ltp)
    let lotQty = parseInt(__lotQty)
    let lotSize = parseInt(__lotSize) || 0

    let pnl = 0;

    if (insType == "OPTION") {

        pnl = (__direction == "LONG")
            ? ((cmp - ltp) * lotSize * lotQty).toFixed(2)
            : ((ltp - cmp) * lotSize * lotQty).toFixed(2)

    } else if (insType == "SPOT") {

        pnl = (__direction == "LONG")
            ? ((cmp - ltp) * lotQty).toFixed(2)
            : ((ltp - cmp) * lotQty).toFixed(2)

    }

    return pnl
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
