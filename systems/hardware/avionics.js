export class Elevon {
    constructor() {
        this.disabled = false;
        this.targetPos = 0.0;
        this.pos = 0.0;
    }
    getPos() {
        return this.pos;
    }
    getTarget() {
        return this.targetPos;
    }
    getDisabled() {
        return this.disabled;
    }
    enable() {
        this.disabled = false;
    }
    disable() {
        this.disabled = true;
    }
    setTarget(targetPos) {
        this.targetPos = targetPos;
    }
}
export class BodyFlap {
    constructor() {
        this.disabled = false;
        this.targetPos = 0.0;
        this.pos = 0.0;
    }
    getPos() {
        return this.pos;
    }
    getTarget() {
        return this.targetPos;
    }
    getDisabled() {
        return this.disabled;
    }
    enable() {
        this.disabled = false;
    }
    disable() {
        this.disabled = true;
    }
    setTarget(targetPos) {
        this.targetPos = targetPos;
    }
}
export class RudderBrake { // Rudder/Speedbrake
    constructor() {
        this.disabled = false;
        this.deployed = false;
        this.targetPos = 0.0;
        this.pos = 0.0;
        this.deployTarget = 0.0;
        this.deployPos = 0.0;
    }
    getPos() {
        return this.pos;
    }
    getTarget() {
        return this.targetPos;
    }
    getDeployTarget() {
        return this.deployTarget;
    }
    getDeployPos() {
        return this.deployPos;
    }
    getDisabled() {
        return this.disabled;
    }
    getDeployed() {
        return this.deployed;
    }
    enable() {
        this.disabled = false;
    }
    disable() {
        this.disabled = true;
    }
    deploy() {
        this.deployed = true;
    }
    retract() {
        this.deployed = false;
    }
    setTarget(targetPos) {
        this.targetPos = targetPos;
    }
    setDeployTarget(deployTarget) {
        this.deployTarget = deployTarget;
    }
}