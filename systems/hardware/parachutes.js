export class Parachute {
    constructor() {
        this.deployed = false;
    }
    deploy() {
        this.deployed = true;
        return true
    }
    cut() {
        this.deployed = false;
        return true
    }
}