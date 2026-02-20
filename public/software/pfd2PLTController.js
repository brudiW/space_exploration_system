import { TouchScreen } from "./classes/touchscreen.js";

export class PFD2PLTController {
    constructor(canvasId, orbiter = null) {
        this.canvas = document.getElementById(canvasId);
        this.screen = new TouchScreen(400, 600, 0, 0, canvasId, this.canvas);
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
        this.displayedTab = "ssme"

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
            case "apu":
                this.apuInterface();
                break;
            case "rcs_oms":
                this.OMS_RCS_interface();
                break;
            case "ssme":
                this.ssmeInterface();
                break;

        }
        this.addListedGraphics();




        this.screen.addLine("lime", 310, 575, 400, 575);
        this.screen.addLine("lime", 310, 575, 310, 600);
        this.screen.addLine("lime", 340, 575, 340, 600);
        this.screen.addLine("lime", 370, 575, 370, 600);
        this.screen.addText("|||", 320, 580);
        this.screen.addText("O", 350, 580);
        this.screen.addText("<", 385, 580);
        //this.addTouchZone("menu", 310, 575, 30, 25,);
        this.addTouchZone("menu", 310, 575, 30, 25, (touch, orbiter) => { this.displayedTab = "menu"; })
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
            this.screen.addText("APU/HYD", 15, 70);
            this.screen.addText("AVIONICS", 15, 90);
            this.screen.addText("RCS/OMS", 15, 110);
            this.screen.addText("SSME, ET, SRB", 15, 130);

