export class Orbitalmodell {
    constructor() {
        this.inclination = 0;
        this.apoapsis = 6800000; //m, 400 km
        this.periapsis = 6600000; //m, 200 km 
        this.a = (this.apoapsis + this.periapsis) / 2;
        this.e = (this.a - this.periapsis) / this.a;
        this.p = (this.apoapsis - this.periapsis) / 2 + this.periapsis;
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
    //kommt mehr, nur grundlage
}
