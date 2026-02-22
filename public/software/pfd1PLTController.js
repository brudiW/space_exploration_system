import { TouchScreen } from "./classes/touchscreen.js";

export class PFD1PLTController {
    constructor(canvasId, orbiter = null) {
        this.canvas = document.getElementById(canvasId);
        this.screen = new TouchScreen(900, 600, 0, 0, canvasId, this.canvas);
        this.orbiter = orbiter;

        this.touchZones = []; // dynamic touch zones
        this.touchCallbacks = []; // general touch callbacks

        this.screen.onTouch((touches) => {
            touches.forEach(t => {
                // Draw a visual indicator
                this.screen.addCircle("red", t.x, t.y, 5);

                // Call global touch callbacks
                this.touchCallbacks.forEach(cb => cb(t, this.orbiter));

                // Check touch zones
                this.touchZones.forEach(zone => {
                    if (t.x >= zone.x && t.x <= zone.x + zone.width &&
                        t.y >= zone.y && t.y <= zone.y + zone.height) {
                        zone.callback(t, this.orbiter);
                    }
                });
            });
        });
        this.graphicsList = [];

        this.intervalId = setInterval(() => this.update(), 50);

        // Initial draw
        this.drawArtificialHorizon(0, 0, 0);

        this.popup = false;
        this.popupType = "";
        this.popupText = "";
        
    }

    setOrbiter(orbiter) {
        this.orbiter = orbiter;
    }

    // Register a general touch callback
    onTouchAction(callback) {
        this.touchCallbacks.push(callback);
    }

    // Register a specific touch zone
    addTouchZone(x, y, width, height, callback) {
        this.touchZones.push({ x, y, width, height, callback });
    }

