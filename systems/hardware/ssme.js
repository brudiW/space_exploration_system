export class SSMEhandler {
    constructor(ctr, l, r) {
        this.ctr = ctr;
        this.l = l;
        this.r = r;
    }

    // Command thrust (rate-limited internally)
    cmdThrust(thrust) {
        this.ctr.setThrust(thrust);
        this.l.setThrust(thrust);
        this.r.setThrust(thrust);
    }

    // Call once per sim cycle
    update() {
        this.ctr.update();
        this.l.update();
        this.r.update();
    }

    cmdPos([x, z]) {
        this.ctr.setActuatorPosition(x, z);
        this.l.setActuatorPosition(x, z);
        this.r.setActuatorPosition(x, z);
    }
    startUp() {
        this.ctr.startUp();
        this.l.startUp();
        this.r.startUp();
    }
    shutDown() {
        this.ctr.shutDown();
        this.l.shutDown();
        this.r.shutDown();
    }
}



export class SSME {
    constructor() {
        this.thrust = 0.0;        // current thrust (%)
        this.targetThrust = 0.0;  // commanded thrust (%)
        this.angx = 0.0;
        this.angz = 0.0;
        this.shtdwn = false;
        this.startup = false;

        this.THROTTLE_RATE = 9.28; // % per second
        this.lastUpdate = performance.now();
    }

    getThrust() {
        return this.thrust;
    }

    // Command a new target thrust
    setThrust(target) {
        this.targetThrust = target;
    }

    // Call this periodically (e.g. every frame or GPC cycle)
    update() {
        if (this.startup) {
            this.THROTTLE_RATE = 20;}
        else if (this.shtdwn) {
            this.THROTTLE_RATE = 30;
        } else {
            this.THROTTLE_RATE = 9.28;
        }
        const now = performance.now();
        const dt = (now - this.lastUpdate) / 1000; // seconds
        this.lastUpdate = now;

        const error = this.targetThrust - this.thrust;
        const maxStep = this.THROTTLE_RATE * dt;

        if (Math.abs(error) <= maxStep) {
            this.thrust = this.targetThrust;
            this.startup = false;
            this.shtdwn = false;
        } else {
            this.thrust += Math.sign(error) * maxStep;
        }
    }

    setActuatorPosition(x, z) {
        this.angx = x; // right/left -/+
        this.angz = z; // down/up -/+
    }
    shutDown() {
        this.shtdwn = true;
        this.setThrust(0);
    }
    startUp() {
        this.startup = true;
        this.setThrust(100);
    }
}
