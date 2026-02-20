import { TouchScreen } from "./classes/touchscreen.js";

export class SFD1CDRController {
    constructor(canvasId, orbiter = null) {
        this.canvas = document.getElementById(canvasId);
        this.screen = new TouchScreen(400, 280, 0, 0, canvasId, this.canvas);
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
        //this.canvas.addEventListener("mousedown", (e) => {setTimeout(() => {this.update()}, 10)})
        this.displayedTab = "rcs_oms"

        this.update();

        // Initial draw

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
    addTouchZone(id, x, y, width, height, callback) {
        if (this.touchZones.some(z => z.id === id)) return;
        this.touchZones.push({ id, x, y, width, height, callback });
    }
    clearTouchzones() {
        this.touchZones = [];
    }


    update() {
        this.clearTouchzones();
        if (!this.orbiter) return;
        switch (this.displayedTab) {
            case "main":
                break;
            case "menu":
                this.menuInterface();
                break;
            case "abortModes":
                this.abortModesInterface();
                break;
            case "avionics":
                this.avionicsInterface();
                break;
            case "rcs_oms":
                this.OMS_RCS_interface();
                break;
            case "ssme":
                this.ssmeInterface();
                break;

        }
        this.addListedGraphics();




        this.screen.addLine("lime", 310, 255, 400, 255);
        this.screen.addLine("lime", 310, 255, 310, 280);
        this.screen.addLine("lime", 340, 255, 340, 280);
        this.screen.addLine("lime", 370, 255, 370, 280);
        this.screen.addText("|||", 320, 260);
        this.screen.addText("O", 350, 260);
        this.screen.addText("<", 385, 260);
        //this.addTouchZone("menu", 310, 575, 30, 25,);
        this.addTouchZone("menu", 310, 255, 30, 25, (touch, orbiter) => { this.displayedTab = "menu"; })
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
            switch (element[0]) {
                case "text":
                    this.screen.addText(temp[0], temp[1], temp[2]);
            }
        })
    }

    stop() {
        clearInterval(this.intervalId);
    }


    menuInterface() {
        this.screen.clearRect();
        if (this.orbiter != null) {
            this.screen.addFilledRect("darkslategray", 0, 0, 400, 25);
            // Texts A
            this.screen.addText("MENU", 10, 7);
            this.screen.addText("A", 10, 30);
            this.screen.addText("ABORT MODES", 15, 50);
            this.screen.addText("AVIONICS", 15, 70);
            this.screen.addText("RCS/OMS", 15, 110);
            this.screen.addText("SSME, ET, SRB", 15, 130);

            // Touchzones
            this.addTouchZone("abortmodes", 15, 45, 300, 20, (touch, orbiter) => { this.displayedTab = "abortModes" })
            this.addTouchZone("avionics", 15, 65, 300, 20, (touch, orbiter) => { this.displayedTab = "avionics" })
            this.addTouchZone("rcs_oms", 15, 105, 300, 20, (touch, orbiter) => { this.displayedTab = "rcs_oms" })
            this.addTouchZone("ssme", 15, 125, 300, 20, (touch, orbiter) => { this.displayedTab = "ssme" })
        }
    }


    avionicsInterface() {
        this.screen.clearRect();
        if (this.orbiter != null) {
            this.screen.addFilledRect("darkslategray", 0, 0, 400, 25);
            // Texts A
            this.screen.addText("AVIONICS", 10, 7);
            this.screen.addText("ELEVONS", 10, 30);
            this.screen.addText("Left Elevon A", 15, 50);
            this.screen.addText("Left Elevon B", 15, 70);
            this.screen.addText("Right Elevon B", 15, 90);
            this.screen.addText("Right Elevon A", 15, 110);
            this.screen.addText("BODYFLAP", 10, 130);
            this.screen.addText("Bodyflap", 15, 150);
            this.screen.addText("RUDDER/SPEEDBRAKE", 10, 170);
            this.screen.addText("Rudder/Speedbrake", 15, 190);
            // Rects
            this.screen.addRect("lime", 190, 46, 260, 64);
            this.screen.addRect("lime", 190, 66, 260, 84);
            this.screen.addRect("lime", 190, 86, 260, 104);
            this.screen.addRect("lime", 190, 106, 260, 124);
            this.screen.addRect("lime", 190, 146, 260, 164);
            this.screen.addRect("lime", 190, 186, 260, 204);
            // Texts B
            if (!OV.avionics.LelevonA.getDisabled()) { this.screen.addText("ENABLED", 195, 50); } else { this.screen.addText("DISABLED", 195, 50); }
            if (!OV.avionics.LelevonB.getDisabled()) { this.screen.addText("ENABLED", 195, 70); } else { this.screen.addText("DISABLED", 195, 70); }
            if (!OV.avionics.RelevonB.getDisabled()) { this.screen.addText("ENABLED", 195, 90); } else { this.screen.addText("DISABLED", 195, 90); }
            if (!OV.avionics.RelevonA.getDisabled()) { this.screen.addText("ENABLED", 195, 110); } else { this.screen.addText("DISABLED", 195, 110); }
            if (!OV.avionics.bodyflap.getDisabled()) { this.screen.addText("ENABLED", 195, 150); } else { this.screen.addText("DISABLED", 195, 150); }
            if (!OV.avionics.rudderBrake.getDisabled()) { this.screen.addText("ENABLED", 195, 190); } else { this.screen.addText("DISABLED", 195, 190); }
            // Texts C
            this.screen.addText(OV.avionics.LelevonA.targetPos, 275, 50);
            this.screen.addText(OV.avionics.LelevonB.targetPos, 275, 70);
            this.screen.addText(OV.avionics.RelevonB.targetPos, 275, 90);
            this.screen.addText(OV.avionics.RelevonA.targetPos, 275, 110);
            this.screen.addText(OV.avionics.bodyflap.targetPos, 275, 150);
            this.screen.addText(OV.avionics.rudderBrake.targetPos, 275, 190);
            // Texts D
            this.screen.addText(OV.avionics.LelevonA.pos, 305, 50);
            this.screen.addText(OV.avionics.LelevonB.pos, 305, 70);
            this.screen.addText(OV.avionics.RelevonB.pos, 305, 90);
            this.screen.addText(OV.avionics.RelevonA.pos, 305, 110);
            this.screen.addText(OV.avionics.bodyflap.pos, 305, 150);
            this.screen.addText(OV.avionics.rudderBrake.pos, 305, 190);
            // Touchzones
            this.addTouchZone("LelevonA", 190, 46, 70, 18, (touch, orbiter) => { OV.avionics.LelevonA.disabled = !OV.avionics.LelevonA.disabled });
            this.addTouchZone("LelevonB", 190, 66, 70, 18, (touch, orbiter) => { OV.avionics.LelevonB.disabled = !OV.avionics.LelevonB.disabled });
            this.addTouchZone("RelevonB", 190, 86, 70, 18, (touch, orbiter) => { OV.avionics.RelevonB.disabled = !OV.avionics.RelevonB.disabled });
            this.addTouchZone("RelevonA", 190, 106, 70, 18, (touch, orbiter) => { OV.avionics.RelevonA.disabled = !OV.avionics.RelevonA.disabled });
            this.addTouchZone("bodyflap", 190, 146, 70, 18, (touch, orbiter) => { OV.avionics.bodyflap.disabled = !OV.avionics.bodyflap.disabled });
            this.addTouchZone("rudderBrake", 190, 186, 70, 18, (touch, orbiter) => { OV.avionics.rudderBrake.disabled = !OV.avionics.rudderBrake.disabled });
        }
    }
    abortModesInterface() {
        this.screen.clearRect();
        if (this.orbiter != null) {
            this.screen.addFilledRect("darkslategray", 0, 0, 400, 25);
            // Texts A
            this.screen.addText("ABORT MODES", 10, 7);
            this.screen.addText("SINGLE ENGINE", 15, 30);
            this.screen.addText("TWO ENGINE", 15, 50);
            this.screen.addText("THREE ENGINE", 15, 70);
            // Rects A

            switch (OV.intactAbortMode.singleEngine) {
                case "TAL":
                    this.screen.addRect("lime", 160, 26, 210, 44);
                    break;
                case "ATO":
                    this.screen.addRect("lime", 210, 26, 260, 44);
                    break;
                case "AOA":
                    this.screen.addRect("lime", 260, 26, 310, 44);
                    break;
                case "":
                case "NONE":
                    this.screen.addRect("lime", 310, 26, 360, 44);
                    break;
            }
            switch (OV.intactAbortMode.twoEngine) {
                case "RTLS":
                    this.screen.addRect("lime", 110, 46, 160, 64);
                    break;
                case "TAL":
                    this.screen.addRect("lime", 160, 46, 210, 64);
                    break;
                case "ATO":
                    this.screen.addRect("lime", 210, 46, 260, 64);
                    break;
                case "AOA":
                    this.screen.addRect("lime", 260, 46, 310, 64);
                    break;
                case "":
                case "NONE":
                    this.screen.addRect("lime", 310, 46, 360, 64);
                    break;
            }
            switch (OV.intactAbortMode.threeEngine) {
                case "RTLS":
                    this.screen.addRect("lime", 110, 66, 160, 84);
                    break;
                case "TAL":
                    this.screen.addRect("lime", 160, 66, 210, 84);
                    break;
                case "ATO":
                    this.screen.addRect("lime", 210, 66, 260, 84);
                    break;
                case "AOA":
                    this.screen.addRect("lime", 260, 66, 310, 84);
                    break;
                case "":
                case "NONE":
                    this.screen.addRect("lime", 310, 66, 360, 84);
                    break;
            }


            // Texts B
            this.screen.addText("TAL", 170, 30);
            this.screen.addText("ATO", 220, 30);
            this.screen.addText("AOA", 270, 30);
            this.screen.addText("NONE", 320, 30);
            this.screen.addText("RTLS", 120, 50);
            this.screen.addText("TAL", 170, 50);
            this.screen.addText("ATO", 220, 50);
            this.screen.addText("AOA", 270, 50);
            this.screen.addText("NONE", 320, 50);
            this.screen.addText("RTLS", 120, 70);
            this.screen.addText("TAL", 170, 70);
            this.screen.addText("ATO", 220, 70);
            this.screen.addText("AOA", 270, 70);
            this.screen.addText("NONE", 320, 70);

            // Touch Zones
            this.addTouchZone("1eTAL", 160, 26, 50, 18, (touch, orbiter) => OV.intactAbortMode.singleEngine = "TAL")
            this.addTouchZone("1eATO", 210, 26, 50, 18, (touch, orbiter) => OV.intactAbortMode.singleEngine = "ATO")
            this.addTouchZone("1eAOA", 270, 26, 50, 18, (touch, orbiter) => OV.intactAbortMode.singleEngine = "AOA")
            this.addTouchZone("1eNONE", 310, 26, 50, 18, (touch, orbiter) => OV.intactAbortMode.singleEngine = "NONE")

            this.addTouchZone("2eRTLS", 110, 46, 50, 18, (touch, orbiter) => OV.intactAbortMode.twoEngine = "RTLS")
            this.addTouchZone("2eTAL", 160, 46, 50, 18, (touch, orbiter) => OV.intactAbortMode.twoEngine = "TAL")
            this.addTouchZone("2eATO", 210, 46, 50, 18, (touch, orbiter) => OV.intactAbortMode.twoEngine = "ATO")
            this.addTouchZone("2eAOA", 270, 46, 50, 18, (touch, orbiter) => OV.intactAbortMode.twoEngine = "AOA")
            this.addTouchZone("2eNONE", 310, 46, 50, 18, (touch, orbiter) => OV.intactAbortMode.twoEngine = "NONE")

            this.addTouchZone("3eRTLS", 110, 66, 50, 18, (touch, orbiter) => OV.intactAbortMode.threeEngine = "RTLS")
            this.addTouchZone("3eTAL", 160, 66, 50, 18, (touch, orbiter) => OV.intactAbortMode.threeEngine = "TAL")
            this.addTouchZone("3eATO", 210, 66, 50, 18, (touch, orbiter) => OV.intactAbortMode.threeEngine = "ATO")
            this.addTouchZone("3eAOA", 270, 66, 50, 18, (touch, orbiter) => OV.intactAbortMode.threeEngine = "AOA")
            this.addTouchZone("3eNONE", 310, 66, 50, 18, (touch, orbiter) => OV.intactAbortMode.threeEngine = "NONE")
        }
    }
    OMS_RCS_interface() {
        this.screen.clearRect();
        if (this.orbiter != null) {
            this.screen.addFilledRect("darkslategray", 0, 0, 400, 25);
            // Texts A
            this.screen.addText("RCS/OMS", 10, 7);

            this.screen.addText("Front Pod", 10, 30);
            this.screen.addText("MMH", 15, 50);
            this.screen.addText("NTO", 15, 70);
            this.screen.addText(OV.rcsController.pods[0].mmh, 100, 50);
            this.screen.addText(OV.rcsController.pods[0].nto, 100, 70);

            this.screen.addText("Aft Left Pod", 10, 110);
            this.screen.addText("MMH", 15, 130);
            this.screen.addText("NTO", 15, 150);
            this.screen.addText(OV.rcsController.pods[1].mmh, 100, 130);
            this.screen.addText(OV.rcsController.pods[1].nto, 100, 150);

            this.screen.addText("Aft Right Pod", 10, 190);
            this.screen.addText("MMH", 15, 210);
            this.screen.addText("NTO", 15, 230);
            this.screen.addText(OV.rcsController.pods[2].mmh, 100, 210);
            this.screen.addText(OV.rcsController.pods[2].nto, 100, 230);

            this.screen.addText("OMS Left", 210, 30);
            this.screen.addText("ARM", 215, 50);
            this.screen.addText("THROTTLE", 215, 70);
            this.screen.addText(OV.oms.l.arm, 300, 50);
            this.screen.addText(OV.oms.l.throttle, 300, 70);

            this.screen.addText("OMS Right", 210, 110);
            this.screen.addText("ARM", 215, 130);
            this.screen.addText("THROTTLE", 215, 150);
            this.screen.addText(OV.oms.r.arm, 300, 130);
            this.screen.addText(OV.oms.r.throttle, 300, 150);
        }
    }

    ssmeInterface() {
        this.screen.clearRect();
        if (this.orbiter != null) {
            this.screen.addFilledRect("darkslategray", 0, 0, 400, 25);
            // Texts A
            this.screen.addText("SSME, ET, SRB", 10, 7);

            this.screen.addText("ENGINE", 15, 30);
            this.screen.addText("THRUST", 15, 50);
            this.screen.addText("TARGET", 15, 70);
            this.screen.addText("X", 15, 90);
            this.screen.addText("Z", 15, 110);

            this.screen.addText("LEFT", 100, 30);
            this.screen.addText(Math.round(OV.ssme.l.thrust * 100) / 100, 100, 50);
            this.screen.addText(Math.round(OV.ssme.l.targetThrust * 100) / 100, 100, 70);
            this.screen.addText(Math.round(OV.ssme.l.angx * 100) / 100, 100, 90);
            this.screen.addText(Math.round(OV.ssme.l.angz * 100) / 100, 100, 110);

            this.screen.addText("CENTER", 200, 30);
            this.screen.addText(Math.round(OV.ssme.ctr.thrust * 100) / 100, 200, 50);
            this.screen.addText(Math.round(OV.ssme.ctr.targetThrust * 100) / 100, 200, 70);
            this.screen.addText(Math.round(OV.ssme.ctr.angx * 100) / 100, 200, 90);
            this.screen.addText(Math.round(OV.ssme.ctr.angz * 100) / 100, 200, 110);

            this.screen.addText("RIGHT", 300, 30);
            this.screen.addText(Math.round(OV.ssme.r.thrust * 100) / 100, 300, 50);
            this.screen.addText(Math.round(OV.ssme.r.targetThrust * 100) / 100, 300, 70);
            this.screen.addText(Math.round(OV.ssme.r.angx * 100) / 100, 300, 90);
            this.screen.addText(Math.round(OV.ssme.r.angz * 100) / 100, 300, 110);
        }
    }
}