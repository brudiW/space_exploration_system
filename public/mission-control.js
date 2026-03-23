let OV = {};
let eventCodeHistory = [];
let selectedRoles = ["booster", "guidance", "rso"];
const eventDownlink = new BroadcastChannel('downlink_event');
function handleDisplay() {
    if (OV.mission.met < 0) {
        meth = Math.ceil(OV.mission.met / 3600) * (-1);
        metm = Math.ceil(OV.mission.met / 60) * (-1);
        mets = OV.mission.met % 60 * (-1);
        if (meth < 10) {
            meth = "-0" + meth;
        }
        if (metm < 10) {
            metm = "0" + metm;
        }
        if (mets < 10) {
            mets = "0" + mets;
        }
    } else {
        meth = Math.floor(OV.mission.met / 3600);
        metm = Math.floor(OV.mission.met / 60) % 60;
        mets = OV.mission.met % 60;
        if (meth < 10) {
            meth = "0" + meth;
        }
        if (metm < 10) {
            metm = "0" + metm;
        }
        if (mets < 10) {
            mets = "0" + mets;
        }
    }

    document.getElementById("met").innerText = `T${meth}:${metm}:${mets}`;
    if (selectedRoles.includes("guidance")) {
        document.getElementById("guidance").style.display = "inline-block";
        document.getElementById("guidance-imu").innerText = `IMU-Data\nPitch / Pitch Rate: ${Number(OV.IMU.pitch).toFixed(2)}°, ${Number(OV.IMU.prate).toFixed(2)}°/s\nRoll / Roll Rate: ${Number(OV.IMU.roll).toFixed(2)}°, ${Number(OV.IMU.rrate).toFixed(2)}°/s\nYaw / Yaw Rate: ${Number(OV.IMU.yaw).toFixed(2)}°, ${Number(OV.IMU.yrate).toFixed(2)}°/s\nMode: ${OV.IMU.yawMode}`
    }
    if (selectedRoles.includes("booster")) {
        document.getElementById("booster").style.display = "inline-block";
        document.getElementById("booster-ssme").innerText =
            `SSME\n
        Left: Throttle%: ${Number(OV.ssme.l.thrust).toFixed(2)}%, Throttle%-Target: ${Number(OV.ssme.l.targetThrust).toFixed(2)}%, Throttle Rate: ${Number(OV.ssme.l.THROTTLE_RATE).toFixed(2)}%/s, Gimbal: ${Number(OV.ssme.l.angx).toFixed(2)}°, ${Number(OV.ssme.l.angz).toFixed(2)}°\n
        Center: Throttle%: ${Number(OV.ssme.ctr.thrust).toFixed(2)}%, Throttle%-Target: ${Number(OV.ssme.ctr.targetThrust).toFixed(2)}%, Throttle Rate: ${Number(OV.ssme.ctr.THROTTLE_RATE).toFixed(2)}%/s, Gimbal: ${Number(OV.ssme.ctr.angx).toFixed(2)}°, ${Number(OV.ssme.ctr.angz).toFixed(2)}°\n
        Right: Throttle%: ${Number(OV.ssme.r.thrust).toFixed(2)}%, Throttle%-Target: ${Number(OV.ssme.r.targetThrust).toFixed(2)}%, Throttle Rate: ${Number(OV.ssme.r.THROTTLE_RATE).toFixed(2)}%/s, Gimbal: ${Number(OV.ssme.r.angx).toFixed(2)}°, ${Number(OV.ssme.r.angz).toFixed(2)}°`;
        document.getElementById("booster-srb").innerText = `SRB\n
        Left: Ignition State: ${OV.SRBs.l.ignited}, Seperation State: ${OV.SRBs.l.seperated}, Gimbal: ${Number(OV.SRBs.l.pos[0]).toFixed(2)}°, ${Number(OV.SRBs.l.pos[1]).toFixed(2)}°\n
        Right: Ignition State: ${OV.SRBs.r.ignited}, Seperation State: ${OV.SRBs.r.seperated}, Gimbal: ${Number(OV.SRBs.r.pos[0]).toFixed(2)}°, ${Number(OV.SRBs.r.pos[1]).toFixed(2)}°`
    }

    let txt = "";
    eventCodeHistory.forEach(e => {
        txt += `${e[0].toString()}, #${e[1]}\n`;
    })
    document.getElementById("eventCodeHistory").innerText = txt;
}
async function loadOV() {
    const resp = await fetch("/api/mc/ov");
    OV = await resp.json();
    const respA = await fetch("/api/mc/ov/events");
    eventCodeHistory = await respA.json();
    handleDisplay();
    requestAnimationFrame(loadOV);
}
loadOV();
eventDownlink.onmessage = (e) => {
    console.log(e.data);
}
