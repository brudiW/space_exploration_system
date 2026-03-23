export class FlyByWireComputer {
    constructor() {
        this.lastRates = {p: 0, r: 0, y: 0};



        const imu_event = new BroadcastChannel("imu_event");
        imu_event.onmessage = (e) => {
            this.handleMove(OV.IMU.prate, OV.IMU.rrate, OV.IMU.yrate);


        }
    }
    handleMove(p, roll, yaw) {
        if (OV) {
            let pitch;
            if (OV.IMU.roll > 90 || OV.IMU.roll < -90) {
                pitch = p * (-1);
            } else {
                pitch = p;
            }
            if (!OV.SRBs.l.seperated) {
                if (roll > 0 && yaw > 0 && roll > yaw) {
                    OV.SRBs.l.cmdPos([pitch, roll]);
                } else if (yaw > 0 && roll > 0 && yaw > roll) {
                    OV.SRBs.l.cmdPos([pitch, yaw]);
                } else if (roll < 0 && yaw < 0 && roll < yaw) {
                    OV.SRBs.l.cmdPos([pitch, roll]);
                } else if (yaw < 0 && roll < 0 && yaw < roll) {
                    OV.SRBs.l.cmdPos([pitch, yaw]);
                } else {
                    OV.SRBs.l.cmdPos([pitch, roll]);
                }
            }
            if (!OV.SRBs.r.seperated) {
                if (roll > 0 && yaw > 0 && roll > yaw) {
                    OV.SRBs.r.cmdPos([pitch, roll]);
                } else if (yaw > 0 && roll > 0 && yaw > roll) {
                    OV.SRBs.r.cmdPos([pitch, yaw]);
                } else if (roll < 0 && yaw < 0 && roll < yaw) {
                    OV.SRBs.r.cmdPos([pitch, roll]);
                } else if (yaw < 0 && roll < 0 && yaw < roll) {
                    OV.SRBs.r.cmdPos([pitch, yaw]);
                } else {
                    OV.SRBs.r.cmdPos([pitch, roll]);
                }
            }
            if (!OV.SRBs.l.seperated && !OV.SRBs.r.seperated) {
                if (roll > 0 && yaw >= 0 && roll > yaw) {
                    OV.ssmeHandler.cmdPos([pitch, roll]);
                } else if (yaw > 0 && roll >= 0 && yaw > roll) {
                    OV.ssmeHandler.cmdPos([pitch, yaw]);
                } else if (roll < 0 && yaw <= 0 && roll < yaw) {
                    OV.ssmeHandler.cmdPos([pitch, roll]);
                } else if (yaw < 0 && roll <= 0 && yaw < roll) {
                    OV.ssmeHandler.cmdPos([pitch, yaw]);
                } else {
                    OV.ssmeHandler.cmdPos([pitch, roll]);
                }
            } else {
                const DEG2RAD = Math.PI / 180;
                const rollGain = 0.3; // klein halten!

                [
                    { e: OV.ssme.ctr, angle: 0 },
                    { e: OV.ssme.l, angle: 120 },
                    { e: OV.ssme.r, angle: -120 }
                ].forEach(({ e, angle }) => {

                    const a = angle * DEG2RAD;
                    let p;
                    let y;
                    if (roll != 0) {
                        p = pitch + roll * rollGain * Math.sin(a);
                        y = yaw + roll * rollGain * Math.cos(a);
                    } else {
                        p = pitch;
                        y = yaw;
                    }

                    e.setActuatorPosition(p, y);
                    //console.warn(p + ", " + y)
                });

            }
            if (this.lastRates.p != p || this.lastRates.r != roll || this.lastRates.y != yaw) {
                let diffP = (this.lastRates.p - p) * -1;
                let diffR = (this.lastRates.r - roll) * -1;
                let diffY = (this.lastRates.y - yaw) * -1;
                if (diffP > 0) {
                    //OV.rcsController.pods[0].rcsPod[0].groups[1].open(); // Front Forward
                    OV.rcsController.pods[0].rcsPod[0].groups[3].open(); // Front Left Roll Clockwise
                    OV.rcsController.pods[0].rcsPod[0].groups[6].open(); // Front Right Roll Anticlockwise
                    OV.rcsController.pods[1].rcsPod[0].groups[0].open(); // Aft Left Up
                    OV.rcsController.pods[2].rcsPod[0].groups[0].open(); // Aft Right Up
				} else if (diffP < 0) {
                    OV.rcsController.pods[0].rcsPod[0].groups[0].open(); // Front Up
                    OV.rcsController.pods[0].rcsPod[0].groups[4].open(); // Front Left Roll Anticlockwise
                    OV.rcsController.pods[0].rcsPod[0].groups[7].open(); // Front Right Roll Clockwise
                    OV.rcsController.pods[1].rcsPod[0].groups[3].open(); // Aft Left Down
                    OV.rcsController.pods[2].rcsPod[0].groups[3].open(); // Aft Right Down
				}
             	/*//RCS Front Up
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

const RCS_OMS = new ReactionControlSystemController([PodFront, PodAftLeft, PodAftRight]);*/
			}

            this.lastRates = {p: p, r: roll, y: yaw};
        }
    }
}
