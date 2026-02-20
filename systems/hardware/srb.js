export class SRBHandler {
    constructor(l, r) {
        this.l = l;
        this.r = r;
    }
    ignite() {
        this.l.ignite();
        this.r.ignite();
    }
    seperate() {
        this.l.seperate();
        this.r.seperate();
    }
    cmdPos([x1, y1], [x2, y2]) {
        this.l.cmdPos([x1, y1]);
        this.r.cmdPos([x2, y2]);
    }
}
export class SRB {
    constructor() {
        this.ignited = false;
        this.pos = [0, 0];
        this.seperated = false;
    }
    ignite() {
        this.ignited = true;
    }
    seperate() {
        this.seperated = true;
    }
    cmdPos([x, y]) {
        this.pos = [x, y];
    }
}