    drawArtificialHorizon(pitch, roll, yaw) {
        if (!this.orbiter) return;
        const ctx = this.screen.element.getContext("2d");
        const W = this.screen.element.width;
        const H = this.screen.element.height;
        const cx = W / 2, cy = H / 2;
        const r = Math.min(W, H) * 0.45;

        ctx.clearRect(0, 0, W, H);
        ctx.save();
        ctx.translate(cx, cy);

        // Clip to circular instrument
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.clip();

        const ppd = r / 30;
        const pitchPx = pitch * ppd;

        ctx.save();
        ctx.rotate(roll * Math.PI / 180);

        // Sky
        ctx.fillStyle = "#2a8cff";
        ctx.fillRect(-2000, -2000 + pitchPx, 4000, 2000);

        // Ground
        ctx.fillStyle = "#8c5a2b";
        ctx.fillRect(-2000, pitchPx, 4000, 2000);

        // Horizon line
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-2000, pitchPx);//0°
        ctx.lineTo(2000, pitchPx);
        ctx.moveTo(-2000, pitchPx-90);//-10°
        ctx.lineTo(2000, pitchPx-90);
        ctx.moveTo(-2000, pitchPx+90);//10°
        ctx.lineTo(2000, pitchPx+90);
        ctx.moveTo(-2000, pitchPx-180);//-20°
        ctx.lineTo(2000, pitchPx-180);
        ctx.moveTo(-2000, pitchPx+180);
        ctx.lineTo(2000, pitchPx+180);
        ctx.moveTo(-2000, pitchPx-270);//-30°
        ctx.lineTo(2000, pitchPx-270);
        ctx.moveTo(-2000, pitchPx+270);
        ctx.lineTo(2000, pitchPx+270);
        ctx.moveTo(-2000, pitchPx-360);//-40°
        ctx.lineTo(2000, pitchPx-360);
        ctx.moveTo(-2000, pitchPx+360);
        ctx.lineTo(2000, pitchPx+360);
        ctx.moveTo(-2000, pitchPx-450);//-50°
        ctx.lineTo(2000, pitchPx-450);
        ctx.moveTo(-2000, pitchPx+450);
        ctx.lineTo(2000, pitchPx+450);
        ctx.moveTo(-2000, pitchPx-540);//-60°°
        ctx.lineTo(2000, pitchPx-540);
        ctx.moveTo(-2000, pitchPx+540);
        ctx.lineTo(2000, pitchPx+540);
        ctx.moveTo(-2000, pitchPx-630);//-70°
        ctx.lineTo(2000, pitchPx-630);
        ctx.moveTo(-2000, pitchPx+630);
        ctx.lineTo(2000, pitchPx+630);
        ctx.moveTo(-2000, pitchPx-720);//-80°
        ctx.lineTo(2000, pitchPx-720);
        ctx.moveTo(-2000, pitchPx+720);
        ctx.lineTo(2000, pitchPx+720);
        ctx.moveTo(-2000, pitchPx-810);//-90°
        ctx.lineTo(2000, pitchPx-810);
        ctx.moveTo(-2000, pitchPx+810);
        ctx.lineTo(2000, pitchPx+810);
        ctx.moveTo(-2000, pitchPx-900);//-100°
        ctx.lineTo(2000, pitchPx-900);
        ctx.moveTo(-2000, pitchPx+900);
        ctx.lineTo(2000, pitchPx+900);
        ctx.moveTo(-2000, pitchPx-990);
        ctx.lineTo(2000, pitchPx-990);
        ctx.moveTo(-2000, pitchPx+990);
        ctx.lineTo(2000, pitchPx+990);
        ctx.moveTo(-2000, pitchPx-1080);
        ctx.lineTo(2000, pitchPx-1080);
        ctx.moveTo(-2000, pitchPx+1080);
        ctx.lineTo(2000, pitchPx+1080);
        ctx.moveTo(-2000, pitchPx-1170);
        ctx.lineTo(2000, pitchPx-1170);
        ctx.moveTo(-2000, pitchPx+1170);
        ctx.lineTo(2000, pitchPx+1170);
        ctx.moveTo(-2000, pitchPx-1260);
        ctx.lineTo(2000, pitchPx-1260);
        ctx.moveTo(-2000, pitchPx+1260);
        ctx.lineTo(2000, pitchPx+1260);
        ctx.moveTo(-2000, pitchPx-1350);
        ctx.lineTo(2000, pitchPx-1350);
        ctx.moveTo(-2000, pitchPx+1350);
        ctx.lineTo(2000, pitchPx+1350);
        ctx.moveTo(-2000, pitchPx-1440);
        ctx.lineTo(2000, pitchPx-1440);
        ctx.moveTo(-2000, pitchPx+1440);
        ctx.lineTo(2000, pitchPx+1440);
        ctx.moveTo(-2000, pitchPx-1530);
        ctx.lineTo(2000, pitchPx-1530);
        ctx.moveTo(-2000, pitchPx+1530);
        ctx.lineTo(2000, pitchPx+1530);
        ctx.moveTo(-2000, pitchPx-1620);
        ctx.lineTo(2000, pitchPx-1620);
        ctx.moveTo(-2000, pitchPx+1620);
        ctx.lineTo(2000, pitchPx+1620);

        ctx.stroke();

        ctx.restore();
        
        // Entry/Approch Mode Screen

        if (true) {

        }

