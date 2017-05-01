// scratchSerialRobot.js

// inspired by / based on picoExtension.js by Shane M. Clements


(function(ext) {
    var device = null;
    var rawData = null;

    var hostname = prompt("What is Marty's address?", "localhost");


    var waitingForReply = {
      setup: function(callback){
        this.callback = callback;
        this.timeoutID = window.setTimeout(function(msg) {
          this.clearCallback();
        }.bind(this), 2500);
      },

      clearCallback: function(data){
        try {
          rcv = JSON.parse(data);
          if(rcv.sensorData != undefined){
            returnval = rcv.sensorData;
          } else {
            returnval = data;
          }
        } catch(err){
          returnval = data;
        }

        
        if (this.callback != undefined){
          this.callback(returnval);
          console.log("callback with data: " + returnval);
          this.callback = undefined;
        }
        if (typeof this.timeoutID === "number") {
          window.clearTimeout(this.timeoutID);
          this.timeoutID = undefined;
        }
      },

    }

    ext.resetAll = function(){};
    ext._deviceConnected = function(){};

    console.log("hostname: " + hostname);

    ws = new WebSocket("ws://" + hostname + ":5996");

    ws.onopen = function()
   {
      // Web Socket is connected, send data using send()
      //ws.send(cmd);
      console.log("ws open.");
      ws.send("scratch started");
      //console.log("sending cmd: " + cmd);
      //window.setTimeout(function(){callback()}, 1000);
   };

   ws.onmessage = function (evt) 
   { 
      var received_msg = evt.data;
      console.log("received: " + evt.data);

      waitingForReply.clearCallback(evt.data);
   };


    function sendCmd(cmd, callback){
        if (ws.readyState){
            ws.send(JSON.stringify(cmd));
        }
        waitingForReply.setup(callback);

    }
/*
    var ws = new WebSocket("ws://archie3.local:5996");


*/
    ext._shutdown = function() {
        if(device) device.close();
        if(poller) poller = clearInterval(poller);
        device = null;
    };

    ext._getStatus = function() {
        //if (!ws.readyState){return {status: 1, msg: 'Websocket connecting'}};
        return {status: 2, msg: 'websocket connected'};
    }

    ext.send_message = function(callback){
        console.log("send command function");
        //console.log("wsa size: "  + wsa.length);
        cmd = {"cmd": "celebrate", "id": 12};
        sendCmd(cmd,callback);
        //window.setTimeout(function(){callback()}, 1000);
        //callback();
    }

    ext.wiggle = function(callback){
      cmd = {"cmd": "celebrate", "id": 12};
      sendCmd(cmd,callback);
    }

    ext.walk_forward = function(numsteps, callback){
      cmd = {"cmd": "walk", "id": 6, "numsteps": parseInt(numsteps), "steplength": 50, "turn": 0, "movetime": 1600};
      sendCmd(cmd, callback);
    }

    ext.walk_backward = function(numsteps, callback){
      cmd = {"cmd": "walk", "id": 6, "numsteps": parseInt(numsteps), "steplength": -50, "turn": 0, "movetime": 1600};
      sendCmd(cmd, callback); 
    }

    ext.turn = function(direction, numsteps, callback){
      var turn = 40;
      if (direction == "right" ){
        turn = -40;
      }
      cmd = {"cmd": "walk", "id": 6, "numsteps": parseInt(numsteps), "steplength": 0, "turn": turn, "movetime": 1300};
      sendCmd(cmd, callback);
    }

    ext.hello = function(callback){
      cmd = {"cmd": "hello", "id": 0};
      sendCmd(cmd, callback);
    }

    ext.kick = function(leg, callback){
      cmd = {"cmd": "kick", "id": 8, "leg": leg};
      sendCmd(cmd, callback); 
    }

    ext.eyes = function(eyes, callback){
      cmd = {"cmd": "eyes", "id": 7, "eyes": eyes};
      sendCmd(cmd, callback);
    }

    ext.lean = function(direction, callback){
      cmd = {"cmd": "lean", "id": 0, "direction": direction, "amount": 50};
      sendCmd(cmd, callback);
    }

    ext.liftLeg = function(leg, callback){
      cmd = {"cmd": "liftLeg", "id": 10, "leg": leg, "amount": 100};
      sendCmd(cmd, callback);
    }

    ext.lowerLeg = function(callback){
      cmd = {"cmd": "lowerLeg", "id": 11};
      sendCmd(cmd, callback);
    }

    ext.moveHip = function(leg, direction, callback){
      cmd = {"cmd": "moveHip", "id": 2, "leg": leg, "direction": direction, "movetime": 1000, "amount": 30};
      sendCmd(cmd, callback);
    }

    ext.switchPressed = function(callback){
      cmd = {"cmd": "get", "id": 13, "sensor": "gpio", "sensor_id": 0};
      sendCmd(cmd, callback);
    }

    ext.moveJoint = function(joint, angle, movetime, callback){
      cmd = {"cmd": "moveJoint", "id": 12, "joint": joint, "angle": parseInt(angle), "movetime": parseInt(parseFloat(movetime)*1000)};
      sendCmd(cmd, callback);
    }

    ext.getGPIO = function(channel, callback){
      cmd = {"cmd": "get", "id": 13, "sensor": "gpio", "sensor_id": parseInt(channel)};
      sendCmd(cmd, callback);
    }

    ext.getMotorCurrent = function(joint, callback){
      cmd = {"cmd": "get", "id": 13, "sensor": "current", "joint": joint};
      sendCmd(cmd, callback);
    }

    ext.getAccel = function(axis, callback){
      cmd = {"cmd": "get", "id": 13, "sensor": "accelerometer", "axis": axis};
      sendCmd(cmd, callback);
    }

    ext.getBattery = function(callback){
      cmd = {"cmd": "get", "id": 13, "sensor": "battery"};
      sendCmd(cmd, callback);
    }

    ext.disableMotors = function(callback){
      cmd = {"cmd": "stop", "id": 14};
      sendCmd(cmd, callback);
    }



    var descriptor = {
        blocks: [
          ['w', 'Get Ready', 'hello'],
          ['w', 'Turn off motors', 'disableMotors'],
          ['w', 'Wiggle', 'wiggle'],
          ['w', 'Walk %n steps forward', 'walk_forward', 2],
          ['w', 'Walk %n steps backward', 'walk_backward', 2],
          ['w', 'Turn %m.leg %n steps', 'turn', 'left', 2],
          ['w', 'Kick %m.leg leg', 'kick', 'left'],
          ['w', 'Lean %m.leg', 'lean', 'left'],
          ['w', 'Lift %m.leg leg', 'liftLeg', 'left'],
          ['w', 'Lower leg', 'lowerLeg'],
          ['w', 'Move %m.leg leg %m.sagittal', 'moveHip', 'left', 'forward'],
          ['w', 'Eyes %m.eyes', 'eyes', 'normal'],
          ['R', 'Bump switch pressed', 'switchPressed'], 
          ['w', 'Move %m.joints to %n degrees in %n secs', 'moveJoint', 'right hip', 0, 0],
          ['R', 'Input %m.gpios', 'getGPIO', '0'],
          ['R', '%m.motorCurrents motor Current', 'getMotorCurrent', 'right arm'],
          ['R', 'Accelerometer %m.accel', 'getAccel', 'Z axis'],
          ['R', 'Battery voltage', 'getBattery'],

//          ['w', 'Demo', 'demo']
        ],
        menus: {
          leg: ['left', 'right'],
          eyes: ['normal', 'wide', 'angry', 'excited'],
          sagittal: ['forward', 'backward'],
          joints: ['right hip', 'right twist', 'right knee', 'left hip', 'left twist', 'left knee', 'right arm', 'left arm', 'eyes'],
          gpios: ['0', '1', '2', '3', '4', '5', '6', '7'],
          motorCurrents: ['right hip', 'right twist', 'right knee', 'left hip', 'left twist', 'left knee', 'right arm', 'left arm'],
          accel: ['X axis', 'Y axis', 'Z axis'],
        },

    };

    ScratchExtensions.register('SerialRobot', descriptor, ext);
})({});