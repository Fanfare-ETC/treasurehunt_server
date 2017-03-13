const http = require('http');
const Promise = require('bluebird');
const mysql = require('promise-mysql');
const moment = require('moment');
const express = require('express');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const webSocketServer = new WebSocket.Server({ server });
let section;
let sum_warmer=new Array(4);
sum_warmer.fill(0);
let sum_colder=new Array(4);
sum_colder.fill(0);
let sum_plant=new Array(4);
sum_plant.fill(0);
Promise.coroutine(function* () {
  // Listen on server events.
  webSocketServer.on('connection', (ws) => {
    console.log(`${ws.upgradeReq.connection.remoteAddress} connected`);
   
    ws.on('message', (msg) => {
      obj= JSON.parse(msg);
      if(obj.selection===0)
        sum_warmer[obj.section]++;
      if(obj.selection===1)
        sum_colder[obj.section]++;
      if(obj.selection===2)
        sum_plant[obj.section]++;
      console.log(sum_warmer,sum_colder);
    });
  });

  // Listen on port.
  server.listen(8080, '0.0.0.0', function () {
    console.log(`Server listening on ${server.address().address}:${server.address().port}`);
  });
})();

/*
webSocketServer.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          console.log(`Received from ${client.upgradeReq.connection.remoteAddress}: ${msg}`)
          client.send(msg);
        }
      });
*/
