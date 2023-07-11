import { HOST } from './env.js'
import { userToken, payOffGraph, calculatePnL } from './common.js'

const instrument = document.querySelector('#instrument');
const instrumentType = document.querySelector('#instrumentType');
const strikePrice = document.querySelector('#strikePrice');
const expiry = document.querySelector('#expiry');
const opType = document.querySelector('#opType');
const tradeType = document.querySelector('#tradeType');
const addTrade = document.querySelector('#addTrade');
const disabledFields = document.querySelectorAll('.disForOpt');
const cardContainer = document.querySelector('.card-container')

const monthsName = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

let strategy = {};
let allTrades = [];
let expiryStrikeLists = [];
let t = new Date()


const generateDateSulg = (date) => {
    const d = new Date(date)
    const newDate = (d.getDate() < 10) ? `0${d.getDate()}` : d.getDate()
    const monthName = monthsName[d.getMonth()]
    const year = d.getFullYear().toString().substring(2)

    return {
        "slugDate": `${newDate}${monthName}${year}`,
        "nameDate": `${newDate}-${monthName}-${year}`
    }

}


instrument.addEventListener('blur', () => {

    let scripCode = instrument.value || "NIFTY"

    scripCode = scripCode.toUpperCase()

    if (scripCode == "NIFTY") {
        document.querySelector('#insTypSpot').disabled = true
    } else {
        document.querySelector('#insTypSpot').disabled = false
    }

    let fectOption = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${userToken}`
        }
    }

    fetch(`${HOST}/spotFut/${scripCode}`, fectOption)
        .then(res => res.json())
        .then(data => {
            strategy.spot = data.spotPrice
            strategy.lotSize = parseInt(data.mktLot)
            strategy.spotName = (data.spotName == "NIFTY 50") ? "NIFTY" : data.spotName
            console.log(strategy)
            generateBadge(data)
        })
        .catch(err => console.log(err))


})

const generateBadge = (data) => {
    document.querySelector('.badge-container').classList.remove('d-none')
    // const spotName = document.querySelector('#spotName')
    // const futName = document.querySelector('#futName')
    const spotPrice = document.querySelector('#spotPrice')
    const futPrice = document.querySelector('#futPrice')
    const cardContainer = document.querySelector('#card-container')

    // spotName.innerHTML = data.spotName
    // futName.innerHTML = data.spotName + " Fut"

    cardContainer.innerHTML = ''

    let spotNameEle = document.createElement('span')
    spotNameEle.classList.add("badge")
    spotNameEle.classList.add("bg-info")
    spotNameEle.innerHTML = data.spotName
    cardContainer.appendChild(spotNameEle)

    let mktLot = document.createElement('span')
    mktLot.innerHTML = `
                <span class="badge bg-primary">
                    <span>LOT: ${data.mktLot}</span>
                </span>
    `
    cardContainer.appendChild(mktLot)

    let spotEle = document.createElement('span')
    spotEle.innerHTML = `
                <span class="badge ${data.spotChng > 0 ? 'bg-success' : 'bg-danger'}">
                    <span>Spot Ltp: ${data.spotPrice}</span>
                </span>
    `
    cardContainer.appendChild(spotEle)

    let futEle = document.createElement('span')
    futEle.innerHTML = `
                <span class="badge ${data.change > 0 ? 'bg-success' : 'bg-danger'}">
                    <span>Futrure Ltp: ${data.futLtp}</span>
                </span>
    `
    cardContainer.appendChild(futEle)

}

opType.addEventListener('change', () => {

    let scripCode = instrument.value.toUpperCase()
    let selectedOpType = opType.value.toUpperCase()

    disabledFields.forEach(ele => ele.disabled = true)
    addTrade.disabled = true

    let fectOption = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${userToken}`
        }
    }

    fetch(`${HOST}/expStrike/${scripCode}/${selectedOpType}/`, fectOption)
        .then(res => res.json())
        .then(data => {
            disabledFields.forEach(ele => ele.disabled = false)
            console.log(data)
            expiryStrikeLists = data

            expiryStrikeLists.forEach(ele => {
                let opt = document.createElement("option")
                opt.innerText = ele.expiry
                expiry.appendChild(opt)
            });

            addTrade.disabled = false
        })
        .catch(err => console.log(err))

})

const setExpiry = (data) => {



}

