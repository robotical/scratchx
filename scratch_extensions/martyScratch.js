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

loadScript("./js/martyjs.js");
loadScript("./js/martyScan.js", scanForMartys);

martylist = [];
martyNames = [];
var marty = null;
function scanForMartys(){
    scanRange("192.168.0", martylist);
    //setTimeout(registerExtension, 5000, ext);
    setTimeout(setMarty, 5000);

}    

var ext2 = {};
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

function select_marty(ip, name){
    if (marty != null){
        marty.socket.close();
    }
    marty = new Marty(ip, name);
}

/*
ext = {};
function registerExtension(){
    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        if (marty != null){
            return {status: 2, msg: 'Ready'};
        } else {
            return {status: 0, msg: 'Not quite ready...'};
        }
    };

    ext.hello = function(callback) {
        marty.hello(1);
        setTimeout(callback, 2000);
    };

    ext.celebrate = function(callback){
        marty.celebrate(4000);
        setTimeout(callback, 4000);
        
    }

    ext.walk = function(numsteps, step_length, turn, step_time, callback){
        // this.walk = function(steps, turn, move_time, step_length, side){
        marty.walk(numsteps, turn, step_time*1000, step_length);
        setTimeout(callback, numsteps*step_time*1000);
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

    var jointID = [];
    jointID["left hip"] = 0; jointID["left twist"] = 1; jointID["left knee"] = 2;
    jointID["right hip"] = 3; jointID["right twist"] = 4; jointID["right knee"] = 5;
    jointID["left arm"] = 6; jointID["right arm"] = 7;
    jointID["eyes"] = 8;

    ext.get_motor_current = function(joint_name, callback){
        ext.get_sensor("mc" + jointID[joint_name], callback);
    }

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            // Block type, block name, function name
            ['w', 'Get Ready', 'hello'],
            ['w', 'Wiggle', 'celebrate'],
            ['w', 'Walk: %n steps, step length: %n, turn amount: %n, step time: %n', 'walk', 2, 40, 10, 1.8],
            ['R', 'Input %m.gpios', 'getGPIO', '0'],
            ['R', '%m.motorCurrents motor current', 'get_motor_current', 'left hip'],
            [' ', 'I\'m a new block', 'celebrate']
        ],
        menus:{
            gpios: ['0', '1', '2', '3', '4', '5', '6', '7'],
            motorCurrents: ['right hip', 'right twist', 'right knee', 'left hip', 'left twist', 'left knee', 'right arm', 'left arm'],
        }
    };

    testFunc();

    // Register the extension
    ScratchExtensions.unregister('Marty Scratch');
    ScratchExtensions.register('Marty Scratch', descriptor, ext);
}
*/
/*
function registerExtension2(ext){
    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };

    ext.my_first_block = function() {
        // Code that gets executed when the block is run
    };

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            // Block type, block name, function name
            [' ', 'my second block', 'my_second_block'],
        ]
    };

    testFunc();

    // Register the extension
    ScratchExtensions.register('Marty Scratch Extension 2', descriptor, ext);
}
*/

(function(ext) {
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

    ext.blocking_mode = true;

    ext.disable_motors = function(callback){
        marty.disable_motors();
        callback();
    }

    ext.hello = function(callback) {
        marty.hello(1);
        setTimeout(callback, 2000);
    };

    ext.celebrate = function(callback){
        marty.celebrate(4000);
        setTimeout(callback, 4000);
        //registerExtension();
    }

    ext.walk = function(numsteps, step_length, turn, step_time, callback){
        // this.walk = function(steps, turn, move_time, step_length, side){
        marty.walk(parseInt(numsteps), parseInt(turn), step_time*1000, parseInt(step_length));
        setTimeout(callback, numsteps*step_time*1000);
    }

    ext.walk_forward = function(numsteps, callback){
        marty.walk(parseInt(numsteps), 0, 1800, 40);
        setTimeout(callback, numsteps*1800);
    }

    ext.walk_backward = function(numsteps, callback){
        marty.walk(parseInt(numsteps), 0, 1800, -40);
        setTimeout(callback, numsteps*1800);   
    }

    ext.kick = function(leg, callback){
        marty.kick(leg, 0, 2000);
        setTimeout(callback, 2000);
    }

    ext.turn = function(direction, numsteps, callback){
      var turn = 80;
      if (direction == "right" ){
        turn = -80;
      }
      marty.walk(parseInt(numsteps), turn, 1300, 0);
      setTimeout(callback, parseInt(numsteps)*1300);
    }

    ext.lean = function(direction, move_time, callback){
        marty.lean(direction, 50, move_time*1000);
        setTimeout(callback, move_time*1000);
    }

    ext.circle_dance = function(direction, move_time, callback){
        marty.circle_dance(direction, move_time*1000);
        setTimeout(callback, move_time*1000);
    }

    ext.stand_straight = function(callback){
        marty.stand_straight(2000);
        setTimeout(callback, 2000);
    }

    ext.eyes = function(position, callback){
        var eyepos = [];
        eyepos['normal'] = 0; eyepos['angry'] = 50; eyepos['excited'] = -25; eyepos['wide'] = -100;
        marty.move_joint(8, eyepos[position], 100);
        setTimeout(callback, 100);  
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
        callback()
;    }

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

    ext.set_blocking_mode = function(enabled){
        if (enabled === 'enabled'){
            ext.blocking_mode = true;
        } else {
            ext.blocking_mode = false;
        }
    }

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
            ['w', 'Enable Motors', 'enable_motors'],
            ['w', 'Move %m.joints to %n degrees in %n secs', 'moveJoint', 'right hip', 0, 0],
            ['w', 'Play sound: start at %n Hz, finish at %n Hz, over %n seconds', 'play_sound', 261, 523, 1.0],
            ['R', 'Input %m.gpios', 'getGPIO', '0'],
            ['R', '%m.motorCurrents motor current', 'get_motor_current', 'left hip'],
            ['R', 'Accelerometer %m.accel', 'get_accel', 'Z axis'],
            ['R', 'Battery voltage', 'get_battery'],
            [' ', 'Set blocking mode %m.enabled', 'set_blocking_mode', 'enabled'],
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
        }
    };

    testFunc();

    // Register the extension
    ScratchExtensions.register('Marty Scratch', descriptor, ext);
})({});

function selectorExtension(ext){
    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };

    var mlist = [];
    ext.addMartyCallback = function(callback){
        if (mlist.length > 0){
            select_marty(mlist[0][0], mlist[0][1]);
            callback(true);
        } else {
            callback(false);
        }
    }

    ext.addMartyByIP = function(ip, callback) {
        mlist = [];
        sendRequest(ip, mlist);
        setTimeout(ext.addMartyCallback, 3000, callback );
    };

    ext.add_marty_by_name = function(name, callback){
        for (m in martylist){
            if (martylist[m][1] == name){
                select_marty(martylist[m][0], martylist[m][1]);
            }
        }
        setTimeout(callback, 500);
    }

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            // Block type, block name, function name
            ['w', 'Select Marty %m.martys', 'add_marty_by_name', martyNames[0]],
            ['w', 'Add Marty on IP: %s', 'addMartyByIP', '192.168.0.10'],
        ],
        menus: {
            martys : martyNames,
        }
    };

    // Register the extension
    ScratchExtensions.register('Marty Selector', descriptor, ext);
}