import { SpaceObject } from "../../physicsEngine.js";

export class ET {
    constructor() {
        this.lox = 630540;
        this.lh2 = 106261;
        this.loxTemp = -190.00;
        this.lh2Temp = -256.00;
        this.loxPress = 245.00;
        this.lh2Press = 225.00;
        this.emptyMass = 29900;
        this.jettisoned = false;
        this.TERMINATED = false;
    }
    drain(ctr, l, r) {
        if (!this.jettisoned) {
            if (this.lox > 30 && this.lh2 > 30) {
                this.lh2 -= (((ctr.thrust * 70.3) / 104.5)/10 + ((l.thrust * 70.3) / 104.5)/10 + ((r.thrust * 70.3) / 104.5)/10);
                this.lox -= (((ctr.thrust * 423.65) / 104.5)/10 + ((l.thrust * 423.65) / 104.5)/10 + ((r.thrust * 423.65) / 104.5)/10);
            } else {
                OV.computers.programHandler.exec("SSMEshutDown", global.OV.computers.gpc4);
            }
        }
    }
    drainTank(valvePercent) {
        if (this.lh2 > 0 && this.lox > 0) {
            this.lh2 -= 12.5 * valvePercent;
            this.lox -= 12.5 * valvePercent;
        }
    }
    seperate() {
        this.jettisoned = true;
        const etObj = new SpaceObject(4, "ET", {x: physicsEngine.physicsObjects['OV'].locVec.x, y: physicsEngine.physicsObjects['OV'].locVec.y, z: physicsEngine.physicsObjects['OV'].locVec.z}, {x: physicsEngine.physicsObjects['OV'].faceVec.x, y: physicsEngine.physicsObjects['OV'].faceVec.y, z: physicsEngine.physicsObjects['OV'].faceVec.z}, {x: physicsEngine.physicsObjects['OV'].velVec.x, y: physicsEngine.physicsObjects['OV'].velVec.y, z: physicsEngine.physicsObjects['OV'].velVec.z}, {x: 0, y: 1, z: 0}, 0, this.emptyMass + this.lh2 + this.lox, false, [], 300);
        global.physicsEngine.add(etObj)
        const aaa = setInterval(() => { this.drain(0.35); }, 1000);
        setTimeout(() => {
            clearInterval(aaa);
            setInterval(() => { this.drain(1.00); }, 1000);
        })
    }

}
