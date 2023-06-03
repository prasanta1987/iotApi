const { fnoDataFetch, landingPage, search, getSpotData } = require('./routes');


const express = require('express');
const app = express()


// const server = require('http').createServer(app);
// const WebSocket = require('ws');
// const wss = new WebSocket.Server({ server: server });


// wss.on('connection', function connection(ws) {
//     console.log('A new client Connected!');
//     ws.send('Welcome New Client!');

//     ws.on('message', function incoming(message) {
//         console.log('received: %s', message);

//         wss.clients.forEach(function each(client) {
//             if (client !== ws && client.readyState === WebSocket.OPEN) {
//                 client.send(message);
//             }
//         });

//     });
// });

const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 8080 });

server.on("connection", (ws) => {
    console.log("New client connected !");

    //send welcome message
    ws.send("Hello this is welcome message");

    //reply
    ws.on("message", (message) => {
        console.log(`message: ${message}`);

        //message handling
        if (message == "hi") {
            ws.send("hello");
        } else if (message == "bye") {
            ws.send("goodbye");
        } else {
            ws.send("other message");
        }
    });
});


app.get('/', landingPage)
app.get('/all/:script/:data', fnoDataFetch)
app.get('/all/:script/', getSpotData)
app.get('/search/:script', search)


// app.get('/marketStatus', getCookie, marketStatus)
// app.get('/historicalData', getCookie, historicalData)
// app.get('/symbol/:symbol', getCookie, stockData)


const port = process.env.PORT || 3000

app.listen(port, () => console.log(`Server Running at http://localhost:${port}`))
