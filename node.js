import express from 'express';
import fs from 'fs';
import cors from 'cors';
import path from 'path';
import session from 'express-session';
import 'vector-math';

import { CoordsToGroundVector, groundVectorToCoords, groundVectorToLocationVector } from "./calcTools.js";

import { Orbitalmodell } from "./orbitModell.js";


// Simulation init

let groundVector = new Vector(0, 0, 0); //x,y,z (xy-Ebene = Äquator); Position on the ground
let locationVector = new Vector(0, 0, 0); // Position mit Höhe einberechnet

let globalFacingVector = new Vector(0, 0, 0); // beschreibt "vorwärts" (local pitch und yaw = 0) an der aktuellen Position im Orbit und in der Athmosphäre

let facingVector = new Vector(0, 0, 0); // Blickrichtung des Fahrzeuges an den globalen Koordinatenachsen ausgerichtet

let thrustVector = new Vector(0, 0, 0); // Der Schubvektor des Fahrzeugs, an den globalen Koordinatenachsen ausgerichtet

let gv = CoordsToGroundVector(0, 0)
console.log(gv)
groundVector = new Vector(gv.x, gv.y, gv.z);
let lv = groundVectorToLocationVector(gv.x, gv.y, gv.z, 0);
locationVector = new Vector(lv.x, lv.y, lv.z)
let gfv = groundVectorToLocalFacingVector(gv.x, gv.y, gv.z);







const orbit = new Orbitalmodell();






const app = express();
//console.log(path.dirname());
//console.log(__dirname);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join('./', "public")));
app.use(session({
    secret: "super-secret-agency-key",
    resave: false,
    saveUninitialized: false
}))

// import everything hardware
/////////////
// IMPORTS //
/////////////
import { FlightTerminationSystem } from "./systems/hardware/fts.js";


import { SSME, SSMEhandler } from "./systems/hardware/ssme.js"
import { APU } from "./systems/hardware/apu.js";
import { ET } from "./systems/hardware/et.js";
import { SRB, SRBHandler } from "./systems/hardware/srb.js";
import { Pod, RCSGroup, RCSThruster, RCSPod, OMSPod, ReactionControlSystemController, RCSExtenderTank } from "./systems/hardware/rcs+oms.js";

import { CLASComputer } from "./systems/hardware/clas.js";
import { GPC } from "./systems/hardware/gpc.js";
import { programHandler } from "./systems/hardware/programHandler.js";
import { IMU } from './systems/hardware/imu.js';

import { maneuverHandler } from "./systems/hardware/maneuverHandler.js";
import { FlyByWireComputer } from "./systems/hardware/fly_by_wire.js";




import { RudderBrake, BodyFlap, Elevon } from "./systems/hardware/avionics.js";


/*import { PFD1CDRController } from "./software/pfd1CDRController.js";
import { PFD1PLTController } from "./software/pfd1PLTController.js";
import { PFD2CDRController } from "./software/pfd2CDRController.js";
import { PFD2PLTController } from "./software/pfd2PLTController.js";
import { SFD1CDRController } from "./software/sfd1CDRController.js";*/

import { GearController, Gear } from "./systems/hardware/gearController.js";

import { Parachute } from "./systems/hardware/parachutes.js";

import { GPSComputer, AbortGuidance } from "./systems/hardware/gpsComputer.js";
import { ok } from 'assert';






//////////////////
// SYSTEM SETUP //
//////////////////
const FTS = new FlightTerminationSystem();


const clasComputer = new CLASComputer();

const gpc1 = new GPC(1);
const gpc2 = new GPC(2);
const gpc3 = new GPC(3);
const gpc4 = new GPC(4);
const gpc5 = new GPC(5);


const programmHandler = new programHandler();


const imu = new IMU();
const maneuverHandlerTool = new maneuverHandler();
const fbwComp = new FlyByWireComputer();


const launchPoint = { lat: 0, lon: 0 };
const abortSites = [{
    name: "template",
    icao: "temp",
    lat: 0,
    lon: 0,
    runways: [],
    type: "template",
    minMET: 0,
    maxMET: -1
}];

