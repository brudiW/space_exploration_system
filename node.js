import express from 'express';
import fs from 'fs';
import cors from 'cors';
import path from 'path';
import session from 'express-session';
import THREE from 'three.js';

import { CoordsToGroundVector, groundVectorToCoords, groundVectorToLocalFacingVector, groundVectorToLocationVector, computeAthmospere, destinationPoint, distanceAndHeading } from "./calcTools.js";

import { Orbitalmodell } from "./orbitModell.js";
import { PhysicsEngine, SpaceObject, DockingPort } from './physicsEngine.js';


globalThis.physicsEngine = new PhysicsEngine();
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
import { DisplayKeyboardInterface, DynamicMemory } from './systems/hardware/dskb_memory.js';
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

import { RMS } from "./systems/hardware/rms.js";
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
const MEMORY = new DynamicMemory();
const dskb = new DisplayKeyboardInterface();


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

let eventCodeHistory = [];




// Screens
/**/

const rms = new RMS();



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
const RCSfU = new RCSGroup("RCS Front Up", [new RCSThruster(), new RCSThruster(), new RCSThruster()]);
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
let translateRate = { x: 0, y: 0, z: 0 }




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
            guidanceComp: abortGuidance,
            dskb: dskb
        };
        this.screens = {
            cdr_pfd2: "menu",
            cdr_sfd1: "menu",
            plt_pfd2: "menu",
        };
        this.IMU = imu;
        this.RMS = rms;
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
        this.memory = MEMORY;
        this.gearController = gearController;
        this.parachutes = {
            brake: brakeChute,
            mainA: mainAchute,
            mainB: mainBchute,
            mainC: mainCchute,
            backUpA: backUpChute
        };
        this.dragChute = {
            deployed: false,
            jettisoned: false
        }
        this.brakes = {
            applied: false
        }
        this.ssmeHandler = ssmeHandler;
        this.mission = {
            met: 0,
            telemetryPos: {
                V: 0,
                alt_m: 0,
                downrange_m: 0,
                mach: 0,
                g: 0
            }
        };







        this.software = {
            metTimer: null,
            pilotTakeover: false,
            srbSepMode: "auto", //"auto/man"
            etSepMode: false, // true = man
            ssmeShutdownInhibit: false,
            onPad: true,


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
                    if ((OV.inIntactAbort || OV.inAbort) && OV.mission.met <= 0) {
                        console.log('Intact Pad Abort!');
                        OV.computers.programHandler.exec('SSMEshutDown', OV.computers.gpc2);

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
        this.mission.met = -32;
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
    res.json({ ok: true })
})
app.post("/rtls", (req, res) => {
    OV.computers.maneuverHandlerTool.maneuverTo({ pitch: -179, roll: 0, yaw: 76.7 });
    res.json({ ok: true })
})
app.post("/entry", (req, res) => {
    physicsModel = "entry";
    res.json({ ok: true })
})
app.post("/deorbit", (req, res) => {
    OV.rcsController.pods[1].omsPod[0].throttle = 100.0;
    OV.rcsController.pods[2].omsPod[0].throttle = 100.0;
    setInterval(() => {
        OV.rcsController.pods[1].omsPod[0].throttle = 0.0;
        OV.rcsController.pods[2].omsPod[0].throttle = 0.0;
    }, 135000);
    res.json({ ok: true })
})

app.post("/ISS/dock", (req, res) => {
    physicsEngine.physicsObjects['ISS'].dockingPorts[0].dock(physicsEngine.physicsObjects['OV']);
    res.json({ ok: true })
})


// CLAS

