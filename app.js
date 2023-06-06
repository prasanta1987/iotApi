const express = require('express');
const path = require("path");
const fs = require('fs')

const { fnoDataFetch, landingPage, search, getSpotData } = require('./routes');

const app = express()
const port = process.env.PORT || 3000

const userProfileFile = path.join(__dirname, './user_profile/userProfile.json')

fs.exists(userProfileFile, (res) => {
    if (!res) {
        try {
            fs.mkdirSync(path.join(__dirname, './user_profile'))
        } catch (error) {
            console.log('Directory Exist')
        } finally {
            fs.writeFileSync(userProfileFile,
                JSON.stringify({
                    name: null,
                }, null, 3)
            )
        }
    }
})

app.get('/', landingPage)
app.get('/all/:script/:data', fnoDataFetch)
app.get('/all/:script/', getSpotData)
app.get('/search/:script', search)


// app.get('/marketStatus', getCookie, marketStatus)
// app.get('/historicalData', getCookie, historicalData)
// app.get('/symbol/:symbol', getCookie, stockData)



app.listen(port, () => console.log(`Server Running at http://localhost:${port}`))
