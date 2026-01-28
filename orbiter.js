// import everything hardware
/////////////
// IMPORTS //
/////////////
import { FlightTerminationSystem } from "./hardware/fts.js";


import { SSME, SSMEhandler } from "./hardware/ssme.js"
import { APU } from "./hardware/apu.js";
import { ET } from "./hardware/et.js";
import { SRB, SRBHandler } from "./hardware/srb.js";
import { Pod, RCSGroup, RCSThruster, RCSPod, OMSPod, ReactionControlSystemController, RCSExtenderTank } from "./hardware/rcs+oms.js";

import { CLASComputer } from "./hardware/clas.js";
import { GPC } from "./hardware/gpc.js";
import { programHandler } from "./hardware/programHandler.js";

import { maneuverHandler } from "./hardware/maneuverHandler.js";
import { FlyByWireComputer } from "./hardware/fly_by_wire.js";




import { RudderBrake, BodyFlap, Elevon } from "./hardware/avionics.js";


import { PFD1CDRController } from "./software/pfd1CDRController.js";
import { PFD1PLTController } from "./software/pfd1PLTController.js";
import { PFD2CDRController } from "./software/pfd2CDRController.js";
import { PFD2PLTController } from "./software/pfd2PLTController.js";
import { SFD1CDRController } from "./software/sfd1CDRController.js";

import { GearController, Gear } from "./hardware/gearController.js";

import { Parachute } from "./hardware/parachutes.js";

import { GPSComputer, AbortGuidance } from "./hardware/gpsComputer.js";






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



const maneuverHandlerTool = new maneuverHandler();
const fbwComp = new FlyByWireComputer();


const launchPoint = { lat: 50.333611, lon: 8.115000 };
const abortSites = [
    {
        name: "Launch Site",
        icao: "RTLS",
        lat: 50.333611,
        lon: 8.115000,
        runways: [],
        type: "RTLS",
        minMET: 0,
        maxMET: 120
    },
    {
        name: "Frankfurt am Main",
        icao: "EDDF",
        lat: 50.0379,
        lon: 8.5622,
        runways: [
            { id: "07R", heading: 70 }
        ],
        type: "CONTINENTAL",
        minMET: 120,
        maxMET: 300
    },
    {
        name: "Leipzig-Halle",
        icao: "EDDP",
        lat: 51.4239,
        lon: 12.2364,
        runways: [],
        type: "CONTINENTAL",
        minMET: 150,
        maxMET: 360
    },
    {
        name: "Kyiv-Boryspil",
        icao: "UKBB",
        lat: 50.3450,
        lon: 30.8947,
        runways: [
            { id: "18L", heading: 180 },
            { id: "36R", heading: 360 }
        ],
        type: "TAL",
        minMET: 240,
        maxMET: 480
    },
    {
        name: "Baikonur",
        icao: "UAON",
        lat: 45.964,
        lon: 63.305,
        runways: [],
        type: "AOA",
        minMET: 420,
        maxMET: Infinity
    }
];

const gps = new GPSComputer(launchPoint, 78.5);
const abortGuidance = new AbortGuidance(abortSites);




// Screens
const cdr_pfd1 = new PFD1CDRController("cdr-pfd-1");
const plt_pfd1 = new PFD1PLTController("plt-pfd-1");
const cdr_pfd2 = new PFD2CDRController("cdr-pfd-2");
const plt_pfd2 = new PFD2PLTController("plt-pfd-2");
const cdr_sfd1 = new SFD1CDRController("cdr-sfd-1");



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
            cdr_pfd1: cdr_pfd1,
            cdr_pfd2: cdr_pfd2,
            cdr_sfd1: cdr_sfd1,


            plt_pfd1: plt_pfd1,
            plt_pfd2: plt_pfd2,
        };
        this.imuData = {
            pitch: 0,
            roll: 0,
            yaw: 0,
            pitchRate: 0,
            rollRate: 0,
            yawRate: 0
        };
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


            missionMode: ""
        };

    }
    metUpdaterLoop() {
        const groundChannelPos = new BroadcastChannel('ground_request_pos');

        this.software.metTimer = setInterval(() => {
            //console.log("met: " + this.mission.met + ", mode: " + this.software.missionMode)
            OV.mission.met++;
            switch (this.software.missionMode) {
                case "auto-sequence":
                    if (OV.inIntactAbort && OV.mission.met <= 0) {
                        console.log('Intact Pad Abort!');
                        OV.computers.programHandler.exec('SSMEshutDown', OV.computers.gpc2);
                        clearInterval(OV.mission.metTimer);
                    }
                    break;
                case "ascent":
                    groundChannelPos.postMessage({ type: 'getTrajectory', met: OV.mission.met });
                    OV.computers.programHandler.exec('ascentHandler', OV.computers.gpc4);
                    break;
                case "clas-abort":
                    break;
                case "intact-abort":
                    break;
            }
        }, 1000);
    }
}








