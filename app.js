const { fnoDataFetch, landingPage, search, getSpotData } = require('./routes');
const { generateUrlList, batchHttpRequest, sendHttpRequest, searchSpot, fetchSpotData } = require('./helperFunctions');

const path = require("path");

const express = require('express');
const app = express()



const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);


const t = new Date()
io.on('connection', (socket) => {

    setInterval(async function () {
        const jsonData = await fetchSpotData("NIFTY")
        //     socket.send(Math.random());           
        //                console.log(jsonData)
        socket.send(jsonData);
    }, 1000);
    socket.on('disconnect', function (data) {
        console.log("----------START DISCONNECT----------")
        console.log(data)
        console.log("----------END DISCONNECT----------")
        console.log('A user disconnected');
    });

});


// const server = require('http').createServer(app);
// const WebSocket = require('ws');
// const wss = new WebSocket.Server({ server: server });


// wss.on('connection', function connection(ws) {
//     // console.log('A new client Connected!');
//     // ws.send('Welcome New Client!');

//     // setInterval(async function () {
//     //     const jsonData = await fetchSpotData("NIFTY")
//     //     // console.log(jsonData);
//     //     ws.send(JSON.stringify(jsonData));
//     // }, 1000);

//     // ws.on('message', function incoming(message) {
//     //     console.log('received: %s', message);

//     //     wss.clients.forEach(function each(client) {
//     //         if (client !== ws && client.readyState === WebSocket.OPEN) {
//     //             client.send(message);
//     //         }
//     //     });

//     // });

//     ws.on('message', msg => {
//         const scripCode = msg.toString()

//         setInterval(async function () {
//             const jsonData = await fetchSpotData(scripCode.toUpperCase())
//             ws.send(JSON.stringify(jsonData));
//         }, 1000);


//         // ws.send('HELLO');
//         // wss.clients.forEach(client => {
//         //     client.send('Hello')
//         // })

//     })

// });


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});
app.get('/all/:script/:data', fnoDataFetch)
app.get('/all/:script/', getSpotData)
app.get('/search/:script', search)


//===============SSE START=================
// app.get('/countdown', function (req, res) {
//     res.writeHead(200, {
//         'Content-Type': 'text/event-stream',
//         'Cache-Control': 'no-cache',
//         'Connection': 'keep-alive'
//     })
//     countdown(res, 10)
// })

// function countdown(res, count) {
//     res.write("data: " + count + "\n\n")
//     if (count)
//         setTimeout(() => countdown(res, count - 1), 1000)
//     else
//         res.end()
// }

//=====================SSE ENDS======================


// app.get('/marketStatus', getCookie, marketStatus)
// app.get('/historicalData', getCookie, historicalData)
// app.get('/symbol/:symbol', getCookie, stockData)


const port = process.env.PORT || 3000

server.listen(port, () => console.log(`Server Running at http://localhost:${port}`))
