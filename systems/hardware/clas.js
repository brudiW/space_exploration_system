export class CLASComputer {
    constructor() {
        this.SRMs = [];
        this.armState = true;
        this.triggerState = false;
        this.failState = false;
        this.trim = [0.0, 0.0];
    }
    trigger() {
        if (this.armState) {
            this.SRMs.forEach(
                element => {
                    const e = element[0];
                    e.trigger();
                }
            )
            this.triggerState = true;
            posSim_rc.postMessage([0, 300, 0, 2900]); // Noch Überarbeiten weil aktuell Richtung hardcoded
            this.sequencer();
            return true;
        } else {
            this.failState = true;
            return false;
        }
    }
    sequencer() {
        OV.inAbort = true;
        OV.software.missionMode = "clas-abort";
        console.log("clas-sequencer");

        // Start after T+13s
        setTimeout(() => {
            let pitch;
            if (OV.IMU.pitch > 0) {
                pitch = OV.IMU.pitch - 180;
            } else {
                pitch = OV.IMU.pitch + 180;
            }
            OV.computers.maneuverHandlerTool.maneuverTo({pitch: pitch, roll: OV.IMU.roll, yaw: OV.IMU.yaw});
        }, 4900);
        setTimeout(() => {

            const checkInterval = setInterval(() => {
                const altitude = OV.positionData.altitude;
                const yRate = OV.positionData.y_rate;

                if (!OV.parachutes.brake.deployed && altitude <= 5000 && yRate < 0) {
                    // Deploy brake chute
                    OV.parachutes.brake.deploy();
                    posSim_cmd.postMessage({ type: "brakeChute" });
                    console.log("Brake chute deployed!");
                }

                if (!OV.parachutes.mainA.deployed && altitude <= 2500 && yRate < 0) {
                    // Deploy main chutes
                    OV.parachutes.mainA.deploy();
                    OV.parachutes.mainB.deploy();
                    OV.parachutes.mainC.deploy();
                    posSim_cmd.postMessage({ type: "mainChutes" });
                    console.log("Main chutes deployed!");
                }

                // Stop interval if everything is deployed
                if (OV.parachutes.brake.deployed &&
                    OV.parachutes.mainA.deployed &&
                    OV.parachutes.mainB.deployed &&
                    OV.parachutes.mainC.deployed) {
                    clearInterval(checkInterval);
                    console.log("All parachutes deployed, sequencer finished.");
                }
            }, 100); // check twice per second

        }, 13000); // initial delay
    }


}

export class CLAS_SRM {
    constructor() {
        this.trimX = 0.0;
        this.trimZ = 0.0;
        this.tempSensor = 0.0; // Temperature of the Engine in °C
    }
    trigger() {
        return true;
    }
}
