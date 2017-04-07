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

let w_sum_warmer=new Array(4);
w_sum_warmer.fill(0);
let w_sum_colder=new Array(4);
w_sum_colder.fill(0);
let w_sum_plant=new Array(4);
w_sum_plant.fill(0);

function reset()
{
w_sum_warmer.fill(0);
w_sum_colder.fill(0);
w_sum_plant.fill(0);
}
const broadcast = function (server, message) {
  server.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};
Promise.coroutine(function* () {

  
   var nIntervId = setInterval(reset, 1000);
  
  // Listen on server events.
  webSocketServer.on('connection', (ws) => {
  console.log(`${ws.upgradeReq.connection.remoteAddress} connected`);
  ws.on('message', (msg) => {
      obj= JSON.parse(msg);
	if(obj.method==="post")
{
      if(obj.selection===0)
      {
        sum_warmer[obj.section]++;
        w_sum_warmer[obj.section]++;
         if(sum_warmer[obj.section]%10 ==0)
          {
              broadcast(webSocketServer,"plus10warmer");
              sum_warmer[obj.section]=0;
          }
      }
      else if(obj.selection===1)
      {
        sum_colder[obj.section]++;
        w_sum_colder[obj.section]++;
          if(sum_colder[obj.section]%10 ==0)
          {
              broadcast(webSocketServer,"plus10colder");
             sum_colder[obj.section]=0;
          }
      }
      else if(obj.selection===2)
      {
        sum_plant[obj.section]++;
        w_sum_plant[obj.section]++;
         if(sum_plant[obj.section]%10 ==0)
          {
              broadcast(webSocketServer,"plus10plant");
              sum_plant[obj.section]=0;
          }
      }
      console.log("Server side aggregate" + sum_warmer,sum_colder,sum_plant);
      console.log("Wanderer side aggregate" + w_sum_warmer,w_sum_colder,w_sum_plant);
}

	if(obj.method==="getfromWanderer")
{
          ws.send(w_sum_warmer[obj.section]+" "+w_sum_colder[obj.section]+" "+w_sum_plant[obj.section]);
}    
if(obj.method==="start")
{
  console.log("Received start signal");
   broadcast(webSocketServer,"start");
}  
if(obj.method==="stop")
{
  console.log("Received stop signal");
   broadcast(webSocketServer,"stop");
} 
if(obj.method==="winner")
{
  console.log("Received winner "+obj.name);
  broadcast(webSocketServer,JSON.stringify(obj));    
} 

    });
  });

  // Listen on port.
  server.listen(8080, '0.0.0.0', function () {
    console.log(`Server listening on ${server.address().address}:${server.address().port}`);
  });
})();