window.OV = new Orbiter();
console.log(OV);



// Dynamic

OV.rcsExtenderTanks.push(RCSExtA);
OV.rcsExtenderTanks.push(RCSExtB);
OV.rcsExtenderTanks.push(RCSExtC);
OV.rcsExtenderTanks.push(RCSExtD);
OV.rcsExtenderTanks.push(RCSExtE);

















setInterval(() => {
    OV.ssmeHandler.update();
}, 50); // 20 Hz (matches your GPC / IMU rate)

setInterval(() => {
    if (OV) {
        OV.et.drain(OV.ssme.ctr, OV.ssme.l, OV.ssme.r);
    }
    //console.log(OV.et);
}, 1000)

//window.telemetryDown = [];
//setInterval(() => {
//  telemetryDown.push(OV);
//}, 1000)

setInterval(() => {
    const telemetry = OV.mission.telemetryPos;

    // Compute current GPS position from telemetry
    const state = OV.computers.gpsComp.getPositionFromTelemetry(telemetry);
    state.met = OV.mission.met;
    state.range = telemetry.downrange_m / 1000; // km for cross-range calculations

    // Compute abort guidance
    const guidance = OV.computers.guidanceComp.getGuidance(state);
    if (guidance) {
        //console.log(`MET ${state.met}: ABORT to ${guidance.site} (${guidance.mode})`);
    }
}, 1000);






