const axios = require("axios").default;

exports.marketStatus = (req, res) => {

    var config = {
        method: 'get',
        url: 'https://www.nseindia.com/api/marketStatus',
        headers: {
            // 'Content-Type': 'application/json',
            'cookie': res.locals.myCookie
        },
    };

    axios(config)
        .then(response => res.status(200).json(response.data))
        .catch(error => res.status(501).json(error));


}