expiry.addEventListener('change', () => {

    const currentExpiry = expiry.value
    strikePrice.innerHTML = ''
    strikePrice.disabled = true


    for (let i = 0; i < expiryStrikeLists.length; i++) {

        if (expiryStrikeLists[i].expiry == currentExpiry) {

            expiryStrikeLists[i].data.forEach(strike => {

                let opt = document.createElement("option")
                opt.innerText = strike.strike
                opt.setAttribute('data-ltp', strike.ltp)
                strikePrice.appendChild(opt)

            })
            const strEle = document.querySelector('option')
            strEle.innerHTML = 'Strike Price'
            strikePrice.prepend(strEle)
            strikePrice.selectedIndex = 0
            strikePrice.disabled = false
        }

    }

})


addTrade.addEventListener('click', () => {

    const scripCode = instrument.value.toUpperCase()
    let ltp = parseFloat(strikePrice[strikePrice.selectedIndex].getAttribute('data-ltp'))


    ltp = (ltp > 0) ? ltp : 0

    let tradeObj = {}


    tradeObj.id = t.getTime()
    tradeObj.instrumentType = instrumentType.value.toUpperCase()
    tradeObj.name = `${scripCode} ${generateDateSulg(expiry.value).nameDate} ${parseInt(strikePrice.value)}${opType.value}`
    tradeObj.slug = `${scripCode}${generateDateSulg(expiry.value).slugDate}${parseInt(strikePrice.value)}${opType.value}`
    tradeObj.strike = strikePrice.value
    tradeObj.expiry = expiry.value
    tradeObj.opType = opType.value
    tradeObj.ltp = ltp
    tradeObj.tradeType = tradeType.value

    allTrades.push(tradeObj)

    strategy.data = allTrades

    disabledFields.forEach(ele => ele.selectedIndex = 0)


    const ele = document.createElement('div')
    ele.classList.add("card")

    ele.innerHTML =
        `
            <div class="card-header ${(tradeObj.tradeType == 'LONG') ? 'text-warning' : 'text-danger'}"> ${tradeObj.name} </div>
            <div class="card-body">
                <blockquote class="blockquote mb-0">
                    <p>LTP : ${tradeObj.ltp}</p>
                </blockquote>
            </div>        
            `

    cardContainer.appendChild(ele)

    generatePayOffData(strategy)

})

const generatePayOffData = (strategy) => {


    let expArray = []
    let payOffArray = []

    const spot = strategy.spot
    const range = 1000
    const lowerRange = spot - range
    const upperRange = spot + range

    for (let i = lowerRange; i < upperRange; i++) {
        expArray.push(i)

        let pnl = 0
        strategy.data.forEach(trade => {
            pnl += calculatePnL(trade.strike, trade.opType, i, trade.ltp, trade.tradeType, strategy.lotSize)
        })
        payOffArray.push(pnl)
    }

    payOffGraph.update({
        xAxis: [{
            categories: expArray
        }],
        series: [{
            data: payOffArray
        }]
    })

}








// const generateCards = () => {

//     cardContainer.innerHTML = ''

//     strategy.data.forEach(data => {

//         const ele = document.createElement('div')
//         ele.classList.add("card")

//         ele.innerHTML =
//             `
//             <div class="card-header ${(data.tradeType == 'LONG') ? 'text-warning' : 'text-danger'}"> ${data.name} </div>
//             <div class="card-body">
//                 <blockquote class="blockquote mb-0">
//                     <p>A well-known quote, contained in a blockquote element.</p>
//                 </blockquote>
//             </div>
//             `

//         cardContainer.appendChild(ele)
//     })

// }


// Highcharts.chart('container', {
//     chart: {
//         type: 'areaspline',
//         height: 50 + "%"
//     },
//     title: {
//         text: 'Pay Off Chart'
//     },
//     subtitle: {
//         text: ""
//     },
//     xAxis: {
//         categories: expArray,
//         accessibility: {
//             description: 'Strike Price Range'
//         }
//     },
//     yAxis: {
//         title: {
//             text: 'P&L'
//         },
//         labels: {
//             format: '{value}'
//         }
//     },
//     tooltip: {
//         crosshairs: true,
//         shared: true
//     },
//     plotOptions: {
//         spline: {
//             marker: {
//                 radius: 4,
//                 lineColor: '#FF00FF',
//                 lineWidth: 1
//             }
//         }
//     },
//     series: [
//         {
//             name: 'P&L',
//             marker: { symbol: 'diamond' },
//             data: payOffArray,
//             zones: [
//                 {
//                     value: 0,
//                     color: "red"
//                 },
//                 {
//                     color: "green"
//                 }

//             ]

//         }
//     ]
// });