        // Aircraft symbol
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-20, 0); ctx.lineTo(20, 0);
        ctx.moveTo(0, 0); ctx.lineTo(0, 15);
        ctx.stroke();

        ctx.restore();

        // Bezel
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#666";
        ctx.stroke();

        // HUD overlays (could also be made configurable)
        this.screen.addText(Math.round(Number(yaw)), 450, 10);
        this.screen.addText("P: " + Math.round(Number(OV.IMU.pitch)*10)/10, 750, 12)
        this.screen.addText("R: " + Math.round(Number(OV.IMU.roll)*10)/10, 750, 28)
        this.screen.addText("Y: " + Math.round(Number(OV.IMU.yaw)*10)/10, 750, 44)
        this.screen.addLine("lime", 800, 0, 800, 120);
        this.screen.addLine("lime", 800, 40, 900, 40);
        this.screen.addLine("lime", 800, 80, 900, 80);
        this.screen.addLine("lime", 800, 120, 900, 120);
        //this.screen.addText("RTLS", 860, 12);
        if (OV.intactAbortMode.threeEngine != "" && OV.intactAbortMode.threeEngine != "NONE") {
            this.screen.addText(OV.intactAbortMode.threeEngine, 860, 12);
        }
        if (OV.intactAbortMode.twoEngine != "" && OV.intactAbortMode.twoEngine != "NONE") {
            this.screen.addText(OV.intactAbortMode.twoEngine, 860, 52);
        }
        if (OV.intactAbortMode.singleEngine != "" && OV.intactAbortMode.singleEngine != "NONE") {
            this.screen.addText(OV.intactAbortMode.singleEngine, 860, 92);
        }
        this.screen.addLine("lime", 100, 0, 100, 120);
        this.screen.addLine("lime", 0, 40, 100, 40);
        this.screen.addLine("lime", 0, 80, 100, 80);
        this.screen.addLine("lime", 0, 120, 100, 120);
        this.screen.addText("CTR: " + Math.round(Number(this.orbiter.ssme.ctr.thrust)*10)/10 + " %", 12, 12);
        this.screen.addText("L: " + Math.round(Number(this.orbiter.ssme.l.thrust)*10)/10 + " %", 12, 52);
        this.screen.addText("R: " + Math.round(Number(this.orbiter.ssme.r.thrust)*10)/10 + " %", 12, 92);
        let meth = 0;
        let metm = 0;
        let mets = 0;
        if (OV.mission.met < 0) {
            meth = Math.ceil(OV.mission.met/3600)*(-1);
            metm = Math.ceil(OV.mission.met/60)*(-1);
            mets = OV.mission.met%60*(-1);
            if (meth < 10) {
                meth = "-0" + meth;
            }
            if (metm < 10) {
                metm = "0" + metm;
            }
            if (mets < 10) {
                mets = "0" + mets;
            }
        } else {
            meth = Math.floor(OV.mission.met/3600);
            metm = Math.floor(OV.mission.met/60)%60;
            mets = OV.mission.met%60;
            if (meth < 10) {
                meth = "0" + meth;
            }
            if (metm < 10) {
                metm = "0" + metm;
            }
            if (mets < 10) {
                mets = "0" + mets;
            }
        }

        this.screen.addText(meth + ":" + metm + ":" + mets, 5, 580);
        if (OV.mission.met < 515) {
            this.screen.addText("Range: " + Math.round(OV.mission.telemetryPos.downrange_m*1000)/1000, 5, 560);
            this.screen.addText("Alt: " + Math.round(OV.mission.telemetryPos.alt_m*1000)/1000, 5, 540);
            this.screen.addText("Velocity: " + Math.round(OV.mission.telemetryPos.V*1000)/1000, 5, 520);
            this.screen.addText("Mach: " + Math.round(OV.mission.telemetryPos.mach/3.6*1000)/1000, 5, 500);
            this.screen.addText("LH2: " + Math.round(OV.et.lh2), 10, 140);
            this.screen.addText("LOX: " + Math.round(OV.et.lox), 10, 160);
        }

        if (OV.computers.clasComputer.triggerState) {
            this.screen.addText("CLAS TRIGGERED", 105, 5);
        }
    }

    update() {
        if (!this.orbiter) return;
        this.drawArtificialHorizon(
            this.orbiter.IMU.pitch,
            this.orbiter.IMU.roll,
            this.orbiter.IMU.yaw
        );
        this.addListedGraphics();

        if (this.popup) { this.popUp(this.popupType, this.popupText); }
    }

    // Generic popup
    popUp(type, text) {
        this.popup = true;
        this.popupType = type;
        this.popupText = text;
        this.screen.addRect("white", 350, 250, 550, 350);
        if (type === "error") {
            this.screen.addRect("red", 350, 250, 550, 270);
            this.screen.addText("ERROR!", 355, 253);
        }
        this.screen.addText(text, 355, 273);
    }
    addGraphicToList(type, values) {
        return this.graphicsList.push([type, values]);
    }
    removeGraphicFromList(id) {
        this.graphicsList.pop(id);
    }
    async addListedGraphics() {
        this.graphicsList.forEach(element => {
            const temp = element[1];
            switch(element[0]) {
                case "text":
                    this.screen.addText(temp[0], temp[1], temp[2]);
            }
        })
    }

    triggerUpdate(pitch, roll, yaw) {
        this.drawArtificialHorizon(pitch, roll, yaw);
    }

    stop() {
        clearInterval(this.intervalId);
    }
}
