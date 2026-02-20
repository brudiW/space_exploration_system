export class maneuverHandler {
    constructor() { }
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
        const imu_rc = new BroadcastChannel("imu_rcv")
        console.log("Attitude maneuver init");
        let rates;



        if (!OV.inAbort) {
            rates = this.computeRates(
                OV.imuData,
                target,
                { pitch: 5, roll: 5, yaw: 10 }
            );
        } else {
            rates = this.computeRates(
                OV.imuData,
                target,
                { pitch: 30, roll: 30, yaw: 30 }
            );
        }

        imu_rc.postMessage([
            rates.pitch,
            rates.roll,
            rates.yaw
        ]);

        if (!OV.inAbort) {
            await this.waitForOrientation(
                [target.pitch - 0.2, target.pitch + 0.2],
                [target.roll - 0.2, target.roll + 0.2],
                [target.yaw - 0.2, target.yaw + 0.2]
            );
            imu_rc.postMessage([0, 0, 0]);
        } else {
            await this.waitForOrientation(
                [target.pitch - 5, target.pitch + 5],
                [target.roll - 5, target.roll + 5],
                [target.yaw - 5, target.yaw + 5]
            );
            imu_rc.postMessage([0, 0, 0]);
        }

        if (await console.log("Attitude maneuver complete")) { return true; }


    }

    waitForOrientation([pmin, pmax], [rmin, rmax], [ymin, ymax]) {
        const imu_bc = new BroadcastChannel("imu");
        return new Promise(resolve => {
            imu_bc.onmessage = (e) => {
                OV.imuData = e.data;
                const yaw = OV.imuData.yaw;
                const roll = OV.imuData.roll;
                const pitch = OV.imuData.pitch;
                if (yaw >= ymin && yaw <= ymax && roll >= rmin && roll <= rmax && pitch >= pmin && pitch <= pmax) {
                    imu_bc.close();
                    resolve();
                }
            };
        });
    }




}