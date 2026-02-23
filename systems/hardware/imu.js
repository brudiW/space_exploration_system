const imu_event = new BroadcastChannel("imu_event");

export class IMU {
    constructor() {
        this.pitch = 90;
        this.yaw = 213.3;
        this.roll = -180;
        this.prate = 0;
        this.yrate = 0;
        this.rrate = 0;
        this.yawMode = "heading"; // "vector"
        this.lastTime = performance.now();
        this.update = this.update.bind(this)
    }
    update() {

        const now = performance.now();
        const dt = (now - this.lastTime) / 1000; // seconds
        this.lastTime = now;

        this.pitch += this.prate * dt;
        this.roll += this.rrate * dt;
        this.yaw += this.yrate * dt;

        // Clamp / wrap
        this.pitch = ((this.pitch + 180) % 360) - 180;
        if (this.roll < -180) {
            this.roll += 360;
        } else if (this.roll > 180) {
            this.roll -= 360;
        }
        this.yaw = (this.yaw + 360) % 360;
        imu_event.postMessage("");


        setImmediate(this.update)
    }
    setRates(rates) {
        this.prate = rates[0];
        this.rrate = rates[1];
        this.yrate = rates[2];
    }
}
