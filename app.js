const { fnoDataFetch, landingPage, search, getSpotData } = require('./routes');
const { generateUrlList, batchHttpRequest, sendHttpRequest, searchSpot, fetchSpotData } = require('./helperFunctions');


const express = require('express');
const app = express()


const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);


const t = new Date()
io.on('connection', (socket) => {
           console.log("----------START CONNECT----------")
console.log(socket)
           console.log("----------END CONNECT----------")
    setInterval(function(){
//       socket.send(Math.random());
               socket.send(fetchSpotData("NIFTY"));
   }, 2000);
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


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
app.get('/all/:script/:data', fnoDataFetch)
app.get('/all/:script/', getSpotData)
app.get('/search/:script', search)


//===============SSE START=================
app.get('/countdown', function(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  })
  countdown(res, 10)
})

function countdown(res, count) {
  res.write("data: " + count + "\n\n")
  if (count)
    setTimeout(() => countdown(res, count-1), 1000)
  else
    res.end()
}

//=====================SSE ENDS======================


// app.get('/marketStatus', getCookie, marketStatus)
// app.get('/historicalData', getCookie, historicalData)
// app.get('/symbol/:symbol', getCookie, stockData)


const port = process.env.PORT || 3000

server.listen(port, () => console.log(`Server Running at http://localhost:${port}`))
