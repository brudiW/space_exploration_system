export class GearController {
    constructor(fwd, l, r) {
        this.fwd = fwd;
        this.l = l;
        this.r = r;
    }
    release() {
        this.fwd.release();
        this.l.release();
        this.r.release();
    }
    getDown() {
        if (this.fwd.getDL() && this.l.getDL() && this.r.getDL()) {
            return true;
        } else {
            return false;
        }
    }
}



export class Gear {
    constructor() {
        this.position = "up"; // "up" or "extended"
        this.locked = false; // true when extended and locked
    }
    getDL() {
        if (this.position = "extended" && this.locked) {
            return true;
        } else {
            return false;
        }
    }
    release() {
        this.position = "extended";
        setTimeout(() => {this.locked = true;}, 2475);
    }
}