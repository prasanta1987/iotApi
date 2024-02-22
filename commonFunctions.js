exports.exceptionsScripCode = ["USDINR", "NASDAQ", "NIFTY", "NIFTY 50", "BANKNIFTY", "BANK NIFTY", "INDVIX"];
exports.monthsName = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

exports.structuredSpotData = (data, functions = "all") => {

    let parm = functions.toUpperCase();
    let dataObj = {}
    switch (parm) {
        case "LTP":
            return data.pricecurrent || data.current_price.replace(",", "")

        case "PRECLOSE":
            return data.priceprevclose || data.prev_close.replace(",", "")

        default:
            dataObj = {
                spotName: data.company || data.name,
                nseId: data.NSEID || data.company,
                open: data.OPN || data.OPEN || data.open.replace(",", ""),
                cmp: data.pricecurrent || data.current_price.replace(",", ""),
                dayHigh: data.HIGH || data.HP || data.high.replace(",", ""),
                dayLow: data.LOW || data.LP || data.low.replace(",", ""),
                prevClose: data.priceprevclose || data.prev_close.replace(",", ""),
                spotChng: data.net_change || (parseFloat(data.pricechange).toFixed(2)),
                spotChngPct: (data.percent_change || parseFloat(data.pricepercentchange).toFixed(2)),
            };

            switch (data.company) {
                case "NIFTY 50":
                    dataObj.lotSize = "50"
                    break;

                case "NIFTY BANK":
                    dataObj.lotSize = "15"
                    break;

                default:
                    dataObj.lotSize = (data.MKT_LOT) ? data.MKT_LOT.toString() : "0";
                    break;
            }

            (data.adv) ? dataObj.adv = data.adv.toString() : "0";
            (data.decl) ? dataObj.decl = data.decl.toString() : "0";

            return dataObj
    }

}

exports.structuredCurrencyData = (data, functions = "all") => {

    let parm = functions.toUpperCase();


    switch (parm) {
        case "LTP":
            return parseFloat(data.ltp).toFixed(3)

        case "PRECLOSE":
            return parseFloat(data.prevclose).toFixed(2)

        default:
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

            return dataObj
    }

}

exports.getTime = async (timeZone = "Asia/Kolkata") => {

    let date = new Date()
    let time = date.toLocaleTimeString('en-us', { timeZone: timeZone, timeStyle: 'short' })

    const amPM = time.slice(-3).trim()
    time = time.replace(amPM, "").trim()

    let hour = time.split(":")[0]
    let min = time.split(":")[1]

    hour = (parseInt(hour) < 10) ? `0${hour}` : hour
    time = hour + ":" + min

    const myDate = date.toLocaleDateString('en-us', { timeZone: timeZone, dateStyle: "medium" })

    return { time: time, amPM: amPM, date: myDate }
}

exports.randomIntFromInterval = (min, max) => { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}