const gps = new GPSComputer(launchPoint, 78.5);
const abortGuidance = new AbortGuidance(abortSites);




// Screens
/**/



// Main Engines
const ctrSSME = new SSME();
const lSSME = new SSME();
const rSSME = new SSME();

const ssmeHandler = new SSMEhandler(ctrSSME, lSSME, rSSME);


// APU

const APUa = new APU("APUa");
const APUb = new APU("APUb");
const APUc = new APU("APUc");

// OMS

const OMSl = new OMSPod("OMS L");
const OMSr = new OMSPod("OMS R");


// RCS


//RCS Front Up
const RCSfU = new RCSGroup("RCS Front Up", [new RCSThruster(), new RCSThruster(), new RCSThruster]);
const RCSfF = new RCSGroup("RCS Front Forward", [new RCSThruster(), new RCSThruster(), new RCSThruster()]);

//RCS Front Left
const RCSfL = new RCSGroup("RCS Front Left", [new RCSThruster(), new RCSThruster()]);
const RCSfLrC = new RCSGroup("RCS Front Left Roll Clockwise", [new RCSThruster()]);
const RCSfLrA = new RCSGroup("RCS Front Left Roll Anticlockwise", [new RCSThruster()]);

//RCS Front Right
const RCSfR = new RCSGroup("RCS Front Right", [new RCSThruster(), new RCSThruster()]);
const RCSfRrA = new RCSGroup("RCS Front Right Roll Anticlockwise", [new RCSThruster()]);
const RCSfRrC = new RCSGroup("RCS Front Right Roll Clockwise", [new RCSThruster()]);

const RCSfP = new RCSPod("RCS Front", [RCSfU, RCSfF, RCSfL, RCSfLrC, RCSfLrA, RCSfR, RCSfRrA, RCSfRrC]);
const PodFront = new Pod("Front", [], [RCSfP]);



//RCS Aft Left
const RCSaLu = new RCSGroup("RCS Aft Left Up", [new RCSThruster(), new RCSThruster(), new RCSThruster()]);
const RCSaLl = new RCSGroup("RCS Aft Left Left", [new RCSThruster(), new RCSThruster(), new RCSThruster(), new RCSThruster()]);
const RCSaLa = new RCSGroup("RCS Aft Left Aft", [new RCSThruster(), new RCSThruster()]);
const RCSaLd = new RCSGroup("RCS Aft Left Down", [new RCSThruster(), new RCSThruster()]);

const RCSaLp = new RCSPod("PCS Aft Left", [RCSaLu, RCSaLl, RCSaLa, RCSaLd]);
const PodAftLeft = new Pod("Aft Left", [OMSl], [RCSaLp]);


//RCS Aft Right
const RCSaRu = new RCSGroup("RCS Aft Right Up", [new RCSThruster(), new RCSThruster(), new RCSThruster()]);
const RCSaRr = new RCSGroup("RCS Aft Right Left", [new RCSThruster(), new RCSThruster(), new RCSThruster(), new RCSThruster()]);
const RCSaRa = new RCSGroup("RCS Aft Right Aft", [new RCSThruster(), new RCSThruster()]);
const RCSaRd = new RCSGroup("RCS Aft Right Down", [new RCSThruster(), new RCSThruster()]);

const RCSaRp = new RCSPod("PCS Aft Right", [RCSaRu, RCSaRr, RCSaRa, RCSaRd]);
const PodAftRight = new Pod("Aft Right", [OMSr], [RCSaRp]);

const RCS_OMS = new ReactionControlSystemController([PodFront, PodAftLeft, PodAftRight]);

// ET

const et = new ET();


// SRB

const SRBl = new SRB();
const SRBr = new SRB();

const srbHandler = new SRBHandler(SRBl, SRBr);


// Landing Gear

const fwdGear = new Gear();
const lGear = new Gear();
const rGear = new Gear();

const gearController = new GearController(fwdGear, lGear, rGear);


// Avionics
const LelevonA = new Elevon();
const LelevonB = new Elevon();
const RelevonB = new Elevon();
const RelevonA = new Elevon();

