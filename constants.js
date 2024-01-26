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

exports.structuredCurrencyData = (data) => {

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