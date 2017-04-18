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
broadcast(webSocketServer,w_sum_warmer+","+w_sum_plant+","+w_sum_colder);
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

  
   var nIntervId = setInterval(reset, 2000);
  
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
      console.log("Server side aggregate", sum_warmer,sum_plant,sum_colder);
      console.log("Wanderer side aggregate", w_sum_warmer,w_sum_plant,w_sum_colder);
  } //post

	if(obj.method==="getFromWanderer")
  {
   ws.send(w_sum_warmer[obj.section]+" "+w_sum_colder[obj.section]+" "+w_sum_plant[obj.section]);
  }//send aggregate to wanderer    
if(obj.method==="start")
  {
   console.log("Received start signal");
   broadcast(webSocketServer,"start");
  }//send start signal  
if(obj.method==="stop")
  {
   console.log("Received stop signal");
   broadcast(webSocketServer,"stop");
  } //send stop signal
if(obj.method==="winner")
  {
  console.log("Received winner "+obj.name);
  broadcast(webSocketServer,JSON.stringify(obj));    
  } 
if(obj.method==="flag1correct")
  {
   console.log("Received flag1correct signal");
   broadcast(webSocketServer,"flag1correct");
  }//send flag1correct signal  
    
if(obj.method==="flag2correct")
  {
   console.log("Received flag2correct signal");
   broadcast(webSocketServer,"flag2correct");
  }//send flag2correct signal  
    
if(obj.method==="flag3correct")
  {
   console.log("Received flag3correct signal");
   broadcast(webSocketServer,"flag3correct");
  }//send flag3correct signal  
if(obj.method==="flag1wrong")
  {
   console.log("Received flag1wrong signal");
   broadcast(webSocketServer,"flag1wrong");
  }//send flag1correct signal  
    
if(obj.method==="flag2wrong")
  {
   console.log("Received flag2wrong signal");
   broadcast(webSocketServer,"flag2wrong");
  
  }//send flag2correct signal  
    
if(obj.method==="flag3wrong")
  {
   console.log("Received flag3wrong signal");
   broadcast(webSocketServer,"flag3wrong");
  }//send flag3correct signal  
    
    

    });
  });

  // Listen on port.
  server.listen(8080, '0.0.0.0', function () {
    console.log(`Server listening on ${server.address().address}:${server.address().port}`);
  });
})();




