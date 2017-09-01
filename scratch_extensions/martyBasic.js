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

var ext = {};
loadScript("https://robotical.github.io/scratchx/scratch_extensions/martyScratch.js?v=20170901", registerExtension);


function registerExtension(){
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
            ['w', 'Sidestep %m.leg for %n step(s)', 'sidestep_basic', 'left', 1],
            ['w', 'Kick %m.leg leg', 'kick', 'left'],
//            ['w', 'Walk: %n steps, step length: %n, turn amount: %n, step time: %n', 'walk', 2, 40, 10, 1.8],
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
//            [' ', 'Set blocking mode %m.enabled', 'set_blocking_mode', 'enabled'],
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

    // Register the extension
    ScratchExtensions.register('Marty Scratch', descriptor, ext);
}