            // Touchzones
            this.addTouchZone("abortmodes", 15, 45, 300, 20, (touch, orbiter) => { this.displayedTab = "abortModes" })
            this.addTouchZone("apu", 15, 65, 300, 20, (touch, orbiter) => { this.displayedTab = "apu" })
            this.addTouchZone("avionics", 15, 85, 300, 20, (touch, orbiter) => { this.displayedTab = "avionics" })
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
    apuInterface() {
        this.screen.clearRect();
        if (this.orbiter != null) {
            this.screen.addFilledRect("darkslategray", 0, 0, 400, 25);
            // Texts A
            this.screen.addText("APU/HYD", 10, 7);

            this.screen.addText("APU", 15, 30);
            this.screen.addText("STATE", 15, 50);
            this.screen.addText("SPEED %", 15, 70);
            this.screen.addText("FUEL QTY", 15, 90);
            this.screen.addText("FUEL PRESS", 15, 110);
            this.screen.addText("FUEL TEMP", 15, 130);
            this.screen.addText("H2O QTY", 15, 150);
            this.screen.addText("H2O PRESS", 15, 170);
            this.screen.addText("H20 TEMP", 15, 190);
            this.screen.addText("OIL QTY", 15, 210);
            this.screen.addText("OIL PRESS", 15, 230);
            this.screen.addText("OIL TEMP", 15, 250);
            this.screen.addText("APU TEMP", 15, 270);

            this.screen.addText(OV.APUs.APUa.id, 120, 30);
            this.screen.addText(OV.APUs.APUa.state, 120, 50);
            this.screen.addText(OV.APUs.APUa.speedPerc, 120, 70);
            this.screen.addText(OV.APUs.APUa.fuelQty, 120, 90);
            this.screen.addText(OV.APUs.APUa.fuelPress, 120, 110);
            this.screen.addText(OV.APUs.APUa.fuelTemp, 120, 130);
            this.screen.addText(OV.APUs.APUa.h2oQty, 120, 150);
            this.screen.addText(OV.APUs.APUa.h2oPress, 120, 170);
            this.screen.addText(OV.APUs.APUa.h2oTemp, 120, 190);
            this.screen.addText(OV.APUs.APUa.oilQty, 120, 210);
            this.screen.addText(OV.APUs.APUa.oilPress, 120, 230);
            this.screen.addText(OV.APUs.APUa.oilTemp, 120, 250);
            this.screen.addText(OV.APUs.APUa.apuTemp, 120, 270);



            this.screen.addText(OV.APUs.APUb.id, 220, 30);
            this.screen.addText(OV.APUs.APUb.state, 220, 50);
            this.screen.addText(OV.APUs.APUb.speedPerc, 220, 70);
            this.screen.addText(OV.APUs.APUb.fuelQty, 220, 90);
            this.screen.addText(OV.APUs.APUb.fuelPress, 220, 110);
            this.screen.addText(OV.APUs.APUb.fuelTemp, 220, 130);
            this.screen.addText(OV.APUs.APUb.h2oQty, 220, 150);
            this.screen.addText(OV.APUs.APUb.h2oPress, 220, 170);
            this.screen.addText(OV.APUs.APUb.h2oTemp, 220, 190);
            this.screen.addText(OV.APUs.APUb.oilQty, 220, 210);
            this.screen.addText(OV.APUs.APUb.oilPress, 220, 230);
            this.screen.addText(OV.APUs.APUb.oilTemp, 220, 250);
            this.screen.addText(OV.APUs.APUb.apuTemp, 220, 270);



            this.screen.addText(OV.APUs.APUc.id, 320, 30);
            this.screen.addText(OV.APUs.APUc.state, 320, 50);
            this.screen.addText(OV.APUs.APUc.speedPerc, 320, 70);
            this.screen.addText(OV.APUs.APUc.fuelQty, 320, 90);
            this.screen.addText(OV.APUs.APUc.fuelPress, 320, 110);
            this.screen.addText(OV.APUs.APUc.fuelTemp, 320, 130);
            this.screen.addText(OV.APUs.APUc.h2oQty, 320, 150);
            this.screen.addText(OV.APUs.APUc.h2oPress, 320, 170);
            this.screen.addText(OV.APUs.APUc.h2oTemp, 320, 190);
            this.screen.addText(OV.APUs.APUc.oilQty, 320, 210);
            this.screen.addText(OV.APUs.APUc.oilPress, 320, 230);
            this.screen.addText(OV.APUs.APUc.oilTemp, 320, 250);
            this.screen.addText(OV.APUs.APUc.apuTemp, 320, 270);
            //this.id = id;
            //this.state = "off"; //"ready", "on", "fail"
            //this.autoStartEnabble = false;
            //this.speedPerc = 0.0;
            //this.fuelQty = 100.0;
            //this.fuelPress = 120.0;
            /*this.fuelTemp = 70.0;
            this.h2oQty = 100.0;
            this.h20Press = 4.0;
            this.h20Temp = 25.0;
            this.oilQty = 100.0;
            this.oilPress = 22.5;
            this.oilTemp = 60.0;
            this.apuTemp = 45.0;*/

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

            // ET Data
            this.screen.addLine("lime", 0, 168, 400, 168);
            this.screen.addText("EXTERNAL TANK", 10, 170);

            if (!OV.et.jettisoned) {
                this.screen.addText("KG", 75, 190);
                this.screen.addText("%", 135, 190);
                this.screen.addText("TEMP °C", 190, 190);
                this.screen.addText("PRESS KPA", 270, 190);

                this.screen.addText("LH2", 15, 210);
                this.screen.addText("LOX", 15, 230);

                this.screen.addText(Math.round(OV.et.lh2), 75, 210);
                this.screen.addText(Math.round((OV.et.lh2 / 106261) * 10000) / 100, 135, 210);
                this.screen.addText(Math.round(OV.et.lh2Temp * 100) / 100, 190, 210);
                this.screen.addText(Math.round(OV.et.lh2Press * 100) / 100, 270, 210);

                this.screen.addText(Math.round(OV.et.lox), 75, 230);
                this.screen.addText(Math.round((OV.et.lox / 630540) * 10000) / 100, 135, 230);
                this.screen.addText(Math.round(OV.et.loxTemp * 100) / 100, 190, 230);
                this.screen.addText(Math.round(OV.et.loxPress * 100) / 100, 270, 230);
            } else {
                this.screen.addText("NO DATA", 170, 210);
            }

            this.screen.addLine("lime", 0, 268, 400, 268);
            this.screen.addText("SOLID ROCKET BOOSTERS", 10, 270);

            this.screen.addText("L", 65, 310);
            this.screen.addText("SRB", 197, 310);
            this.screen.addText("R", 335, 310);
            this.screen.addText("IGNITED", 190, 330);
            this.screen.addText("X", 200, 350);
            this.screen.addText("Z", 200, 370);

            if (!OV.SRBs.l.seperated) {
                this.screen.addText(OV.SRBs.l.ignited, 55, 330);
                this.screen.addText(OV.SRBs.l.pos[0], 64, 350);
                this.screen.addText(OV.SRBs.l.pos[1], 64, 370);
            } else {
                this.screen.addText("NO DATA", 62, 350);
            }

            if (!OV.SRBs.r.seperated) {
                this.screen.addText(OV.SRBs.r.ignited, 325, 330);
                this.screen.addText(OV.SRBs.r.pos[0], 334, 350);
                this.screen.addText(OV.SRBs.r.pos[1], 334, 370);
            } else {
                this.screen.addText("NO DATA", 332, 350);
            }
            


        }
    }
}