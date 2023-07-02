const instrument = document.querySelector('#instrument');
const strikePrice = document.querySelector('#strikePrice');
const expiry = document.querySelector('#expiry');
const opType = document.querySelector('#opType');
const tradeType = document.querySelector('#tradeType');
const addTrade = document.querySelector('#addTrade');
const disabledFields = document.querySelectorAll('.form-select');
const cardContainer = document.querySelector('.card-container')

const monthsName = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

let strategy = {};
let allTrades = [];
let expiryStrikeLists = [];
let t = new Date();

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
            expiryStrikeLists = data
            setExpiry(expiryStrikeLists
            )
        })
        .catch(err => console.log(err))


    fetch(`/all/${scripCode}`)
        .then(res => res.json())
        .then(data => {
            console.log(data)
            strategy.spot = data.spotPrice
            addTrade.disabled = false
        })
        .catch(err => console.log(err))


})

const setExpiry = (data) => {

    data.forEach(ele => {
        let opt = document.createElement("option")
        opt.innerText = ele.expiry
        expiry.appendChild(opt)
    });

}

expiry.addEventListener('change', () => {

    const currentExpiry = expiry.value
    strikePrice.innerHTML = ''
    strikePrice.disabled = true


    for (let i = 0; i < expiryStrikeLists.length; i++) {

        if (expiryStrikeLists[i].expiry == currentExpiry) {

            expiryStrikeLists[i].strikes.forEach(strike => {

                let opt = document.createElement("option")
                opt.innerText = strike
                strikePrice.appendChild(opt)

            })
            strikePrice.disabled = false
        }

    }

})


addTrade.addEventListener('click', () => {

    const scripCode = instrument.value.toUpperCase()
    let tradeObj = {}

    tradeObj.id = t.getTime()
    tradeObj.name = `${scripCode} ${generateDateSulg(expiry.value).nameDate} ${parseInt(strikePrice.value)}${opType.value}`
    tradeObj.slug = `${scripCode}${generateDateSulg(expiry.value).slugDate}${parseInt(strikePrice.value)}${opType.value}`
    tradeObj.strike = strikePrice.value
    tradeObj.expiry = expiry.value
    tradeObj.opType = opType.value
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
                    <p>Contract Data Here</p>
                </blockquote>
            </div>        
            `

    cardContainer.appendChild(ele)



})

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


const generateCards = () => {

    cardContainer.innerHTML = ''

    strategy.data.forEach(data => {

        const ele = document.createElement('div')
        ele.classList.add("card")

        ele.innerHTML =
            `
            <div class="card-header ${(data.tradeType == 'LONG') ? 'text-warning' : 'text-danger'}"> ${data.name} </div>
            <div class="card-body">
                <blockquote class="blockquote mb-0">
                    <p>A well-known quote, contained in a blockquote element.</p>
                </blockquote>
            </div>        
            `

        cardContainer.appendChild(ele)
    })

}
