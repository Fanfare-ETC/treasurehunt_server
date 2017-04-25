const http = require('http');
const Promise = require('bluebird');
const mysql = require('promise-mysql');
const moment = require('moment');
const express = require('express');
const WebSocket = require('ws');


const app = express();
const server = http.createServer(app);
const webSocketServer = new WebSocket.Server({ server });

let sum_warmer=0;
let sum_colder=0;
let sum_marker=0;

let w_sum_warmer=0;
let w_sum_colder=0;
let w_sum_marker=0;
let state = {
event:'state',
      game_on:false,
      flag1:false,
      flag2:false,
      flag3:false,
      game_off:false
};
function resetAggregate()
{
    broadcast(webSocketServer,"wanderer"+","+w_sum_warmer+","+w_sum_marker+","+w_sum_colder);
    w_sum_warmer=0;
    w_sum_colder=0;
    w_sum_marker=0;
}
function resetState()
{
	  state.game_on=false;
      state.flag1=false;
      state.flag2=false;
      state.flag3=false;
      state.game_off=false;
}
const broadcast = function (server, message) {
    server.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
            client.send(message);
            }
            });
};
Promise.coroutine(function* () {

        var nIntervId0 = setInterval(resetAggregate, 1000);
	    //var nIntervId1 = setInterval(resetState, 5000000);

        // Listen on server events.
        webSocketServer.on('connection', (ws) => {

                console.log(`${ws.upgradeReq.connection.remoteAddress} connected`);

                ws.on('message', (msg) => {

                        obj= JSON.parse(msg);

                        if(obj.method==="post")
                        {
                        if(obj.selection===0)
                        {
                            sum_warmer++;
                            w_sum_warmer++;
                            if(sum_warmer%10 ==0)
                        {
                            broadcast(webSocketServer,"plus10warmer");
                            sum_warmer=0;
                        }
                        }
                        else if(obj.selection===1)
                        {
                            sum_colder++;
                            w_sum_colder++;
                            if(sum_colder%10 ==0)
                        {
                            broadcast(webSocketServer,"plus10colder");
                            sum_colder=0;
                        }
                        }
                        else if(obj.selection===2)
                        {
                            sum_marker++;
                            w_sum_marker++;
                            if(sum_marker%10 ==0)
                            {
                                broadcast(webSocketServer,"plus10marker");
                                sum_marker=0;
                            }
                        }
                        console.log("Server side aggregate", sum_warmer,sum_marker,sum_colder);
                        console.log("Wanderer side aggregate", w_sum_warmer,w_sum_marker,w_sum_colder);
                        } //post
					    if(obj.method==="getstate")
                        {
							console.log("Client asking for state");
							console.log(state);
                            ws.send(JSON.stringify(state));
							//broadcast(webSocketServer,JSON.stringify(state));
                        }//send aggregate to wanderer
					
                        if(obj.method==="start")
                        {
                            console.log("Received start signal");
                            state.game_on=true;
							state.flag1=false;
							state.flag2=false;
							state.flag3=false;
							state.game_off=false;
							console.log(state);
                            broadcast(webSocketServer,JSON.stringify(state));
                        }//send start signal  
                        if(obj.method==="stop")
                        {
							console.log("Received stop signal");
                            state.game_on=false;
							state.flag1=false;
							state.flag2=false;
							state.flag3=false;
							state.game_off=true;
							console.log(state);
                            broadcast(webSocketServer,JSON.stringify(state));
                        } //send stop signal
						if(obj.method==="reset")
                        {
							console.log("Received reset signal");
                            state.game_on=false;
							state.flag1=false;
							state.flag2=false;
							state.flag3=false;
							state.game_off=false;
							console.log(state);
                            broadcast(webSocketServer,JSON.stringify(state));
                        } //send stop signal
                        if(obj.method==="flag1correct")
                        {
							console.log("Received flag1correct signal");
                            state.game_on=true;
							state.flag1=true;
							state.flag2=false;
							state.flag3=false;
							state.game_off=false;
							console.log(state);
                            broadcast(webSocketServer,JSON.stringify(state));
                        }//send flag1correct signal  

                        if(obj.method==="flag1wrong")
                        {
							console.log("Received flag1wrong signal");
                            state.game_on=true;
							state.flag1=false;
							state.flag2=false;
							state.flag3=false;
							state.game_off=false;
							console.log(state);
                            broadcast(webSocketServer,JSON.stringify(state));
                        }//send flag1wrong signal  

                        if(obj.method==="flag2correct")
                        {
							console.log("Received flag2correct signal");
                            state.game_on=true;
							state.flag1=true;
							state.flag2=true;
							state.flag3=false;
							state.game_off=false;
							console.log(state);
                            broadcast(webSocketServer,JSON.stringify(state));
                        }//send flag2correct signal  

                        if(obj.method==="flag2wrong")
                        {
							console.log("Received flag2wrong signal");
                            state.game_on=true;
							state.flag1=true;
							state.flag2=false;
							state.flag3=false;
							state.game_off=false;
							console.log(state);
                            broadcast(webSocketServer,JSON.stringify(state));

                        }//send flag2correct signal  
                        if(obj.method==="flag3correct")
                        {
							console.log("Received flag3correct signal");
                            state.game_on=true;
							state.flag1=true;
							state.flag2=true;
							state.flag3=true;
							state.game_off=false;
							console.log(state);
                            broadcast(webSocketServer,JSON.stringify(state));
                        }//send flag3correct signal  

                        if(obj.method==="flag3wrong")
                        {
							console.log("Received flag3wrong signal");
                            state.game_on=true;
							state.flag1=true;
							state.flag2=true;
							state.flag3=false;
							state.game_off=false;
							console.log(state);
                            broadcast(webSocketServer,JSON.stringify(state));
                        }//send flag3correct signal  

                });
        });

        // Listen on port.
        server.listen(8080, '0.0.0.0', function () {
                console.log(`Server listening on ${server.address().address}:${server.address().port}`);
                });
})();




