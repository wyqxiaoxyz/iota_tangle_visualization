var express = require('express');
var app = express();
app.use('/', express.static('public'))
app.listen(9010);

const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

var clientsTotal = 0;
wss.on('connection', function connection(ws) {
	console.log("Client connected", clientsTotal++)
})

var zmq = require('zeromq')
  , sock = zmq.socket('sub');

// sock.connect('tcp://ec2-34-213-119-247.us-west-2.compute.amazonaws.com:14265');
// sock.connect('tcp://127.0.0.1:5556');
// sock.connect('tcp://node01.iotatoken.nl:14265');
sock.subscribe('tx');

sock.on('message', function(message) {
  let msgSplit = message.toString().split(" ").slice(1) //slice removes leading "tx"
  let msgObj = {
    hash: msgSplit[0],
    address: msgSplit[1],
    value: parseInt(msgSplit[2]),
    tag: msgSplit[3],
    timestamp: msgSplit[4],
    currentIndex: msgSplit[5],
    lastIndex: msgSplit[6],
    bundleHash: msgSplit[7],
    trunkTransaction: msgSplit[8],
    branchTransaction: msgSplit[9],
    arrivalTime: msgSplit[10]
  }
  wss.broadcast(JSON.stringify(msgObj))
});
