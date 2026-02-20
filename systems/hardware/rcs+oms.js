export class ReactionControlSystemController {
    constructor(pods = []) {
        this.pods = pods;
    }
}


export class Pod {
    constructor(id, omsPod = [], rcsPod = []) {
        this.id = id;
        this.omsPod = omsPod;
        this.rcsPod = rcsPod;
        this.mmh = 418.6658;
        this.mmhTankMax = 418.6658;
        this.nto = 664.0592;
        this.ntoTankMax = 664.0592;
        //console.log(this.id + ": " + this.omsPod + "; " + this.rcsPod);
        setInterval(() => {this.drain}, 1000);
    }
    drain() {
        if (this.omsPod.length > 0) {
            this.omsPod.forEach(e => {
                if (e.running) {
                    this.mmh -= 150 * (e.throttle / 100);
                    this.nto -= 150 * (e.throttle / 100);
                }
            })
        }
        if (this.rcsPod.length > 0) {
            this.rcsPod.forEach(e => {
                e.groups.forEach(f => {
                    if (f.running) {
                        this.mmh -= 12;
                        this.nto -= 12;
                    }
                })
            })
        }
    }
}

export class RCSPod {
    constructor(id, groups = []) {
        this.id = id;
        this.groups = groups; //RCS Thruster Groups
    }
}
export class RCSGroup {
    constructor(id, thrusters = []) {
        this.id = id;
        this.thrusters = thrusters; // RCS Thruster
        this.running = false;
        setInterval(() => { this.run() }, 100);
        //console.log(this.thrusters);
    }
    run() {
        if (this.thrusters.length > 0) {
            if (this.running) {
                this.thrusters.forEach(e => {
                    e.open = true;
                })
            } else {
                this.thrusters.forEach(e => {
                    e.open = false;
                })
            }
        }
    }
    open() {
        this.running = true;
    }
    close() {
        this.running = false;
    }
}
export class RCSThruster {
    constructor() {
        this.open = false;
    }
}

export class OMSPod {
    constructor(id) {
        this.id = id;
        this.arm = false;
        this.throttle = 0.0;
    }
    enableArm() {
        this.arm = true;
    }
    disableArm() {
        this.arm = false;
    }
    thrust(throttle) {
        this.throttle = throttle;
    }
}


export class RCSExtenderTank {
    constructor(id, mmh, nto, mmhTankMax, ntoTankMax) {
        this.id = id;
        this.mmh = mmh;
        this.nto = nto;
        this.mmhTankMax = mmhTankMax;
        this.ntoTankMax = ntoTankMax;
    }
    transfer(targetTank, amountNTO, amountMMH) {
        if (targetTank) {
            if (targetTank.nto + amountNTO < targetTank.ntoTankMax) {
                targetTank.nto = targetTank.nto + amountNTO;
            }
            if (targetTank.mmh + amountMMH < targetTank.mmhTankMax) {
                targetTank.mmh = targetTank.mmh + amountMMH;
            }
        }
    }
}