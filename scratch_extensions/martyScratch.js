function testFunc(){
    console.log("called!");
}

function loadScript(url, callback)
{
    // Adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    script.onreadystatechange = callback;
    script.onload = callback;

    // Fire the loading
    head.appendChild(script);
}

loadScript("https://cdn.robotical.io/static/js/marty.js?v=20171208");
//loadScript("/js/martyjs.js?v=20171208");
loadScript("https://cdn.robotical.io/static/js/martyScan.js", function(){setTimeout(scanForMartys,1000);});
//loadScript("/js/martyScan.js", function(){setTimeout(scanForMartys,1000);});


// ----------------------------
// local IP discovery tool from net.ipcalf.com

var localIP = null;

// NOTE: window.RTCPeerConnection is "not a constructor" in FF22/23
var RTCPeerConnection = /*window.RTCPeerConnection ||*/ window.webkitRTCPeerConnection || window.mozRTCPeerConnection;

if (RTCPeerConnection) (function () {
    var rtc = new RTCPeerConnection({iceServers:[]});
    if (1 || window.mozRTCPeerConnection) {      // FF [and now Chrome!] needs a channel/stream to proceed
        rtc.createDataChannel('', {reliable:false});
    };
    
    rtc.onicecandidate = function (evt) {
        // convert the candidate to SDP so we can run it through our general parser
        // see https://twitter.com/lancestout/status/525796175425720320 for details
        if (evt.candidate) grepSDP("a="+evt.candidate.candidate);
    };
    rtc.createOffer(function (offerDesc) {
        grepSDP(offerDesc.sdp);
        rtc.setLocalDescription(offerDesc);
    }, function (e) { console.warn("offer failed", e); });
    
    
    var addrs = Object.create(null);
    addrs["0.0.0.0"] = false;
    function updateDisplay(newAddr) {
        if (newAddr in addrs) return;
        else addrs[newAddr] = true;
        var displayAddrs = Object.keys(addrs).filter(function (k) { return addrs[k]; });
        document.getElementById('list').textContent = displayAddrs.join(" or perhaps ") || "n/a";
    }
    
    function grepSDP(sdp) {
        var hosts = [];
        sdp.split('\r\n').forEach(function (line) { // c.f. http://tools.ietf.org/html/rfc4566#page-39
            if (~line.indexOf("a=candidate")) {     // http://tools.ietf.org/html/rfc4566#section-5.13
                var parts = line.split(' '),        // http://tools.ietf.org/html/rfc5245#section-15.1
                    addr = parts[4],
                    type = parts[7];
                //if (type === 'host') updateDisplay(addr);
                console.log("1: addr: " + addr + " || type: " + type);
                if (type === 'host' && addr != "0.0.0.0" && addr.length < 16){
                    localIP = addr;
                }
            } else if (~line.indexOf("c=")) {       // http://tools.ietf.org/html/rfc4566#section-5.7
                var parts = line.split(' '),
                    addr = parts[2];
                console.log("2: addr: " + addr);
                if (addr != "0.0.0.0" && addr.length < 16){ localIP = addr;}
                updateDisplay(addr);
            }
        });
    }
})();
// end of local IP discovery

var selectorTitle = 'Marty Scanner';
martylist = [];
martyNames = [];
var marty = null;
var scanComplete = false;
var checkTimeout;
var scanResults = 0;
var ext2 = {};

function scanForMartys(ip){
    if (ip === undefined){ 
        if (localIP != null){
            var ip_parts = localIP.split(".");
            ip_parts.pop();
            ip = ip_parts.join(".");
            console.log("gonna scan: " + ip);
        } else {
            ip = "192.168.0";
        }
    }
    console.log("scanning: " + ip);
    scanRange(ip, martylist, 15000);
    checkTimeout = setTimeout(checkResults, 1000, ip);
    setTimeout(checkMartys, 16000, ip);
}

function checkResults(ip){
    console.log("scan progress: " + scanResults + "/255"); 
    if (martyNames.length != martylist.length){
        // new Martys found. redo names list and reload selector extension
        martyNames = [];
        for (m in martylist){
            martyNames.push(martylist[m][1]);
        }
        ScratchExtensions.unregister(selectorTitle);
        selectorExtension(ext2);

        console.log("martylist size: " + martylist.length);
        // if this is the first Marty found, we select it
        if (marty === null){
            console.log("First Marty, selecting " + martylist[0][1] + " on " + martylist[0][1]);
            marty = new Marty(martylist[0][0], martylist[0][1]);
        }
    }
    if (scanResults < 254){
        checkTimeout = setTimeout(checkResults, 1000, ip);
    } else {
        checkMartys(ip);
    }
}