const bodyflap = new BodyFlap();

const rudderBrake = new RudderBrake();

// Parachutes

const brakeChute = new Parachute();
const mainAchute = new Parachute();
const mainBchute = new Parachute();
const mainCchute = new Parachute();
const backUpChute = new Parachute();









// Dynamic (Mission dependand)

const RCSExtA = new RCSExtenderTank("1", 100, 100, 150, 150);
const RCSExtB = new RCSExtenderTank("2", 100, 100, 150, 150);
const RCSExtC = new RCSExtenderTank("3", 100, 100, 150, 150);
const RCSExtD = new RCSExtenderTank("4", 100, 100, 150, 150);
const RCSExtE = new RCSExtenderTank("5", 100, 100, 150, 150);




///////////////////
// ORBITER CLASS //
///////////////////

class Orbiter {
    constructor() {
        this.inAbort = false;
        this.inIntactAbort = false;
        this.intactAbortMode = {
            threeEngine: "",
            twoEngine: "",
            singleEngine: ""
        };
        this.fts = FTS;
        this.computers = {
            clasComputer: clasComputer,
            gpc1: gpc1,
            gpc2: gpc2,
            gpc3: gpc3,
            gpc4: gpc4,
            gpc5: gpc5,
            programHandler: programmHandler,
            maneuverHandlerTool: maneuverHandlerTool,
            fbwComp: fbwComp,
            gpsComp: gps,
            guidanceComp: abortGuidance
        };
        this.screens = {
            cdr_pfd2: "menu",
            cdr_sfd1: "menu",
            plt_pfd2: "menu",
        };
        this.IMU = imu;
        this.positionData = {
            mode: "global",
            x_accel: 0,
            y_accel: 0,
            z_accel: 0,
            x_rate: 0,
            y_rate: 0,
            z_rate: 0,
            downrange: 0,
            altitude: 0,
            crossrange: 0
        }
        this.gear = {
            fwd: fwdGear,
            l: lGear,
            r: rGear
        };
        this.ssme = {
            ctr: ctrSSME,
            l: lSSME,
            r: rSSME
        };
        this.rcsController = RCS_OMS;
        this.rcsExtenderTanks = [];
        this.oms = {
            l: OMSl,
            r: OMSr
        };
        this.APUs = {
            APUa: APUa,
            APUb: APUb,
            APUc: APUc
        }
        this.et = et;
        this.SRBs = {
            l: SRBl,
            r: SRBr
        };
        this.srbHandler = srbHandler;
        this.avionics = {
            LelevonA: LelevonA,
            LelevonB: LelevonB,
            RelevonB: RelevonB,
            RelevonA: RelevonA,
            rudderBrake: rudderBrake,
            bodyflap: bodyflap
        };
        this.radarAlt = {
            mtr: 0,
            ft: 0
        };
        this.gearController = gearController;
        this.parachutes = {
            brake: brakeChute,
            mainA: mainAchute,
            mainB: mainBchute,
            mainC: mainCchute,
            backUpA: backUpChute
        };
        this.ssmeHandler = ssmeHandler;
        this.mission = {
            met: 0,
            telemetryPos: {
                V: 0,
                alt_m: 0,
                downrange_m: 0,
                mach: 0
            }
        };







        this.software = {
            metTimer: null,
            pilotTakeover: false,
            srbSepMode: "auto",
            etSepMode: false,


            missionMode: ""
        };
        this.switches = {
            clasSTATE: "1",
            omsl: "1",
            omsr: "1",
            srbMANAUTOandSEP: "0",
            etMANAUTOandSEP: "0",
            gear: "0"
        };
        this.knobs = {};

    }
    metUpdaterLoop() {
        const groundChannelPos = new BroadcastChannel('ground_request_pos');

        const metTimer = setInterval(() => {
            //console.log("met: " + this.mission.met + ", mode: " + this.software.missionMode)
            OV.mission.met++;
            switch (this.software.missionMode) {
                case "auto-sequence":
                    if (OV.inIntactAbort && OV.mission.met <= 0) {
                        console.log('Intact Pad Abort!');
                        OV.computers.programHandler.exec('SSMEshutDown', OV.computers.gpc2);
                        clearInterval(metTimer);
                    }
                    break;
                case "ascent":
                    groundChannelPos.postMessage({ type: 'getTrajectory', met: OV.mission.met });
                    if (!this.inAbort && !this.inIntactAbort) {
                        OV.computers.programHandler.exec('ascentHandler', OV.computers.gpc4);
                    }
                    break;
                case "clas-abort":
                    break;
                case "intact-abort":
                    break;
            }
        }, 1000);
    }
    GroundLaunchSequencer() {
        const eventDownlink = new BroadcastChannel("downlink_event");
        this.mission.met = -60;
        const GLS = setInterval(() => {
            switch (this.mission.met) {
                case -450:
                    console.log("Crew Access Arm Retract");
                    break;
                case -300:
                    this.APUs.APUa.start();
                    eventDownlink.postMessage(97);
                    this.APUs.APUb.start();
                    eventDownlink.postMessage(98);
                    this.APUs.APUc.start();
                    eventDownlink.postMessage(99);
                    break;
                case -235:
                    this.computers.programHandler.exec("SSME-gimbal-test", this.computers.gpc1);
                    eventDownlink.postMessage(465);
                    this.computers.programHandler.exec("AeroSurface-test", this.computers.gpc3);
                    eventDownlink.postMessage(473);
                    break;
                case -175:
                    console.log("Gaseous Oxygen Vent Arm Retract");
                    break;
                case -55:
                    console.log("Switch to Internal Power");
                    break;
                case -31:
                    this.computers.programHandler.exec("autoSequenceAndAscent", this.computers.gpc2);
                    eventDownlink.postMessage(7);
                    break;
                case -16:
                    console.log("Sound Suppression System");
                    break;
                case -10:
                    console.log("Hydrogen Burn Off");
                    break;
                case 19:
                    console.log("Pad Safing");
                    clearInterval(GLS);
                    break;
            }
        }, 1000);
    }
}