const navChannel = new BroadcastChannel("nav_rcv");
setInterval(() => {
    if (OV) {
        navChannel.postMessage({ imu: OV.imuData, SSME: { l: OV.ssme.l, ctr: OV.ssme.ctr, r: OV.ssme.r }, SRB: { l: OV.SRBs.l, r: OV.SRBs.r }, OMS: { l: OV.oms.l, r: OV.oms.r }, et: OV.et, RCS: OV.rcsController, met: OV.mission.met });
        //console.log({ imu: OV.imuData, SSME: { l: OV.ssme.l, ctr: OV.ssme.ctr, r: OV.ssme.r }, SRB: { l: OV.SRBs.l, r: OV.SRBs.r }, OMS: { l: OV.oms.l, r: OV.oms.r }, RCS: OV.rcsController });
    }
}, 100)
const downlink = new BroadcastChannel("downlink");
setInterval(() => {
    if (OV) {
        //console.log("a")
        let OVdata = {
            inAbort: OV.inAbort,
            inIntactAbort: OV.inIntactAbort,
            intactAbortMode: OV.intactAbortMode,
            APUs: {
                a: { apuTemp: OV.APUs.APUa.apuTemp, autoStartEnabble: OV.APUs.APUa.autoStartEnabble, fuelQty: OV.APUs.APUa.fuelQty, fuelPress: OV.APUs.APUa.fuelPress, fuelTemp: OV.APUs.APUa.fuelTemp, h2oQty: OV.APUs.APUa.h2oQty, h2oPress: OV.APUs.APUa.h2oPress, h2oTemp: OV.APUs.APUa.h2oTemp, oilQty: OV.APUs.APUa.oilQty, oilPress: OV.APUs.APUa.oilPress, oilTemp: OV.APUs.APUa.oilTemp, apuTemp: OV.APUs.APUa.apuTemp },
                b: { apuTemp: OV.APUs.APUb.apuTemp, autoStartEnabble: OV.APUs.APUb.autoStartEnabble, fuelQty: OV.APUs.APUb.fuelQty, fuelPress: OV.APUs.APUb.fuelPress, fuelTemp: OV.APUs.APUb.fuelTemp, h2oQty: OV.APUs.APUb.h2oQty, h2oPress: OV.APUs.APUb.h2oPress, h2oTemp: OV.APUs.APUb.h2oTemp, oilQty: OV.APUs.APUb.oilQty, oilPress: OV.APUs.APUb.oilPress, oilTemp: OV.APUs.APUb.oilTemp, apuTemp: OV.APUs.APUb.apuTemp },
                c: { apuTemp: OV.APUs.APUc.apuTemp, autoStartEnabble: OV.APUs.APUc.autoStartEnabble, fuelQty: OV.APUs.APUc.fuelQty, fuelPress: OV.APUs.APUc.fuelPress, fuelTemp: OV.APUs.APUc.fuelTemp, h2oQty: OV.APUs.APUc.h2oQty, h2oPress: OV.APUs.APUc.h2oPress, h2oTemp: OV.APUs.APUc.h2oTemp, oilQty: OV.APUs.APUc.oilQty, oilPress: OV.APUs.APUc.oilPress, oilTemp: OV.APUs.APUc.oilTemp, apuTemp: OV.APUs.APUc.apuTemp }
            },
            avionics: OV.avionics,
            computers: {
                clasComputer: {
                    armState: OV.computers.clasComputer.armState,
                    triggerState: OV.computers.clasComputer.triggerState,
                    failState: OV.computers.clasComputer.failState,
                    trim: OV.computers.clasComputer.trim
                }
            },
            gear: {
                fwd: { position: OV.gear.fwd.position, locked: OV.gear.fwd.locked },
                l: { position: OV.gear.l.position, locked: OV.gear.l.locked },
                r: { position: OV.gear.r.position, locked: OV.gear.r.locked }
            },
            imuData: {
                pitch: OV.imuData.pitch,
                roll: OV.imuData.roll,
                yaw: OV.imuData.yaw,
                pitchRate: OV.imuData.pitchRate,
                rollRate: OV.imuData.rollRate,
                yawRate: OV.imuData.yawRate
            },
            mission: {
                met: OV.mission.met,
                telemetryPos: {
                    V: OV.mission.telemetryPos.V,
                    alt_m: OV.mission.telemetryPos.alt_m,
                    downrange_m: OV.mission.telemetryPos.downrange_m,
                    mach: OV.mission.telemetryPos.mach
                }
            },
            oms: {
                l: { arm: OV.oms.l.arm, throttle: OV.oms.l.throttle },
                r: { arm: OV.oms.r.arm, throttle: OV.oms.r.throttle }
            },
            parachutes: {
                brake: { deployed: OV.parachutes.brake.deployed },
                mainA: { deployed: OV.parachutes.mainA.deployed },
                mainB: { deployed: OV.parachutes.mainB.deployed },
                mainC: { deployed: OV.parachutes.mainC.deployed },
                backUpA: { deployed: OV.parachutes.backUpA.deployed }
            },
            positionData: {
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
            },
            radarAlt: {
                mtr: OV.radarAlt.mtr,
                ft: OV.radarAlt.ft
            },
            rcsController: OV.rcsController.pods,
            rcsExtenderTanks: OV.rcsExtenderTanks,
            software: {
                pilotTakeover: OV.software.pilotTakeover,
                missionMode: OV.software.missionMode
            },
            SRBs: {
                l: { ignited: OV.SRBs.l.ignited, pos: OV.SRBs.l.pos, seperated: OV.SRBs.l.seperated },
                r: { ignited: OV.SRBs.r.ignited, pos: OV.SRBs.r.pos, seperated: OV.SRBs.r.seperated }
            },
            ssme: {
                l: { thrust: OV.ssme.l.thrust, targetThrust: OV.ssme.l.targetThrust, angx: OV.ssme.l.angx, angz: OV.ssme.l.angz },
                ctr: { thrust: OV.ssme.ctr.thrust, targetThrust: OV.ssme.ctr.targetThrust, angx: OV.ssme.ctr.angx, angz: OV.ssme.ctr.angz },
                r: { thrust: OV.ssme.r.thrust, targetThrust: OV.ssme.r.targetThrust, angx: OV.ssme.r.angx, angz: OV.ssme.r.angz }
            },
            et: {
                lox: OV.et.lox,
                lh2: OV.et.lh2,
                loxTemp: OV.et.loxTemp,
                lh2Temp: OV.et.lh2Temp,
                loxPress: OV.et.loxPress,
                lh2Press: OV.et.lh2Press,
                jettisoned: OV.et.jettisoned
            }
        }
        downlink.postMessage(OVdata);
    }
}, 50);