const instrument = document.querySelector('#instrument');
const strikePrice = document.querySelector('#strikePrice');
const expiry = document.querySelector('#expiry');
const opType = document.querySelector('#opType');
const tradeType = document.querySelector('#tradeType');
const addTrade = document.querySelector('#addTrade');
const disabledFields = document.querySelectorAll('.form-select');

let strategy = {}
let allTrades = []

const getWatchList = (userId) => {

    fetch('/getWatchList', {
        method: 'POST', headers: {
            "uname": userId
        }
    })
        .then(res => res.json())
        .then(data => {
            console.log(data)
        })
        .catch(err => console.log(err))

}

instrument.addEventListener('blur', () => {
    let scripCode = instrument.value

    disabledFields.forEach(ele => ele.disabled = true)
    addTrade.disabled = true

    fetch(`/expStrike/${scripCode}`)
        .then(res => res.json())
        .then(data => {
            disabledFields.forEach(ele => ele.disabled = false)

            expiry.innerHTML = ''
            strikePrice.innerHTML = ''

            data.expiry.forEach(ele => {
                let opt = document.createElement("option")
                opt.innerText = ele
                expiry.appendChild(opt)
            });

            data.strike.forEach(ele => {
                let opt = document.createElement("option")
                opt.innerText = ele
                strikePrice.appendChild(opt)
            });

        })
        .catch(err => console.log(err))


    fetch(`/all/${scripCode}`)
        .then(res => res.json())
        .then(data => {
            console.log(data)
            strategy.spot = data.spotPrice
            addTrade.disabled = false
        })
        .catch(err = console.log(err))


})

addTrade.addEventListener('click', () => {

    let tradeObj = {}

    tradeObj.strike = strikePrice.value
    tradeObj.expiry = expiry.value
    tradeObj.opType = opType.value
    tradeObj.tradeType = tradeType.value

    allTrades.push(tradeObj)

    strategy.data = allTrades

    console.log(strategy)
})