function checkMartys(ip){
    clearTimeout(checkTimeout);
    if (martylist.length){
        scanComplete = true;
        //setMarty();
    } else if (localIP != null && ip != "192.168.0" && ip != "192.168.1" && ip != "172.24.1"){
        scanForMartys("192.168.0");
    } else if (ip == "192.168.0"){
    //    scanForMartys("172.24.1");
    //} else if (ip = "172.24.1"){
        scanForMartys("192.168.1");
    } else {
        scanComplete = true;
        martyNames.push('No Martys Found :-(');
        ScratchExtensions.unregister(selectorTitle);
        selectorExtension(ext2);
        //setMarty();
    }
}

// deprecated
/*
function setMarty(){
    if (martylist.length === 1){
        marty = new Marty(martylist[0][0], martylist[0][1]);
    } else {
        if (martylist.length > 0){
            for (m in martylist){
                martyNames.push(martylist[m][1]);
            } 
        } else {
            martyNames.push('No Martys Found :-(');
        }
        selectorExtension(ext2);
    }
    
}
*/

selectorExtension(ext2);

function select_marty(ip, name){
    if (marty != null){
        marty.socket.close();
    }
    marty = new Marty(ip, name);
}


//(function(ext) {
    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        if (marty != null){
            return {status: 2, msg: 'Ready'};
        } else {
            return {status: 1, msg: 'Scanning for Martys...'};
        }
    };

    var jointID = [];
    jointID["left hip"] = 0; jointID["left twist"] = 1; jointID["left knee"] = 2;
    jointID["right hip"] = 3; jointID["right twist"] = 4; jointID["right knee"] = 5;
    jointID["left arm"] = 6; jointID["right arm"] = 7;
    jointID["eyes"] = 8;

    var stopType = [];
    stopType['finish move'] = 0;
    stopType['freeze'] = 1;
    stopType['disable motors'] = 2;
    stopType['return to zero'] = 3;
    stopType['pause'] = 4;
    stopType['pause and disable motors'] = 5;

    ext.blocking_mode = true;

    ext.disable_motors = function(callback){
        marty.disable_motors();
        callback();
    }

    ext.hello = function(callback) {
        marty.enable_motors();
        marty.hello(1);
        if (ext.blocking_mode === true){
            setTimeout(callback, 2000);
        } else {
            callback();
        }
    };

    ext.celebrate = function(callback){
        marty.celebrate(4000);
        if (ext.blocking_mode === true){
            setTimeout(callback, 4000);
        } else {
            callback();
        }
    }

    ext.walk = function(numsteps, step_length, turn, step_time, callback){
        // this.walk = function(steps, turn, move_time, step_length, side){
        marty.walk(parseInt(numsteps), parseInt(turn), step_time*1000, parseInt(step_length));
        if (ext.blocking_mode === true){
            setTimeout(callback, numsteps*step_time*1000);
        } else {
            callback();
        }
    }

    ext.walk_forward = function(numsteps, callback){
        marty.walk(parseInt(numsteps), 0, 1800, 40);
        if (ext.blocking_mode === true){
            setTimeout(callback, numsteps*1800);
        } else {
            callback();
        }
    }

    ext.walk_backward = function(numsteps, callback){
        marty.walk(parseInt(numsteps), 0, 1800, -40);
        if (ext.blocking_mode === true){
            setTimeout(callback, numsteps*1800);   
        } else {
            callback();
        }
    }

    ext.kick = function(leg, callback){
        marty.kick(leg, 0, 2000);
        if (ext.blocking_mode === true){
            setTimeout(callback, 2000);
        } else {
            callback();
        }
    }

    ext.turn = function(direction, numsteps, callback){
      var turn = 80;
      if (direction == "right" ){
        turn = -80;
      }
      marty.walk(parseInt(numsteps), turn, 1300, 0);
      if (ext.blocking_mode === true){
        setTimeout(callback, parseInt(numsteps)*1300);
      } else {
        callback();
      }
    }

    ext.lean = function(direction, move_time, callback){
        marty.lean(direction, 50, move_time*1000);
        if (ext.blocking_mode === true){
            setTimeout(callback, move_time*1000);
        } else {
            callback();
        }
    }

    ext.circle_dance = function(direction, move_time, callback){
        marty.circle_dance(direction, move_time*1000);
        if (ext.blocking_mode === true){
            setTimeout(callback, move_time*1000);
        } else {
            callback();
        }
    }

    ext.stand_straight = function(callback){
        marty.stand_straight(2000);
        if (ext.blocking_mode === true){
            setTimeout(callback, 2000);
        } else {
            callback();
        }
    }

    ext.eyes = function(position, callback){
        var eyepos = [];
        eyepos['normal'] = 0; eyepos['angry'] = 50; eyepos['excited'] = -25; eyepos['wide'] = -100;
        marty.move_joint(8, eyepos[position], 100);
        if (ext.blocking_mode === true){
            setTimeout(callback, 100);  
        } else {
            callback();
        }
    }

    ext.sidestep_basic = function(side, num_steps, callback){
        ext.sidestep(side, num_steps, 1.5, 50, callback);
        return;
    }

    ext.sidestep = function(side, num_steps, step_time, step_length, callback){
        marty.sidestep(side, parseInt(num_steps), step_time*1000, parseInt(step_length));
        if (ext.blocking_mode === true){
            setTimeout(callback, num_steps*step_time*1000);
        } else {
            callback();
        }
    }

    ext.enable_motors = function(callback){
        marty.enable_motors();
        callback();
    }

    ext.moveJoint = function(joint, angle, move_time, callback){
        marty.move_joint(jointID[joint], angle, move_time*1000);
        if (ext.blocking_mode === true){
            setTimeout(callback, move_time*1000);
        } else {
            callback();
        }
    }

    ext.play_sound = function(start_freq, end_freq, duration, callback){
        marty.play_sound(parseInt(start_freq), parseInt(end_freq), parseInt(duration*1000));
        callback();
    }

    ext.lift_leg = function(leg, callback){
        var joint;
        var mult = 1;
        if (leg == 'left'){
            joint = 'left knee';
            mult = -1;
        } else {
            joint = 'right knee';
        }
        marty.move_joint(jointID[joint], 80*mult, 750);
        setTimeout(callback, 750);
    }

    ext.move_leg = function(leg, direction, callback){
        var joint;
        var mult = 1;
        if (leg == 'left'){
            joint = 'left hip';
        } else {
            joint = 'right hip';
        }
        if (direction == 'forward'){mult = -1};
        marty.move_joint(jointID[joint], 10*mult, 750);
        setTimeout(callback, 750);
    }

    ext.lower_leg = function(callback){
        var left_knee = marty.get_sensor("mp" + jointID['left knee']);
        var right_knee = marty.get_sensor("mp" + jointID['right knee']);
        if (left_knee === null || right_knee === null){
            setTimeout(ext.lower_leg, 200, callback);
            return;
        }
        if (right_knee > 0 && right_knee > left_knee){
            marty.move_joint(jointID['right knee'], left_knee, 500);
        } else {
            marty.move_joint(jointID['left knee'], right_knee, 500);
        }
        setTimeout(callback, 500);
    }

    ext.get_sensor = function(sensor_name, callback){
        console.log("getting sensor " + sensor_name);
        var response = marty.get_sensor(sensor_name);
        if (response === null){
            setTimeout(ext.get_sensor, 100, sensor_name, callback);
        } else {
            callback(response);
        }
    }

    ext.getGPIO = function(gpio_id, callback){
        console.log("getting sensor gpio" + gpio_id);
        var response = marty.get_sensor("gpio" + gpio_id);
        if (response === null){
            setTimeout(ext.getGPIO, 100, gpio_id, callback);
        } else {
            callback(response);
        }
    }

    ext.get_accel = function(axis, callback){
        var axisID = [];
        axisID['X axis'] = 0; axisID['Y axis'] = 1; axisID['Z axis'] = 2;
        var response = marty.get_sensor("acc" + axisID[axis]);
        if (response === null){
            setTimeout(ext.get_accel, 100, axis, callback);
        } else {
            callback(response);
        }
    }

    ext.get_battery = function(callback){
        var response = marty.get_sensor("battery");
        if (response === null){
            setTimeout(ext.get_battery, 100, callback);
        } else {
            callback(response);
        }
    }

    ext.get_motor_current = function(joint_name, callback){
        ext.get_sensor("mc" + jointID[joint_name], callback);
    }

    ext.get_prox_sensor = function(callback){
        var response = marty.get_sensor("prox");
        if (response === null){
            setTimeout(ext.get_prox_sensor, 100, callback);
        } else {
            callback(response);
        }
    }

    ext.set_blocking_mode = function(enabled){
        if (enabled === 'enabled'){
            ext.blocking_mode = true;
        } else {
            ext.blocking_mode = false;
        }
    }

    ext.stop = function(stop_type, callback){
        marty.stop(stopType[stop_type]);
        callback();
    }
