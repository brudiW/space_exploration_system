







/////////////////////////
// IMPORT CHANNEL INIT //
/////////////////////////

const imu_bc = new BroadcastChannel("imu");

window.posSim_bc = new BroadcastChannel("posSim");




// SHUTTLE TO GROUND LOOPS (DOWNLINK)
window.groundChannelPos = new BroadcastChannel('ground_request_pos');
window.downlink = new BroadcastChannel('downlink')




// GROUND TO SHUTTLE LOOPS (UPLINK)
window.uplinkChannel = new BroadcastChannel("uplink");
//window.fts_channel = new BroadcastChannel("FTS Uplink");


// SHUTTLE INTERN
window.posSim_rc = new BroadcastChannel("posSim_rcv");
window.posSim_cmd = new BroadcastChannel("posSim_cmd");



////////////////////////////
// IMPORT CHANNEL RECEIVE //
////////////////////////////


imu_bc.onmessage = (e) => {
    if (OV) {
        const d = e.data;
        OV.imuData = d;
        //console.log(e.data);
    }
};

posSim_bc.onmessage = (e) => {
    if (OV) {
        const d = e.data;
        OV.positionData = d;
    }
}

uplinkChannel.onmessage = (e) => {
    if (OV) {
        const d = e.data;
        OV.computers.programHandler.exec(d, OV.computers.gpc1);
    }
}


// INTER ORBITER










//TO GROUND
// Orbiter side




// Orbiter-side BroadcastChannel
//window.groundChannelPos = new BroadcastChannel('ground_request_pos');

// Send MET request and receive telemetry
function sendMET(met) {
    return new Promise(resolve => {
        const listener = (e) => {
            const msg = e.data;
            if (msg.type === 'trajectoryState' && msg.met === met) {
                groundChannelPos.removeEventListener('message', listener);
                resolve(msg); // { v, alt_m, downrange_m, mach }
                //if (OV) {
                //    console.log("bbbbbb")
                //    // Only feed if not in abort
                //    if (!OV.inAbort && !OV.inIntactAbort) {
                //        computePosSimAccelForSimulator();
                //        console.log("i")
                //    }
                //}
            }
        };
        groundChannelPos.addEventListener('message', listener);

        // Send MET to ground
        groundChannelPos.postMessage({ type: 'getTrajectory', met });
    });
}

// Example: update every second
setInterval(async () => {
    if (OV) {
        const telemetry = await sendMET(OV.mission.met);
        //console.log(telemetry);
        OV.mission.telemetryPos = {
            V: telemetry.speed,
            alt_m: telemetry.altitude,
            downrange_m: telemetry.downrange,
            mach: telemetry.mach
        };
    }
}, 1000);






/////////////////////////
// TELEMETRY STORAGE
/////////////////////////
let lastTelemetry = { V: 0, alt_m: 0, downrange_m: 0, mach: 0 };
let lastTelemetryTime = Date.now();

// posSim receive channel (for the simulator)
window.posSim_rc = new BroadcastChannel("posSim_rcv");

/////////////////////////
// COMPUTE ACCELERATION VECTOR FOR SIM
/////////////////////////
function computePosSimAccelForSimulator() {
    if (!OV.mission.telemetryPos) return;

    const telemetry = OV.mission.telemetryPos; // always use current telemetry
    const now = Date.now();

    const deltaT = (now - lastTelemetryTime) / 1000; // seconds
    if (deltaT <= 0) return;

    // Approximate scalar acceleration along shuttle trajectory
    const scalarAccel = (telemetry.V - lastTelemetry.V) / deltaT;

    const imu = OV.imuData;

    // Convert scalar acceleration along shuttle trajectory to global axes
    const x_accel = scalarAccel * Math.cos(imu.pitch) * Math.cos(imu.yaw);
    const y_accel = scalarAccel * Math.sin(imu.pitch);
    const z_accel = scalarAccel * Math.cos(imu.pitch) * Math.sin(imu.yaw);

    // Send to simulator
    //console.log([x_accel, y_accel, z_accel])
    posSim_rc.postMessage([x_accel, y_accel, z_accel]);

    // Update last telemetry
    lastTelemetry = { ...telemetry };
    lastTelemetryTime = now;
}

/////////////////////////
// RUN LOOP EVERY 100ms
/////////////////////////
setInterval(() => {
    if (OV) {
        if (!OV.inAbort && !OV.inIntactAbort) {
            computePosSimAccelForSimulator();
        }
    }
}, 100);