globalThis.OV = new Orbiter();

console.log(OV);



// Dynamic

OV.rcsExtenderTanks.push(RCSExtA);
OV.rcsExtenderTanks.push(RCSExtB);
OV.rcsExtenderTanks.push(RCSExtC);
OV.rcsExtenderTanks.push(RCSExtD);
OV.rcsExtenderTanks.push(RCSExtE);







//////////////////////
// API ORBITER SIDE //
//////////////////////


app.get("/api/ov", (req, res) => {
    //console.log("api/ov")
    res.json(OV);
});

app.post("/launch", (req, res) => {
    console.log("Launch!");
    OV.metUpdaterLoop();
    OV.GroundLaunchSequencer();
    OV.IMU.update();
    res.json({ ok: true })
})

// CLAS
app.post("/api/ov/abort", (req, res) => {
    OV.computers.programHandler.exec("abort", OV.computers.gpc1);
    res.json({ ok: true });
})

app.post("/api/ov/clas/arm", (req, res) => {
    OV.computers.clasComputer.armState = true;
    res.json({ ok: true });
})
app.post("/api/ov/clas/off", (req, res) => {
    OV.computers.clasComputer.armState = false;
    res.json({ ok: true });
})




// Landing Gear

app.post("/api/ov/gearDown", (req, res) => {
    OV.gearController.release();
    res.json({ ok: true });
});



// OMS

app.post("/api/ov/lOMS/arm", (req, res) => {
    OV.oms.l.enableArm();
    res.json({ ok: true });
})
app.post("/api/ov/lOMS/disarm", (req, res) => {
    OV.oms.l.disableArm();
    res.json({ ok: true });
})
app.post("/api/ov/rOMS/arm", (req, res) => {
    OV.oms.r.enableArm();
    res.json({ ok: true });
})
app.post("/api/ov/rOMS/disarm", (req, res) => {
    OV.oms.r.disableArm();
    res.json({ ok: true });
})




// Control Takeover

