const express = require('express');

const {
    marketStatus,
    historicalData,
    stockData,
    landingPage
} = require('./routes');

const axios = require("axios").default;
const app = express()


const batchHttpRequest = async (urlParamList) => {

    let finalData = []
    let urlLists = []

    console.log(urlParamList)

    urlParamList.map(data => {
        urlLists.push(`https://appfeeds.moneycontrol.com/jsonapi/fno/overview&format=json&inst_type=options&option_type=${data[1]}&id=NIFTY&ExpiryDate=${data[0]}&strike_price=${data[2]}`)
    })

    console.log(urlLists)

    let allLocations = urlLists.map(town => axios(town));
    let weather = await Promise.all(allLocations);

    weather.map(response => {
        
        console.log(response.config)
        let objData = {
            "expiry": response.data.fno_list.item[0].exp_date.substring(0, 6),
            "strikePrice": parseInt(response.data.fno_list.item[0].strikeprice),
            "ltp": parseFloat(response.data.fno_list.item[0].lastprice),
        }

        console.log(objData)

        finalData.push(objData)
    });

    return finalData

}
// const batchHttpRequest = async (myUrl) => {

//     let finalData = []
//     let allLocations = myUrl.map(town => axios(town));
//     let weather = await Promise.all(allLocations);

//     weather.map(response => {

//         let objData = {
//             "expiry": response.data.fno_list.item[0].exp_date.substring(0, 6),
//             "strikePrice": parseInt(response.data.fno_list.item[0].strikeprice),
//             "ltp": parseFloat(response.data.fno_list.item[0].lastprice),
//         }

//         console.log(objData)

//         finalData.push(objData)
//     });

//     return finalData

// }


const generateUrlList = (lists) => {
    // let urlLists = []
    let urlParamList = []

    let scriptsArrray = lists.split(".")

    scriptsArrray.map(data => {
        let myArrayData = data.split(',')

        let strikeLength = myArrayData[1].length - 2

        myArrayData.splice(1, 0, myArrayData[1].slice(-2)); //CE or PE
        myArrayData.splice(2, 0, parseFloat(myArrayData[2].substring(0, strikeLength)).toFixed(2)); //Strike Price
        myArrayData.splice(3, 0, myArrayData[4].slice(-1)); //Long or
        myArrayData.splice(4, 0, myArrayData[5].substring(0, 1)); // Lot Size
        myArrayData.splice(5, 6)

        urlParamList.push(myArrayData)
    })

    // urlParamList.map(data => {
    //     urlLists.push(`https://appfeeds.moneycontrol.com/jsonapi/fno/overview&format=json&inst_type=options&option_type=${data[1]}&id=NIFTY&ExpiryDate=${data[0]}&strike_price=${data[2]}`)
    // })

    return urlParamList.pop()
}

// const generateUrlList = (lists) => {
//     let urlLists = []
//     let urlParamList = []

//     let scriptsArrray = lists.split(".")

//     scriptsArrray.map(data => {
//         let myArrayData = data.split(',')

//         let strikeLength = myArrayData[1].length - 2

//         myArrayData.splice(1, 0, myArrayData[1].slice(-2)); //CE or PE
//         myArrayData.splice(2, 0, parseFloat(myArrayData[2].substring(0, strikeLength)).toFixed(2)); //Strike Price
//         myArrayData.splice(3, 0, myArrayData[4].slice(-1)); //Long or
//         myArrayData.splice(4, 0, myArrayData[5].substring(0, 1)); // Lot Size
//         myArrayData.splice(5, 6)

//         urlParamList.push(myArrayData)
//     })

//     urlParamList.map(data => {
//         urlLists.push(`https://appfeeds.moneycontrol.com/jsonapi/fno/overview&format=json&inst_type=options&option_type=${data[1]}&id=NIFTY&ExpiryDate=${data[0]}&strike_price=${data[2]}`)
//     })

//     return urlLists
// }


app.get('/:script/:data', async (req, res) => {

    const urlParamList = generateUrlList(req.params.data)
    const jsonData = await batchHttpRequest(urlParamList)

    res.status(200).json({})

    // const urlLists = generateUrlList(req.params.data)
    // const jsonData = await batchHttpRequest(urlLists)
    // res.status(200).json(jsonData)

})

// app.get('/marketStatus', getCookie, marketStatus)
// app.get('/historicalData', getCookie, historicalData)
// app.get('/symbol/:symbol', getCookie, stockData)


const port = process.env.PORT || 3000

app.listen(port, () => console.log(`Server Running at http://localhost:${port}`))
