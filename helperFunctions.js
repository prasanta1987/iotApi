const axios = require("axios").default;
const url = require('url')

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

    const vixData = await this.fetchSpotData("INDVIX")

    finalDataObj.vixCmp = vixData.spotPrice
    finalDataObj.vixChng = vixData.spotChng
    finalDataObj.vixPerChng = vixData.spotChngPct


    // const optDataObj = await this.fetchOptData(allUrls);

    // optDataObj.map(response => {
    //     let urlParts = url.parse(response.config.url, true)
    //     let queryData = urlParts.query


    //     try {

    //         let objData = {
    //             "expiry": response.data.fno_list.item[0].exp_date.substring(0, 6),
    //             "strikePrice": parseInt(response.data.fno_list.item[0].strikeprice).toString(),
    //             "ltp": response.data.fno_list.item[0].lastprice,
    //             "tr_lot": queryData.tr_lot,
    //             "ce_pe": queryData.ce_pe
    //         }

    //         finalData.push(objData)
    //         finalDataObj.mktLot = response.data.fno_list.item[0].fno_details.mkt_lot;

    //     } catch (error) {
    //         console.log("ERROR = >", error)
    //         indexList.push(index)
    //         finalDataObj.urlError = `URL -> ${indexList.join()} Error`;
    //     }


    // })

    // finalDataObj.optData = finalData


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
            "dayHigh": soptDataRequest.data.data.HP || soptDataRequest.data.data.HIGH,
            "dayLow": soptDataRequest.data.data.LP || soptDataRequest.data.data.LOW,
        }

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

    let searchDataObj = {}
    let dataArray = []

    const url = `https://www.moneycontrol.com/mccode/common/autosuggestion_solr.php?query=${param}&type=0&format=json`

    let searchData = await axios.get(url)

    searchData.data.map(data => {

        console.log(data)
        let objData = {
            "id": data.sc_id,
            "Name": data.stock_name
        }

        dataArray.push(objData)
    })
    searchDataObj.searchResult = dataArray

    return searchDataObj
}

exports.allCE = async (param) => {

    console.log(param)
    const CEUrl = `https://appfeeds.moneycontrol.com/jsonapi/fno/overview&format=json&inst_type=options&option_type=CE&id=${param}&ExpiryDate=`
    const PEUrl = `https://appfeeds.moneycontrol.com/jsonapi/fno/overview&format=json&inst_type=options&option_type=PE&id=${param}&ExpiryDate=`

    let allCEData = await this.allptionsData(CEUrl)
    let allPEData = await this.allptionsData(PEUrl)

    // console.log(allCEData)

    return allCEData

}


exports.allptionsData = async (url) => {

    let finalDataArray = []
    let finalDataObj = {}
    let dataObj = {}

    let response = await axios.get(url);
    let rawData = response.data.fno_list.item

    rawData.map(data => {
        let dataObj = {
            "expiry": data.fno_exp,
            "strike": data.strikeprice,
            "ltp": data.lastvalue
        }
        finalDataArray.push(dataObj)
    })
    console.log(finalDataArray)
    finalDataObj.all = finalDataArray

    return finalDataObj

}


exports.batchOptFetch = async () => {
    let finalObj = {}
    let dataArr = []

    const optionType = ["CE", "PE"]
    const strikeArr = ["16650.00", "16700.00", "16750.00", "16800.00", "16850.00", "16900.00", "16950.00", "17000.00", "17050.00", "17100.00", "17150.00", "17200.00", "17250.00", "17300.00", "17350.00", "17400.00", "17450.00", "17500.00", "17550.00", "17600.00", "17650.00", "17700.00", "17750.00", "17800.00", "17850.00", "17900.00", "17950.00", "18000.00", "18050.00", "18100.00", "18150.00", "18200.00", "18250.00", "18300.00", "18350.00", "18400.00", "18450.00", "18500.00", "18550.00", "18600.00", "18650.00", "18700.00", "18750.00", "18800.00", "18850.00", "18900.00", "18950.00", "19000.00", "19050.00", "19100.00", "19150.00", "19200.00", "19250.00", "19300.00", "19350.00", "19400.00", "19450.00", "19500.00", "19550.00", "19600.00", "19650.00", "19700.00", "19750.00", "19800.00", "19850.00", "19900.00", "19950.00", "20000.00", "20050.00", "20100.00", "20150.00", "20200.00", "20250.00"]
    // const expiries = ["2023-06-22", "2023-06-29"]
    const expiries = ["2023-06-22", "2023-06-29", "2023-07-06", "2023-07-13", "2023-07-20", "2023-07-27", "2023-08-31"]

    const baseUrls = []
    optionType.map(cepe => {
        expiries.map(exp => {
            strikeArr.map(strike => {
                let url = `https://priceapi.moneycontrol.com/pricefeed/notapplicable/indicesoption/NIFTY?expiry=${exp}&optionType=${cepe}&strikePrice=${strike}`
                baseUrls.push(url)
            })
        })
    })

    // console.log(baseUrls)

    let allOptRequests = await baseUrls.map(data => axios(data));
    let allOptResponses = await Promise.all(allOptRequests);

    allOptResponses.map(data => {

        try {
            let objData = {
                "strike": data.data.data.Strike_Price,
                "opType": data.data.data.opttype,
                "expiry": data.data.data.expirydate,
                "OpenInt": data.data.data.OpenInt,
                "ltp": data.data.data.pricecurrent,
            }
            dataArr.push(objData)
        } catch (error) {
            console.log(error)
        }

    })

    finalObj.allData = dataArr
    // console.log(finalObj)
    return finalObj

}
