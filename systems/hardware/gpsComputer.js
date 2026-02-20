//////////////////////
// gpsComputer.js
//////////////////////

// ----------------------
// Helper functions
// ----------------------
function dmsToDecimal(deg, min, sec, hemisphere) {
    let dec = deg + min / 60 + sec / 3600;
    if (hemisphere === "S" || hemisphere === "W") dec *= -1;
    return dec;
}

function distanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const toRad = d => d * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function projectFromLaunch(lat0, lon0, bearingDeg, rangeKm) {
    const R = 6371; // Earth radius in km
    const φ1 = lat0 * Math.PI / 180;
    const λ1 = lon0 * Math.PI / 180;
    const θ = bearingDeg * Math.PI / 180;
    const δ = rangeKm / R;

    const φ2 = Math.asin(
        Math.sin(φ1) * Math.cos(δ) +
        Math.cos(φ1) * Math.sin(δ) * Math.cos(θ)
    );

    const λ2 = λ1 + Math.atan2(
        Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
        Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2)
    );

    return {
        lat: φ2 * 180 / Math.PI,
        lon: λ2 * 180 / Math.PI
    };
}

// ----------------------
// GPSComputer Class
// ----------------------
// gpsComputer.js

export class GPSComputer {
    constructor(launchPoint, bearingDeg = 0) {
        this.launchPoint = launchPoint; // { lat, lon }
        this.bearingDeg = bearingDeg;   // direction to project downrange
    }

    getPositionFromTelemetry(telemetry) {
        // telemetry: { V, alt_m, downrange_m, mach }
        const pos = projectFromLaunch(
            this.launchPoint.lat,
            this.launchPoint.lon,
            this.bearingDeg,
            telemetry.downrange_m / 1000 // km
        );

        return {
            lat: pos.lat,
            lon: pos.lon,
            alt: telemetry.alt_m,
            speed: telemetry.V
        };
    }
}


// ----------------------
// AbortGuidance Class
// ----------------------
export class AbortGuidance {
    constructor(abortSites) {
        this.abortSites = abortSites; // array of abort site objects
        this.abortPriority = ["RTLS", "CONTINENTAL", "TAL", "AOA"];
    }

    availableEnergy(speed, alt) {
        const g = 9.81;
        return (speed ** 2) / 2 + g * alt * 1000;
    }

    maxCrossRangeKm(speed) {
        if (speed < 3000) return 400;
        if (speed < 6000) return 800;
        return 1400;
    }

    canReachSite(state, site) {
        if (state.met < site.minMET || state.met > site.maxMET) return false;

        const dist = distanceKm(state.lat, state.lon, site.lat, site.lon);
        const crossRange = Math.abs(dist - state.range);

        if (crossRange > this.maxCrossRangeKm(state.speed)) return false;

        if (state.alt < 25 && site.type !== "RTLS") return false;

        return true;
    }

    selectSite(state) {
        const reachable = this.abortSites.filter(site =>
            this.canReachSite(state, site)
        );

        if (reachable.length === 0) return null;

        reachable.sort((a, b) => {
            const pa = this.abortPriority.indexOf(a.type);
            const pb = this.abortPriority.indexOf(b.type);
            if (pa !== pb) return pa - pb;

            const da = distanceKm(state.lat, state.lon, a.lat, a.lon);
            const db = distanceKm(state.lat, state.lon, b.lat, b.lon);
            return da - db;
        });

        return reachable[0];
    }

    getGuidance(state) {
        const site = this.selectSite(state);
        if (!site) return null;

        const runway = site.runways?.[0]?.id || "any";
        const distance = distanceKm(state.lat, state.lon, site.lat, site.lon).toFixed(1);

        return {
            site: site.name,
            icao: site.icao,
            mode: site.type,
            preferredRunway: runway,
            distance_km: distance
        };
    }
}
