const groundChannelPos = new BroadcastChannel('ground_request_pos');

const trajectory = [
    { met: 0, range: 0, alt: 0, speed: 0 },
    { met: 10, range: 0, alt: 0.2667, speed: 215.64 },
    { met: 20, range: 0.155, alt: 1.228, speed: 497.16 },
    { met: 30, range: 0.926, alt: 3.12, speed: 838.44 },
    { met: 45, range: 2.778, alt: 6.718, speed: 1202.04 },
    { met: 60, range: 6.116, alt: 11.516, speed: 1622.16 },
    { met: 90, range: 16.576, alt: 25.904, speed: 3187.8 },
    { met: 120, range: 41.521, alt: 45.778, speed: 4744.08 },
    { met: 125, range: 46.188, alt: 48.884, speed: 4811.76 },
    { met: 150, range: 73.225, alt: 63.378, speed: 6316.56 },
    { met: 180, range: 111.688, alt: 78.027, speed: 6070.32 },
    { met: 240, range: 210.663, alt: 98.167, speed: 8099.64 },
    { met: 300, range: 343.340, alt: 109.281, speed: 10753.56 },
    { met: 360, range: 520.783, alt: 108.352, speed: 14212.08 },
    { met: 420, range: 753.494, alt: 104.892, speed: 18790.56 },
    { met: 480, range: 1064.902, alt: 102.627, speed: 24841.8 },
    { met: 510, range: 1249.977, alt: 104.586, speed: 27282.96 }
];


function interpolateTrajectory(trajectory, met) {
    if (met <= trajectory[0].met) return trajectory[0];
    if (met >= trajectory[trajectory.length-1].met) return trajectory[trajectory.length-1];
    for (let i = 0; i < trajectory.length-1; i++) {
        const wp0 = trajectory[i];
        const wp1 = trajectory[i+1];
        if (met >= wp0.met && met <= wp1.met) {
            const t = (met - wp0.met) / (wp1.met - wp0.met);
            return {
                met: met,
                range: wp0.range + (wp1.range - wp0.range) * t,
                alt: wp0.alt + (wp1.alt - wp0.alt) * t,
                speed: wp0.speed + (wp1.speed - wp0.speed) * t
            };
        }
    }
}

function speedOfSound(alt_m) {
    const T0 = 288.15;
    const L = 0.0065;
    const R = 287.05;
    const gamma = 1.4;
    const T = T0 - L * alt_m;
    return Math.sqrt(gamma * R * T);
}

// Ground station listener
groundChannelPos.onmessage = (e) => {
    const msg = e.data;
    console.log(msg)
    if (msg.type === 'getTrajectory' && typeof msg.met === 'number') {
        const state = interpolateTrajectory(trajectory, msg.met);
        const alt_m = state.alt * 1000;
        const downrange_m = state.range * 1000;
        const speed = state.speed;
        const mach = speed / speedOfSound(alt_m);

        groundChannelPos.postMessage({
            type: 'trajectoryState',
            met: msg.met,
            altitude: alt_m,
            downrange: downrange_m,
            speed: speed,
            mach: mach
        });
    }
};