app.post("/api/ov/abort", (req, res) => {
    OV.computers.clasComputer.trigger();
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



// CLAS PARACHUTES

app.post("/api/ov/clas/chutes/brake/deploy", (req, res) => {
    OV.parachutes.brake.deploy();
    res.json({ ok: true });
})

app.post("/api/ov/clas/chutes/mainA/deploy", (req, res) => {
    OV.parachutes.mainA.deploy();
    res.json({ ok: true });
})

app.post("/api/ov/clas/chutes/mainB/deploy", (req, res) => {
    OV.parachutes.mainB.deploy();
    res.json({ ok: true });
})

app.post("/api/ov/clas/chutes/mainC/deploy", (req, res) => {
    OV.parachutes.mainC.deploy();
    res.json({ ok: true });
})

app.post("/api/ov/clas/chutes/backUp/deploy", (req, res) => {
    OV.parachutes.backUpA.deploy();
    res.json({ ok: true });
})

app.post("/api/ov/clas/chutes/brake/cut", (req, res) => {
    OV.parachutes.brake.cut();
    res.json({ ok: true });
})

app.post("/api/ov/clas/chutes/mainA/cut", (req, res) => {
    OV.parachutes.mainA.cut();
    res.json({ ok: true });
})

app.post("/api/ov/clas/chutes/mainB/cut", (req, res) => {
    OV.parachutes.mainB.cut();
    res.json({ ok: true });
})

app.post("/api/ov/clas/chutes/mainC/cut", (req, res) => {
    OV.parachutes.mainC.cut();
    res.json({ ok: true });
})

app.post("/api/ov/clas/chutes/backUp/cut", (req, res) => {
    OV.parachutes.backUpA.cut();
    res.json({ ok: true });
})



// SSME

app.post('/api/ov/ssme/l/shutdown', (req, res) => {
    OV.ssme.l.shutDown();
    res.json({ ok: true });
})
app.post('/api/ov/ssme/ctr/shutdown', (req, res) => {
    OV.ssme.ctr.shutDown();
    res.json({ ok: true });
})
app.post('/api/ov/ssme/r/shutdown', (req, res) => {
    OV.ssme.r.shutDown();
    res.json({ ok: true });
})
app.post('/api/ov/ssme/shutdown', (req, res) => {
    globalThis.OV.ssmeHandler.shutDown();
    res.json({ ok: true });
})
app.post('/api/ov/ssme/shutdownInhibit', (req, res) => {
    OV.software.ssmeShutdownInhibit = !OV.software.ssmeShutdownInhibit;
    res.json({ ok: true })
})



// SRB

app.post("/api/ov/srb/sepMode", (req, res) => {
    const { mode } = req.body;
    OV.software.srbSepMode = mode;
    res.json({ ok: true })
})

app.post("/api/ov/srb/sep", (req, res) => {
    if (OV.software.srbSepMode == "man/auto") {
        OV.srbHandler.seperate();
    }
    res.json({ ok: true })
})



// ET

app.post("/api/ov/et/sepMode", (req, res) => {
    const { mode } = req.body;
    OV.software.etSepMode = mode;
    res.json({ ok: true })
})

app.post("/api/ov/et/sep", (req, res) => {
    if (OV.software.etSepMode) {
        OV.et.seperate();
    }
    res.json({ ok: true })
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




// Control Takeover / IMU / RCS

app.post("/api/ov/imu/setPos", (req, res) => {
    const { axis } = req.body;
})
app.post("/api/ov/imu/resetPos", (req, res) => {
    OV.IMU.pitch = 0;
    OV.IMU.roll = 0;
    OV.IMU.yaw = 0;
})

app.post("/api/ov/takeOver", (req, res) => {
    //console.log("aaa");
    OV.software.pilotTakeover = true;
    res.json({ ok: true })
})
app.post("/api/ov/takeOverReset", (req, res) => {
    //console.log("bbb");
    OV.software.pilotTakeover = false;
    res.json({ ok: true })
})
const MAX_RATE = 900; // deg/sec
let yaw = 0;
app.post("/api/ov/mergeControls", (req, res) => {
    //console.log(req.body);
    const { axis } = req.body;
    //console.log(axis)
    let pitchRate;
    if (OV.IMU.roll > 90 || OV.IMU.roll < -90) {
        pitchRate = axis[1] * MAX_RATE / 10 * -1;
    } else {
        pitchRate = axis[1] * MAX_RATE / 50;
    }
    const rollRate = -(axis[0] * MAX_RATE / 10);
    const yawRate = yaw || 0;
    OV.IMU.setRates([pitchRate, rollRate, yawRate])
    res.json({ ok: true })
})
app.post("/api/ov/externalStickInput", (req, res) => {
    const { axis } = req.body;
    let pitchRate;
    if (OV.IMU.roll > 90 || OV.IMU.roll < -90) {
        pitchRate = axis[0] * MAX_RATE * -1;
    } else {
        pitchRate = axis[0] * MAX_RATE;
    }
    const rollRate = -(axis[1] * MAX_RATE);
    const yawRate = axis[2] * MAX_RATE;
    OV.IMU.setRates([pitchRate, rollRate, yawRate])
    res.json({ ok: true })
})
app.post("/api/ov/translate", (req, res) => {
    const { axis } = req.body;
    console.log(axis)
    switch (axis) {
        case "x+":
            translateRate.x += 0.00200;
            break;
        case "x-":
            translateRate.x += -0.00200;
            break;
        case "y+":
            translateRate.y += 0.00200;
            break;
        case "y-":
            translateRate.y += -0.00200;
            break;
        case "z+":
            translateRate.z += 0.00200;
            break;
        case "z-":
            translateRate.z += -0.00200;
            break;
    }
    res.json({ ok: true })
})




// Control Surfaces

app.post("/api/ov/avionics/:surface/endisable", (req, res) => {
    const surface = req.params.surface;
    switch (surface) {
        case "RelevonA":
            OV.avionics.RelevonA.disabled = !OV.avionics.RelevonA.disabled;
            break;
        case "RelevonB":
            OV.avionics.RelevonB.disabled = !OV.avionics.RelevonB.disabled;
            break;
        case "LelevonA":
            OV.avionics.LelevonA.disabled = !OV.avionics.LelevonA.disabled;
            break;
        case "LelevonB":
            OV.avionics.LelevonB.disabled = !OV.avionics.LelevonB.disabled;
            break;
        case "bodyflap":
            OV.avionics.bodyflap.disabled = !OV.avionics.bodyflap.disabled;
            break;
        case "rudderBrake":
            OV.avionics.rudderBrake.disabled = !OV.avionics.rudderBrake.disabled;
            break;
    }
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

app.post("/api/ov/intactAbort", (req, res) => {
    OV.inIntactAbort = true;
    //OV.computers.maneuverHandlerTool.maneuverTo({pitch: -179, roll: 0, yaw: 76.7})
})



// Drag Chute

app.post("/api/ov/dragChute/deploy", (req, res) => {
    OV.dragChute.deployed = true;
    OV.brakes.applied = true;
})

app.post("/api/ov/dragChute/jettison", (req, res) => {
    OV.dragChute.jettisoned = true;
})



// RMS

app.post("/api/ov/rms/:joint", (req, res) => {
    const joint = req.params.joint;
    const { direction } = req.body;
    switch (joint) {
        case "shoulderYaw":
            OV.RMS.shoulderYaw += direction;
            break;
        case "shoulderPitch":
            OV.RMS.shoulderPitch += direction;
            break;
        case "elbowPitch":
            OV.RMS.elbowPitch += direction;
            break;
        case "wristPitch":
            OV.RMS.wristPitch += direction;
            break;
        case "wristYaw":
            OV.RMS.wristYaw += direction;
            break;
    }
    if (OV.RMS.shoulderYaw > 270) {
        OV.RMS.shoulderYaw = 270;
    }
    if (OV.RMS.shoulderYaw < -90) {
        OV.RMS.shoulderYaw = -90;
    }
    if (OV.RMS.shoulderPitch < -90) {
        OV.RMS.shoulderPitch = -90;
    }
    if (OV.RMS.shoulderPitch > 55) {
        OV.RMS.shoulderPitch = 55;
    }
    if (OV.RMS.elbowPitch > 0) {
        OV.RMS.elbowPitch = 0;
    }
    if (OV.RMS.elbowPitch < -160) {
        OV.RMS.elbowPitch = -160;
    }
    if (OV.RMS.wristPitch > 120) {
        OV.RMS.wristPitch = 120;
    }
    if (OV.RMS.wristPitch < -120) {
        OV.RMS.wristPitch = -120;
    }
    if (OV.RMS.wristYaw > 120) {
        OV.RMS.wristYaw = 120;
    }
    if (OV.RMS.wristYaw < -120) {
        OV.RMS.wristYaw = -120;
    }
    res.json({ok: true})
})



// DisplayKeyboard

app.post("/api/ov/dskb/press", (req, res) => {
    const {button} = req.body;
    OV.computers.dskb.press(button)
    res.json({ok: true})
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



////////////////////
// PHYSICS ENGINE //
////////////////////

app.get("/api/sim/objects", (req, res) => {
    res.json(physicsEngine.physicsObjects);
})






OV.IMU.update();
///////////////////
// SYSTEM RUNNER //
///////////////////

setInterval(() => { //SSME Handler
    OV.ssmeHandler.update();
}, 50); // 20 Hz (matches your GPC / IMU rate)

setInterval(() => { //ET Fuel Deplete
    if (OV) {
        OV.et.drain(OV.ssme.ctr, OV.ssme.l, OV.ssme.r);
        OV.rcsController.pods.forEach(p => {p.drain()})
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

const OrbiterSpaceObject = new SpaceObject(0, "OV", { x: 6498137, y: 0, z:  0 }, { x: 1, y: 0, z: 0 }, { x: 0, y: 0, z: -7000 * 3.6 }, { x: 0, y: 1, z: 0 }, 0, 125000, true, [new DockingPort("ODS")], 249.9);
const ISS = new SpaceObject(1, "ISS", { x: 6778137, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 0, y: 0, z: -7672.3 * 3.6 }, { x: 0, y: 1, z: 0 }, 0, 125000, true, [new DockingPort("IDA2")], 100000);
physicsEngine.add(OrbiterSpaceObject);
physicsEngine.add(ISS);


const EARTH_RADIUS = 6378137;
const referenceArea = 249.9;


function getAeroCoefficients(AoAdeg, mach) {

    let cl = 0;
    let cd = 0;

    if (AoAdeg < 5) {
        cl = 0.2;
        cd = 0.2;
    }
    else if (AoAdeg < 15) {
        cl = 0.6;
        cd = 0.35;
    }
    else if (AoAdeg < 40) {
        cl = 1.0;
        cd = 1.1;
    }
    else {
        cl = 0.8;
        cd = 1.5;
    }

    if (mach > 5) cd *= 1.4;

    return { cl, cd };
}

function getFacingVector() {
    const up = physicsEngine.physicsObjects['OV'].locVec.clone().normalize();

    // Stabiler Referenzvektor (verhindert Gimbal-Lock an den Polen)
    let ref = new THREE.Vector3(0, 1, 0);
    //if (Math.abs(up.dot(ref)) > 0.99) {
    //    ref = new THREE.Vector3(1, 0, 0);
    //}

    // Lokales Koordinatensystem
    const yaw = OV.IMU.yaw * Math.PI / 180;
    const pitch = OV.IMU.pitch * Math.PI / 180;

    const east = new THREE.Vector3().crossVectors(ref, up).normalize();
    const north = new THREE.Vector3().crossVectors(up, east).normalize();

    // === YAW (Heading) ===
    const headingDir = north.clone().multiplyScalar(Math.cos(yaw))
        .add(east.clone().multiplyScalar(Math.sin(yaw)));

    // === PITCH ===
    // WICHTIG: 90° = UP, 0° = HORIZONTAL

    const horizontal = headingDir.clone().multiplyScalar(Math.cos(pitch));
    const vertical = up.clone().multiplyScalar(Math.sin(pitch));

    let facingVector = horizontal.add(vertical).normalize();
    return [facingVector, horizontal, vertical];
}

let dt = 0.1;
let aero;
let physicsModel = "ascent";
let lastvel = new THREE.Vector3();
const physicsCycle = setInterval(() => {
    const faceVecs = getFacingVector();
    physicsEngine.physicsObjects['OV'].setFaceVecFromVector(faceVecs[0]); // Aktualisiert facingVector basierend auf IMU (Pitch/Yaw)
    physicsEngine.physicsObjects['OV'].setUpFromVector(faceVecs[1]);
    physicsEngine.physicsObjects['OV'].setTranslateRates(translateRate);
    //console.log(translateRate)
    lastvel = physicsEngine.physicsObjects['OV'].velVec;

    //let distFromCenter = locationVector.length();

    let h = physicsEngine.physicsObjects['OV'].locVec.length() - EARTH_RADIUS;

    let totalMass = 125000; // Orbiter leer
    let totalThrustN = 0;
    // Massen-Updates (ET, SRBs, Treibstoff)
    if (OV.computers.clasComputer.triggerState) {
        totalMass = 29000; // Forward Fuselage
        for (let i = 0; i < OV.computers.clasComputer.SRMs.length; i++) {
            if (OV.computers.clasComputer.SRMs[i].ignited) {
                totalThrustN += 928000; // N
            }
        }
    } else {
        if (!OV.et.jettisoned) totalMass += (OV.et.emptyMass + OV.et.lox + OV.et.lh2);
        if (!OV.SRBs.l.seperated) totalMass += (OV.SRBs.l.propellantMass + OV.SRBs.l.emptyMass);
        if (!OV.SRBs.r.seperated) totalMass += (OV.SRBs.r.propellantMass + OV.SRBs.r.emptyMass);

        // 1. Schubkraft berechnen
        if (h < 50000) {
            totalThrustN += (OV.ssme.ctr.thrust / 100) * 1860000 +
                (OV.ssme.l.thrust / 100) * 1860000 +
                (OV.ssme.r.thrust / 100) * 1860000 +
                (OV.rcsController.pods[1].omsPod[0].throttle / 100) * 26700 +
                (OV.rcsController.pods[2].omsPod[0].throttle / 100) * 26700

        } else {
            totalThrustN += (OV.ssme.ctr.thrust / 100) * 2278000 +
                (OV.ssme.l.thrust / 100) * 2278000 +
                (OV.ssme.r.thrust / 100) * 2278000 +
                (OV.rcsController.pods[1].omsPod[0].throttle / 100) * 26700 +
                (OV.rcsController.pods[2].omsPod[0].throttle / 100) * 26700
        }


        if (OV.SRBs.l.ignited && !OV.SRBs.l.seperated) totalThrustN += 13300000;
        if (OV.SRBs.r.ignited && !OV.SRBs.r.seperated) totalThrustN += 13300000;
    }

    physicsEngine.physicsObjects['OV'].setMass(totalMass);

    physicsEngine.physicsObjects['OV'].setThrust(totalThrustN);

    physicsEngine.update();



    // Telemetrie
    //OV.mission.telemetryPos.mach = aeroData.mach_speed;
    OV.mission.telemetryPos.V = physicsEngine.physicsObjects['OV'].velVec.length() //* 3.6;
    OV.mission.telemetryPos.alt_m = physicsEngine.physicsObjects['OV'].locVec.length() - EARTH_RADIUS;
    //OV.mission.telemetryPos.alt_m = physicsEngine.physicsObjects['OV'].fThrust.length() /;
    /*console.log({
        thrust: fThrust.length().toFixed(0),
        gravity: fGravity.length().toFixed(0),
        mass: totalMass.toFixed(0),
        accel: accelVec.length().toFixed(2),
        v: velocityVector.length().toFixed(2)
    });*/
}, 100);



let cl = 0;
let cd = 0;
//console.log("v: " + vel + ", h: " + height);
//let pos = { lat: 0, lon: 0 };


let flightAngle = -1.5;
setInterval(() => {  // Not working right now, reworking physics and location system
    if (physicsModel == "ascent") {
        //pos = destinationPoint(0, 0, dr, 180);
        //gv = CoordsToGroundVector(pos.lat, pos.lon);
        //groundVector.set(gv[0], gv[1], gv[2]);
        //lv = groundVectorToLocationVector(gv[0], gv[1], gv[2], height);
        //locationVector.set(lv[0], lv[1], lv[2]);
        //gfv = groundVectorToLocalFacingVector(gv[0], gv[1], gv[2]);
        //facingVector.set(gfv[0], gfv[1], gfv[2])
        //let tv = getThrustVector(OV.IMU.pitch, OV.IMU.yaw)
        //thrustVector.set(tv.x, tv.y, tv.z);
        if (OV.inIntactAbort) {
            //console.log(distanceAndHeading(pos.lat, pos.lon, 46.05218373657082, 63.247993768099455))
        }
        //console.log(pos);
        //console.log(facingVector);
        //console.log(thrustVector);
    }
    /*if (physicsModel == "final") {
        if (OV.inIntactAbort) {
            console.log(distanceAndHeading(pos.lat, pos.lon, 46.05218373657082, 63.247993768099455))
        }
        if (height > 67000) {

            let density = 1.225 * Math.E ** (-height / 8000);

            //console.log(density);
            let drag = 0.5 * density * vel * vel * 249.9;
            //console.log(drag);
            let dv = (-(drag / 100000) - 9.81 * Math.sin((flightAngle / 180) * Math.PI)) / 10 * (-1);
            //console.log(dv);
            let dh = vel * Math.sin((flightAngle / 180) * Math.PI) / 10;
            //console.log(dh);
            let dx = vel * Math.cos((flightAngle / 180) * Math.PI) / 10;
            //console.log(dx);
            vel -= dv;
            height += dh;
            dr += dx;
            //console.log(vel, height, dr, "density, drag, dv, dh, dx", density, drag, dv, dh, dx);

            OV.mission.telemetryPos.alt_m = height;
            OV.mission.telemetryPos.downrange_m = dr;
            OV.mission.telemetryPos.V = vel * 3.6;


        } else {
            flightAngle = OV.IMU.pitch;

            // Pos rechnung gleich
            let aero = computeAthmospere(height, vel * 3.6, 10);

            if (aero.mach_speed > 2) {
                cl = 1.0;
                cd = 1.1;
            } else {
                cl = 0.7;
                cd = 0.3;
            }
            let lift = cl * (aero.density / 2) * 249.9 * vel * vel; // N
            let drag = cd * (aero.density / 2) * 249.9 * (vel / 3.6) * (vel / 3.6); // N
            if (OV.dragChute.deployed && !OV.dragChute.jettisoned) {
                drag += 2074401;
            }
            if (OV.brakes.applied) {
                drag += 5423271;
            }
            //console.log(lift/drag)
            let dt = 1;
            //console.log(drag)

            let accel = drag / 125000; // N/kg = m/s^2
            let delv = accel / 10; // delta-vel m/s

            let delh = delv / 3.6 + 9.81;
            let delr = 1;
            if (aero.mach_speed > 5) {
                delr = delv;
            } else if (aero.mach_speed > 1) {
                delr = (delv) * 2;
            } else {
                delr = (delv) * 4.5;
            }

            //console.log(vel);
            //console.log(accel)
            vel -= delv / 3.6;
            pos = destinationPoint(pos.lat, pos.lon, delr, OV.IMU.yaw);
            gv = CoordsToGroundVector(pos.lat, pos.lon);
            groundVector.set(gv[0], gv[1], gv[2])
            lv = groundVectorToLocationVector(gv[0], gv[1], gv[2]);
            locationVector.set(lv[0], lv[1], lv[2])
            //console.log(vel - dvel)
            height = height - delh * 3.6;
            if (height < 0) {
                height = 0;
            }
            if (vel < 0) {
                vel = 0; 4
            }
            //console.log("v: " + vel + ", h: " + height + ", dv: " + dvel + ", dh: " + delh + ", a: " + accel);
            OV.mission.telemetryPos.V = vel * 3.6;
            OV.mission.telemetryPos.alt_m = height;
            OV.mission.telemetryPos.downrange_m = dr;
            OV.mission.telemetryPos.mach = aero.mach_speed;
            //console.log(Number(vel).toFixed(2), Number(height).toFixed(2), Number(dr).toFixed(2), Number(delv).toFixed(2), Number(delh).toFixed(2), Number(accel).toFixed(2), Number(drag).toFixed(2), Number(aero.mach_speed).toFixed(2));
        }
    }*/
}, 100);









/////////////////
// SERVER INIT //
/////////////////

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server läuft auf http://0.0.0.0:${PORT}`);
});
//OV.computers.programHandler.exec('SSMEstartUp', OV.computers.gpc1);
//OV.srbHandler.ignite()


console.log("Launch!");
//OV.metUpdaterLoop();
//OV.GroundLaunchSequencer();

setTimeout(() => {
OV.et.seperate()
OV.SRBs.l.seperate()
OV.SRBs.r.seperate()
}, 5000);
