const express = require('express');
const url = require('url')

const {
    marketStatus,
    historicalData,
    stockData,
    landingPage
} = require('./routes');



const axios = require("axios").default;
const app = express()

let finalDataObj = {}

const batchHttpRequest = async (allUrls) => {

    console.log(allUrls)

    let finalData = []
    let index = 0
    let allRequests = allUrls.map(data => axios(data));
    let allResponses = await Promise.all(allRequests);

    console.log(allResponses.length)
    allResponses.map(response => {

        index++
        let urlParts = url.parse(response.config.url, true)
        let queryData = urlParts.query

        try {
            let objData = {
                "expiry": response.data.fno_list.item[0].exp_date.substring(0, 6),
                "strikePrice": response.data.fno_list.item[0].strikeprice,
                "ltp": response.data.fno_list.item[0].lastprice,
                "mkt_lot": response.data.fno_list.item[0].fno_details.mkt_lot,
                "tr_lot": queryData.tr_lot,
                "tr_type": queryData.tr_type,
                "ce_pe": queryData.ce_pe
            }

            finalData.push(objData)
            finalDataObj.data = finalData

        } catch (error) {
            console.log(error)
            finalDataObj.urlError = `URL -> ${index} Error`;
        }

    });

    return finalDataObj

}

const generateUrlList = (lists, scripCode) => {
    let urlLists = []
    let urlParamList = []
    let index = 0
    finalDataObj = {}

    let scriptsArrray = lists.split(".")

    scriptsArrray.map(data => {

        index++

        try {

            let myArrayData = data.split(',')

            let strikeLength = myArrayData[1].length - 2
            myArrayData.splice(1, 0, myArrayData[1].slice(-2)); //CE or PE
            myArrayData.splice(2, 0, parseFloat(myArrayData[2].substring(0, strikeLength)).toFixed(2)); //Strike Price
            myArrayData.splice(3, 0, myArrayData[4].slice(-1)); //Long or
            myArrayData.splice(4, 0, myArrayData[5].substring(0, 1)); // Lot Size
            myArrayData.splice(5, 6)

            urlParamList.push(myArrayData)

        } catch (error) {
            console.log(error)
            finalDataObj.stringError = `Query -> ${index} Error`;
        }

    })

    urlParamList.map(data => {
        urlLists.push(`https://appfeeds.moneycontrol.com/jsonapi/fno/overview&format=json&inst_type=options&option_type=${data[1]}&id=${scripCode}&ExpiryDate=${data[0]}&strike_price=${data[2]}?tr_lot=${data[4]}&tr_type=${data[3]}&ce_pe=${data[1]}`)
    })

    return urlLists
}

app.get('/:script/:data', async (req, res) => {

    const urlLists = generateUrlList(req.params.data, req.params.script.toUpperCase())
    const jsonData = await batchHttpRequest(urlLists)
    res.status(200).json(jsonData)

})

// app.get('/marketStatus', getCookie, marketStatus)
// app.get('/historicalData', getCookie, historicalData)
// app.get('/symbol/:symbol', getCookie, stockData)


const port = process.env.PORT || 3000

app.listen(port, () => console.log(`Server Running at http://localhost:${port}`))