/*
    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            // Block type, block name, function name
            ['w', 'Turn off motors', 'disable_motors'],
            ['w', 'Get Ready', 'hello'],
            ['w', 'Wiggle', 'celebrate'],
            ['w', 'Walk %n steps forward', 'walk_forward', 2],
            ['w', 'Walk %n steps backward', 'walk_backward', 2],
            ['w', 'Turn %m.leg %n steps', 'turn', 'left', 2],
            ['w', 'Kick %m.leg leg', 'kick', 'left'],
            ['w', 'Walk: %n steps, step length: %n, turn amount: %n, step time: %n', 'walk', 2, 40, 10, 1.8],
            ['w', 'Lean %m.directions in %n seconds', 'lean', 'left', 1.5],
            ['w', 'Stand Straight', 'stand_straight'],
            ['w', 'Eyes %m.eyes', 'eyes', 'normal'],
            ['w', 'Circle Dance %m.leg in %n seconds', 'circle_dance', 'left', 3.0],
            ['w', 'Lift %m.leg leg', 'lift_leg', 'left'],
            ['w', 'Move %m.leg leg %m.saggital', 'move_leg', 'left', 'forward'],
            ['w', 'Lower leg', 'lower_leg'],
            ['w', 'Enable Motors', 'enable_motors'],
            ['w', 'Move %m.joints to %n degrees in %n secs', 'moveJoint', 'right hip', 0, 0],
            ['w', 'Play sound: start at %n Hz, finish at %n Hz, over %n seconds', 'play_sound', 261, 523, 1.0],
            ['R', 'Input %m.gpios', 'getGPIO', '0'],
            ['R', '%m.motorCurrents motor current', 'get_motor_current', 'left hip'],
            ['R', 'Accelerometer %m.accel', 'get_accel', 'Z axis'],
            ['R', 'Battery voltage', 'get_battery'],
            [' ', 'Set blocking mode %m.enabled', 'set_blocking_mode', 'enabled'],
            ['w', 'Stop and %m.stopTypes', 'stop', 'return to zero']
        ],
        menus:{
            leg: ['left', 'right'],
            directions: ['left', 'right', 'forward', 'backward'],
            eyes: ['normal', 'wide', 'angry', 'excited'],
            gpios: ['0', '1', '2', '3', '4', '5', '6', '7'],
            motorCurrents: ['right hip', 'right twist', 'right knee', 'left hip', 'left twist', 'left knee', 'right arm', 'left arm'],
            joints: ['right hip', 'right twist', 'right knee', 'left hip', 'left twist', 'left knee', 'right arm', 'left arm', 'eyes'],
            accel: ['X axis', 'Y axis', 'Z axis'],
            enabled: ['enabled', 'disabled'],
            saggital: ['forward', 'backward'],
            stopTypes: ['finish move', 'freeze', 'disable motors', 'return to zero', 'pause', 'pause and disable motors']
        }
    };

    testFunc();

    // Register the extension
    ScratchExtensions.register('Marty Scratch', descriptor, ext);
})({});*/