app.post("/api/ov/takeOver", (req, res) => {
    console.log("aaa");
    OV.software.pilotTakeover = true;
    res.json({ ok: true })
})
app.post("/api/ov/takeOverReset", (req, res) => {
    console.log("bbb");
    OV.software.pilotTakeover = false;
    res.json({ ok: true })
})
const MAX_RATE = 90; // deg/sec
let yaw = 0;
app.post("/api/ov/mergeControls", (req, res) => {
    console.log(req.body);
    const { axis } = req.body;
    console.log(axis)
    let pitchRate;
    if (OV.IMU.roll > 90 || OV.IMU.roll < -90) {
        pitchRate = axis[1] * MAX_RATE / 50 * -1;
    } else {
        pitchRate = axis[1] * MAX_RATE / 50;
    }
    const rollRate = -(axis[0] * MAX_RATE / 10);
    const yawRate = yaw || 0;
    res.json({ ok: true })
})



// Screens 

app.post("/api/ov/cdr_pfd2", (req, res) => {
    const { tab } = req.body;
    console.log(tab)
    OV.screens.cdr_pfd2 = tab;
    res.json({ ok: true })
})

app.post("/api/ov/cdr_sfd1", (req, res) => {
    const { tab } = req.body;
    console.log(tab)
    OV.screens.cdr_sfd1 = tab;
    res.json({ ok: true })
})



// Abort Modes

app.post("/api/ov/abortMode/SE", (req, res) => {
    const { mode } = req.body;
    OV.intactAbortMode.singleEngine = mode;
})
app.post("/api/ov/abortMode/2E", (req, res) => {
    const { mode } = req.body;
    OV.intactAbortMode.twoEngine = mode;
})

app.post("/api/ov/abortMode/3E", (req, res) => {
    const { mode } = req.body;
    OV.intactAbortMode.threeEngine = mode;
})




// Cockpit

app.post("/api/cockpit/switches/:switch", (req, res) => {
    let switchId = req.params.switch;
    const { pos } = req.body;

    switchId = switchId.toString();
    console.log("ID: " + switchId + ", " + pos);
    
        Object(OV.switches)[switchId] = pos;
        console.log(Object(OV.switches))
        console.log(OV.switches.switchId)

    //console.log(global)
    res.json({ ok: true });
})








//////////////////////////////
// API MISSION CONTROL SIDE //
//////////////////////////////

const eventDownlink = new BroadcastChannel('downlink_event');
let eventCodeHistory = [];
eventDownlink.onmessage = (e) => {
    eventCodeHistory.push([new Date(), e.data]);
}

app.get("/api/mc/ov", (req, res) => {
    res.json(OV);
});

app.post("/api/mc/terminate", (req, res) => {
    const { part } = req.body;
    const fts_channel = new BroadcastChannel("FTS Uplink");
    fts_channel.postMessage(["terminateConfirm", part])
})

app.get("/api/mc/ov/events", (req, res) => {
    res.json(eventCodeHistory);
})






///////////////////
// SYSTEM RUNNER //
///////////////////

setInterval(() => { //SSME Handler
    OV.ssmeHandler.update();
}, 50); // 20 Hz (matches your GPC / IMU rate)

setInterval(() => { //ET Fuel Deplete
    if (OV) {
        OV.et.drain(OV.ssme.ctr, OV.ssme.l, OV.ssme.r);
    }
    //console.log(OV.et);
}, 100)

setInterval(() => {
    if (OV) {
        if (OV.SRBs.l.ignited && OV.SRBs.l.propellantMass > 0) {
            OV.SRBs.l.propellantMass -= 4028;
        }
        if (OV.SRBs.r.ignited && OV.SRBs.r.propellantMass > 0) {
            OV.SRBs.r.propellantMass -= 4028;
        }
    }
}, 1000);

// Pitch/Yaw in Grad → Richtung im Raum
function getThrustVector(pitchDeg, yawDeg) {
    const pitch = pitchDeg * Math.PI / 180;
    const yaw = yawDeg * Math.PI / 180;

    // Annahme: z = vertikal, x = horizontal Richtung des Fluges
    const x = Math.cos(pitch) * Math.sin(yaw);
    const y = Math.sin(pitch);         // vertikalkomponente
    const z = Math.cos(pitch) * Math.cos(yaw);

    return { x, y, z };
}

