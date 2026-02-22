export class maneuverHandler {
    constructor(ov = null) {
        Object.defineProperty(this, 'OV', {
            value: ov,
            enumerable: false,
            writable: true
        });

    }
    setOV(ov) {
        this.OV = ov;
    }
    normalizeDeg(angle) {
        return ((angle + 180) % 360 + 360) % 360 - 180;
    }
    attitudeError(current, target) {
        return {
            pitch: this.normalizeDeg(target.pitch - current.pitch),
            roll: this.normalizeDeg(target.roll - current.roll),
            yaw: this.normalizeDeg(target.yaw - current.yaw)
        };

    }
    computeRates(current, target, maxRates) {
        const err = this.attitudeError(current, target);

        // Time required per axis at max rate
        const times = {
            pitch: Math.abs(err.pitch) / Math.abs(maxRates.pitch || 1),
            roll: Math.abs(err.roll) / Math.abs(maxRates.roll || 1),
            yaw: Math.abs(err.yaw) / Math.abs(maxRates.yaw || 1)
        };

        // Total maneuver time = longest axis
        const T = Math.max(times.pitch, times.roll, times.yaw);

        // Avoid divide-by-zero
        if (T === 0) {
            return { pitch: 0, roll: 0, yaw: 0, time: 0 };
        }

        return {
            pitch: err.pitch / T,
            roll: err.roll / T,
            yaw: err.yaw / T,
            time: T
        };
    }
    async maneuverTo(target) {
        //console.log(global.OV);
        //console.log(this.OV)
        console.log("Attitude maneuver init");
        let rates;



        if (!global.OV.inAbort) {
            rates = this.computeRates(
                global.OV.IMU,
                target,
                { pitch: 5, roll: 5, yaw: 10 }
            );
        } else {
            rates = this.computeRates(
                global.OV.IMU,
                target,
                { pitch: 30, roll: 30, yaw: 30 }
            );
        }

        global.OV.IMU.setRates([
            rates.pitch,
            rates.roll,
            rates.yaw
        ]);

        if (!global.OV.inAbort) {
            await this.waitForOrientation(
                [target.pitch - 0.2, target.pitch + 0.2],
                [target.roll - 0.2, target.roll + 0.2],
                [target.yaw - 0.2, target.yaw + 0.2]
            );
            global.OV.IMU.setRates([0, 0, 0]);
        } else {
            await this.waitForOrientation(
                [target.pitch - 5, target.pitch + 5],
                [target.roll - 5, target.roll + 5],
                [target.yaw - 5, target.yaw + 5]
            );
            global.OV.IMU.setRates([0, 0, 0]);
        }

        if (await console.log("Attitude maneuver complete")) { return true; }


    }

    waitForOrientation([pmin, pmax], [rmin, rmax], [ymin, ymax]) {
        //const imu_bc = new BroadcastChannel("imu");
        return new Promise(resolve => {
            const imu_event = new BroadcastChannel("imu_event");
            imu_event.onmessage = (e) => {
                const yaw = global.OV.IMU.yaw;
                const roll = global.OV.IMU.roll;
                const pitch = global.OV.IMU.pitch;
                if (yaw >= ymin && yaw <= ymax && roll >= rmin && roll <= rmax && pitch >= pmin && pitch <= pmax) {
                    resolve();
                }
            }
        });
    }




}
