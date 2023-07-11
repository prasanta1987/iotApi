import { auth } from './fbConfig.js'
import {
    HOST, signInBtnEle, userNameEle,
    passwordEle, logInModalClose,
    loginBtnEle, logoutBtnEle, stockSearchFieldEle
} from './env.js'

let authState = false;
let userToken = false

auth.onAuthStateChanged((user) => {
    if (user) {
        userToken = user.accessToken
        authState = true
        displaylogInElement('login')
        // sOutBtn.style.display = 'block'
        // sInBtn.style.display = 'none'
        // document.querySelector('.brandname').innerHTML = user.displayName
        // document.querySelector('.ulogo').setAttribute("src", user.photoURL)
        // sessionStorage.uid = user.displayName
        // if (reportPage) reportPage.style.display = 'block'
        // if (addItemPage) addItemPage.style.display = 'block'
        // if (reportPage) reportPage.style.display = 'block'
        // if (addItemPage) addItemPage.style.display = 'block'
    } else {
        authState = false
        userToken = false
        displaylogInElement('logout')
        if (location.pathname.replace("/", "") == "strategy") { window.location = '/' }
        // window.location = '/'
        // sOutBtn.style.display = 'none'
        // sInBtn.style.display = 'block'
        // document.querySelector('.brandname').innerHTML = "Welcome Guest"
        // document.querySelector('.ulogo').setAttribute("src", "./assets/user.png")
        // console.log('Not Signed In')
        // sessionStorage.uid = null
        // if (reportPage) reportPage.style.display = 'none'
        // if (addItemPage) addItemPage.style.display = 'none'
    }
});

const displaylogInElement = (stat) => {

    if (stat == "login") {
        loginBtnEle.classList.remove('d-block')
        loginBtnEle.classList.add('d-none')

        logoutBtnEle.classList.add('d-block')
        logoutBtnEle.classList.remove('d-none')

        stockSearchFieldEle.classList.remove('d-none')
        stockSearchFieldEle.classList.add('d-block')

    } else if (stat == "logout") {

        loginBtnEle.classList.add('d-block')
        loginBtnEle.classList.remove('d-none')

        logoutBtnEle.classList.remove('d-block')
        logoutBtnEle.classList.add('d-none')

        stockSearchFieldEle.classList.add('d-none')
        stockSearchFieldEle.classList.remove('d-block')

    }



}

const payOffGraph = Highcharts.chart('container', {
    chart: {
        type: 'areaspline',
        height: 50 + "%"
    },
    title: {
        text: 'Pay Off Chart'
    },
    subtitle: {
        text: ""
    },
    xAxis: {
        accessibility: {
            description: 'Strike Price Range'
        }
    },
    yAxis: {
        title: {
            text: 'P&L'
        },
        labels: {
            format: '{value}'
        }
    },
    tooltip: {
        crosshairs: true,
        shared: true
    },
    plotOptions: {
        spline: {
            marker: {
                radius: 4,
                lineColor: '#FF00FF',
                lineWidth: 1
            }
        }
    },
    series: [
        {
            name: 'P&L',
            marker: { symbol: 'diamond' },
            zones: [
                {
                    value: 0,
                    color: "red"
                },
                {
                    color: "green"
                }

            ]

        }
    ]
});

const calculatePnL = (strike, type, spot, price, direction, lot) => {
    let pnl = 0
    if (type == "CE") {
        const squareOffTradePrice = (spot > strike) ? (spot - strike).toFixed(2) : 0
        pnl = (direction == "LONG") ? ((squareOffTradePrice - price) * lot) : ((price - squareOffTradePrice) * lot)
    } else {
        const squareOffTradePrice = (spot < strike) ? (strike - spot) : 0
        pnl = (direction == "LONG") ? ((squareOffTradePrice - price) * lot) : ((price - squareOffTradePrice) * lot)
    }

    return pnl

}



export { userToken, payOffGraph, calculatePnL }