function selectorExtension(ext){
    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        if (scanComplete === true){
            if (martylist.length){
                return {status: 2, msg: 'Found ' + martylist.length + 'Martys'};
            } else {
                return {status: 0, msg: 'Scan complete. No Martys Found :-('};
            }
        } else {
            return {status: 1, msg: 'Scanning...'};
        }
    };

    var mlist = [];
    var addMartyTries = 0;
    ext.addMartyCallback = function(callback){
        if (mlist.length > 0){
            select_marty(mlist[0][0], mlist[0][1]);
            callback(true);
        } else {
            if (addMartyTries < 15){
                addMartyTries++;
                setTimeout(ext.addMartyCallback, 200, callback);
            } else {
                callback(false);
            }
        }
    }

    ext.addMartyByIP = function(ip, callback) {
        mlist = [];
        addMartyTries = 0;
        sendRequest(ip, mlist);
        setTimeout(ext.addMartyCallback, 200, callback );
    };

    ext.add_marty_by_name = function(name, callback){
        for (m in martylist){
            if (martylist[m][1] == name){
                select_marty(martylist[m][0], martylist[m][1]);
            }
        }
        setTimeout(callback, 500);
    }

    ext.rescan = function(name){
        if (scanComplete === true){
            scanComplete = false;
            martylist = [];
            scanForMartys();
        } else {
            alert("Scanning not yet complete. Please wait for scanning to finish before re-scanning");
        }
    }

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            // Block type, block name, function name
            ['w', 'Select Marty %m.martys', 'add_marty_by_name', martyNames[0]],
            ['w', 'Select Marty on IP: %s', 'addMartyByIP', '192.168.0.10'],
            [' ', 'Rescan', 'rescan']
        ],
        menus: {
            martys : martyNames,
        }
    };

    // Register the extension
    ScratchExtensions.register(selectorTitle, descriptor, ext);
}