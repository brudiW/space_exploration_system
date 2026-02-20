export class FlyByWireComputer {
    constructor() {



        this.imu_rc = new BroadcastChannel("imu_rcv");
        this.imu_rc.onmessage = (e) => {
            const d = e.data;
            this.handleMove(d[0], d[1], d[2]);


        }
    }
    handleMove(p, roll, yaw) {
        if (OV) {
            let pitch;
            if (OV.imuData.roll > 90 || OV.imuData.roll < -90) {
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
                    console.warn(p + ", " + y)
                });

            }
        }
    }
}