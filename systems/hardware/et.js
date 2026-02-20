export class ET {
    constructor() {
        this.lox = 630540;
        this.lh2 = 106261;
        this.loxTemp = -190.00;
        this.lh2Temp = -256.00;
        this.loxPress = 245.00;
        this.lh2Press = 225.00;
        this.jettisoned = false;
    }
    drain(ctr, l, r) {
        if (!this.jettisoned) {
            if (this.lox > 30 && this.lh2 > 30) {
                this.lh2 -= (((ctr.thrust * 70.3) / 104.5)/10 + ((l.thrust * 70.3) / 104.5)/10 + ((r.thrust * 70.3) / 104.5)/10);
                this.lox -= (((ctr.thrust * 423.65) / 104.5)/10 + ((l.thrust * 423.65) / 104.5)/10 + ((r.thrust * 423.65) / 104.5)/10);
            } else {
                OV.computers.programmHanndler.exec("SSMEshutDown", OV.computers.gpc4);
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
        const aaa = setInterval(() => { this.drain(0.35); }, 1000);
        setTimeout(() => {
            clearInterval(aaa);
            setInterval(() => { this.drain(1.00); }, 1000);
        })
    }
}