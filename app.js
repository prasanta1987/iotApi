const express = require('express');

const {
    marketStatus,
    historicalData,
    stockData,
    landingPage
} = require('./routes');

const axios = require("axios").default;
const app = express()





// const locations = ['London', 'San Francisco', 'Tokyo', 'Berlin'];
// const apiURL = 'http://api.openweathermap.org/data/2.5/weather';
// const token = '0c6ddcd4bf425f7a1ecc76a92d9f9eb9';

let myUrl = [
    'https://appfeeds.moneycontrol.com/jsonapi/fno/overview&format=json&inst_type=options&option_type=CE&id=NIFTY&ExpiryDate=2023-05-18&strike_price=18000.00',
    'https://appfeeds.moneycontrol.com/jsonapi/fno/overview&format=json&inst_type=options&option_type=CE&id=NIFTY&ExpiryDate=2023-05-18&strike_price=17000.00'
]


const batchHttpRequest = async (myUrl) => {

    let finalData = []
    let allLocations = myUrl.map(town => axios(town));
    let weather = await Promise.all(allLocations);

    weather.map(response => {

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


const getHttpRequest = (url) => {

    var config = {
        method: 'get',
        url: url,
        headers: {
            'Content-Type': 'application/json',
        },
    };


    axios(config)
        .then(response => {
            // console.log(response.data.fno_list)

            objData = {
                "expiry": response.data.fno_list.item[0].exp_date.substring(0, 6),
                "strikePrice": parseInt(response.data.fno_list.item[0].strikeprice),
                "ltp": parseFloat(response.data.fno_list.item[0].lastprice),
            }

            console.log(objData)
            finalData.push(objData)

            // console.log(finalData)
        })
        .catch(error => { console.log(error) });
}







const generateUrlList = (lists) => {
    let urlLists = []
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

    urlParamList.map(data => {
        urlLists.push(`https://appfeeds.moneycontrol.com/jsonapi/fno/overview&format=json&inst_type=options&option_type=${data[1]}&id=NIFTY&ExpiryDate=${data[0]}&strike_price=${data[2]}`)
    })

    return urlLists
}






// setInterval(() => urlList.map(data => getHttpRequest(data.url, data.type)), 5000);

// setInterval(() => {
//     console.log(ceRawData)
// }, 2000);




// const getCookie = (req, res, next) => {

//     var config = {
//         method: 'get',
//         url: 'https://www.nseindia.com/',
//     };

//     axios(config)
//         .then(response => {
//             const rawCookie = response.headers["set-cookie"];
//             const formattedCookie = `${rawCookie[0].split(";")[0]};${rawCookie[1].split(";")[0]}`
//             res.locals.myCookie = formattedCookie
//             return next();
//         })
//         .catch(error => console.log(error));

// }

app.get('/:script/:data', async (req, res) => {

    const urlLists = generateUrlList(req.params.data)
    const jsonData = await batchHttpRequest(urlLists)
    res.status(200).json(jsonData)
})

// app.get('/marketStatus', getCookie, marketStatus)
// app.get('/historicalData', getCookie, historicalData)
// app.get('/symbol/:symbol', getCookie, stockData)


const port = process.env.PORT || 3000

app.listen(port, () => console.log(`Server Running at http://localhost:${port}`))
