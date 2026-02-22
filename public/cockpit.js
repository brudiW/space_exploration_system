let OV = {};
async function loadOV() {
    const resp = await fetch("/api/ov");
    OV = await resp.json();
    requestAnimationFrame(loadOV)
}
loadOV();
let screens = {
    cdr_pfd1: null,
    cdr_pfd2: null,
    cdr_sfd1: null,
    cdr_sfd2: null,
    plt_pfd1: null,
    plt_pfd2: null,
    plt_sfd1: null,
    plt_sfd2: null
}

class VirtualJoystick {
    constructor(container) {
        this.container = container;

        // Create stick element
        this.stick = document.createElement("div");
        this.stick.className = "joystick-stick";
        this.stick.style.position = "absolute";
        this.stick.style.width = "40px";
        this.stick.style.height = "40px";
        this.stick.style.background = "#555";
        this.stick.style.borderRadius = "50%";
        this.stick.style.transform = "translate(-50%, -50%)";
        container.appendChild(this.stick);

        // Joystick dimensions
        this.radius = container.clientWidth / 2;
        this.stickRadius = (this.stick.clientWidth || 40) / 2; // fallback to 20px

        this.x = 0; // horizontal [-1,1]
        this.y = 0; // vertical [-1,1]
        this.dragging = false;
        this.DEADZONE = 0.07; // ignore tiny movements

        this.bindEvents();
        this.reset();
    }

    bindEvents() {
        // Mouse events
        this.container.addEventListener("mousedown", e => this.start(e.clientX, e.clientY));
        window.addEventListener("mousemove", e => this.move(e.clientX, e.clientY));
        window.addEventListener("mouseup", () => this.end());

        // Touch events
        this.container.addEventListener("touchstart", e => {
            e.preventDefault();
            this.start(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: false });

        this.container.addEventListener("touchmove", e => {
            e.preventDefault();
            this.move(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: false });

        this.container.addEventListener("touchend", () => this.end());
    }

    start(x, y) {
        this.dragging = true;
        this.update(x, y);
    }

    move(x, y) {
        if (!this.dragging) return;
        this.update(x, y);
    }

    end() {
        this.dragging = false;
        this.x = 0;
        this.y = 0;
        this.reset();
    }

    update(clientX, clientY) {
        const rect = this.container.getBoundingClientRect();
        let dx = clientX - rect.left - this.radius;
        let dy = clientY - rect.top - this.radius;

        const dist = Math.hypot(dx, dy);
        const max = this.radius - this.stickRadius;

        if (dist > max) {
            const angle = Math.atan2(dy, dx);
            dx = Math.cos(angle) * max;
            dy = Math.sin(angle) * max;
        }

        // Normalize to [-1,1] with deadzone
        this.x = Math.abs(dx / max) < this.DEADZONE ? 0 : dx / max;
        this.y = Math.abs(dy / max) < this.DEADZONE ? 0 : dy / max;

        this.stick.style.left = `${this.radius + dx}px`;
        this.stick.style.top = `${this.radius + dy}px`;
    }

    reset() {
        this.stick.style.left = "50%";
        this.stick.style.top = "50%";
    }
}

// Wait for DOM
document.addEventListener("DOMContentLoaded", () => {
    const leftJoystick = new VirtualJoystick(document.getElementById("left-joystick"));
    const rightJoystick = new VirtualJoystick(document.getElementById("right-joystick"));
    const aftJoystick = new VirtualJoystick(document.getElementById("aft-joystick"));

    // Broadcast channel to IMU
    const rc = new BroadcastChannel("imu_rcv");

    
    let yaw = 0; // optional

    // Combine joystick axes
    function mergeAxis(a, b) {
        if (a === 0 && b === 0) return 0;
        if (a === 0) return b;
        if (b === 0) return a;
        return (a + b) / 2;
    }

    function updateControls() {
        if (Object.values(OV).length > 0) {
            //console.log(OV);
            if (OV.software.pilotTakeover) {
                const mergedY = mergeAxis(leftJoystick.y, rightJoystick.y); // pitch
                const mergedX = mergeAxis(leftJoystick.x, rightJoystick.x); // roll



                // Send safely as numbers
                (async () => {
                    const resp = await fetch(`/api/ov/mergeControls`, {
                        method: "POST",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({axis: [mergedX, mergedY]})
                    })
                    if (!resp.ok) return alert("ERROR");
                })()
            }
        }

        requestAnimationFrame(updateControls);
    }

    updateControls();
});
