const mE = 5.9722 * (10**24); // Masse Erde (kg)
const rE = 6378137; // Radius Erde (m)


export class Orbitalmodell {
    constructor() {
        this.inclination = 0;
        this.apoapsis = 6800000; //m, 400 km
        this.periapsis = 6600000; //m, 200 km 
        this.a = (this.apoapsis + this.periapsis) / 2; // Grosse Halbachse (m)
        this.e = (this.apoapsis - this.periapsis) / (this.apoapsis + this.periapsis); // Ekzentritaet
        this.p = (this.apoapsis - this.periapsis) / 2 + this.periapsis; // Kleine Halbachse (m)
    }
    getPointOnOrbit(lon = 0) {
        lat = ((Math.sin((lon / 180) * Math.PI) * (this.inclination / 90)) * 90);
        return lat;
    }
    //getPointOnOrbit(lon=0) {

    //}

    getHeadingOnOrbitPoint(lon = 0) {
        angle = (Math.atan(Math.cos((lon / 180) * Math.PI) * (this.inclination / 90)) * (this.inclination / 90));
        return angle;
    }
    getLonAtHeading(angle = 0) {
        if (this.inclination == 0) return;
        lon = (180 / Math.PI) * Math.acos(Math.tan(angle / (this.inclination / 90)) / (this.inclination / 90));
        return lon
    }
    getAscendingNode(lat = 0) {
        if (this.inclination == 0) return;
        lon = (180 / Math.PI) * Math.asin(lat / this.inclination);
        return lon;
    }
    getOrbitSpeed(height = 0) {
        let r = rE + height;
        let vel = Math.sqrt(mE*((2/r)-(1/this.a)))
    }
    //kommt mehr, nur grundlage
}