let vel = 1;
let height = 0;
let dr = 0;
let aero;
const physicsCycle = setInterval(() => {
    let totalMass = 0;
    let totalForce = 0;
    let accel = 0;
    let accelL = 0;
    let cw = 0;
    if (OV) {
        totalMass += 125000;
        if (!OV.et.jettisoned) {
            totalMass += (OV.et.emptyMass + OV.et.lox + OV.et.lh2);
        }
        if (!OV.SRBs.l.seperated) {
            totalMass += (OV.SRBs.l.propellantMass + OV.SRBs.l.emptyMass);
            if (OV.SRBs.l.ignited) {
                totalForce += 13300000;
            }
        }
        if (!OV.SRBs.r.seperated) {
            totalMass += (OV.SRBs.r.propellantMass + OV.SRBs.r.emptyMass);
            if (OV.SRBs.r.ignited) {
                totalForce += 13300000;
            }
        }
        totalForce += (((OV.ssme.ctr.thrust * 2278000) / 100) / 10 + ((OV.ssme.l.thrust * 2278000) / 100) / 10 + ((OV.ssme.r.thrust * 2278000) / 100) / 10);
        if (vel === NaN) { vel = 1 }
        aero = computeAthmospere(height, vel * 3.6, 10);
        if (totalForce > 0) {
            //console.log(aero)
            cw = 1 / (aero.dynamic_pressure * 249909);
            if (cw === NaN) { cw = 1; }
            accelL = cw * aero.density * (249909 / (2 * totalMass)) * vel * vel;
            if (totalForce / totalMass > 0.35) {
                accel = totalForce / totalMass;
                if (accel > 10) { accel = accel / 2 } else if (accel < 3) { accel = accel * 9.81 }
                accel = accel - accelL;
                vel = accel * 0.1 + vel;
                if (OV.IMU.pitch > 89) {
                    height += vel / 10;
                } else if (OV.IMU.pitch < 2) {
                    dr += vel / 10;
                } else {
                    let h = ((vel) * Math.sin((Math.PI / 180) * OV.IMU.pitch)) / Math.sin((Math.PI / 180) * 90);
                    height += h / 10;
                    dr += Math.sqrt(vel * vel - h * h) / 10;
                }
            }
        }
        OV.mission.telemetryPos.V = vel * 3.6;
        OV.mission.telemetryPos.alt_m = height;
        OV.mission.telemetryPos.downrange_m = dr;
        OV.mission.telemetryPos.mach = aero.mach_speed;
        //console.log("m: " + Number(totalMass).toFixed(2) + ", f: " + Number(totalForce).toFixed(2) + ", twr: " + Number(totalForce / totalMass).toFixed(2) + ", a: " + Number(accel).toFixed(2) + ", v: " + Number(vel).toFixed(2) + ", g: " + (Number((totalForce/totalMass)/9.81).toFixed(2)) + ", h: " + Number(height).toFixed(2) + ", dr: " + Number(dr).toFixed(2) + ", p: " + Number(OV.IMU.pitch).toFixed(2) + ", " + Number(Math.sin((Math.PI/180)*OV.IMU.pitch)).toFixed(2));
        if (OV.mission.met > 510) {
            clearInterval(physicsCycle);
        }
    }
}, 100);

let physicsModel = "ascent";


setInterval(() => {  // Not working right now, reworking physics and location system
    if (physicsModel == "ascent") {
        let pos = destinationPoint(0, 0, dr, 119);
        gv = CoordsToGroundVector(pos.lat, pos.lon);
        groundVector = new Vector(gv.x, gv.y, gv.z);
        lv = groundVectorToLocationVector(gv.x, gv.y, gv.z);
        locationVector = new Vector(lv.x, lv.y, lv.z);
        console.log(pos);
    }
}, 1000);









/////////////////
// SERVER INIT //
/////////////////

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server läuft auf http://0.0.0.0:${PORT}`);
});

