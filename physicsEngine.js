import THREE from 'three.js';
import { computeAthmospere, getAirDensity } from './calcTools.js';
import { airDensityAtAltitude, airDensityDryAir } from 'weather-formulas/airDensity';
import { densityFog } from 'three/tsl';

const EARTH_RADIUS = 6378137;

export class PhysicsEngine {
    constructor() {
        this.physicsObjects = {};
    }
    add(obj) {
        this.physicsObjects[obj.name] = obj;
    }
    update() {
        Object.entries(this.physicsObjects).forEach(([key, obj]) => {
            obj.update();
        })
    }
}

export class SpaceObject {
    constructor(id, name, locVec = { x: 0, y: 0, z: 0 }, faceVec = { x: 0, y: 0, z: 0 }, velVec = { x: 0, y: 0, z: 0 }, upVec = { x: 0, y: 0, z: 0 }, thrustN = 0, mass = 10, canDock = false, dockingPorts = [], refArea) {
        this.id = id;
        this.name = name;
        this.canDock = canDock;
        this.dockingPorts = dockingPorts;
        this.locVec = new THREE.Vector3(locVec.x, locVec.y, locVec.z);
        this.faceVec = new THREE.Vector3(faceVec.x, faceVec.y, faceVec.z);
        this.velVec = new THREE.Vector3(velVec.x, velVec.y, velVec.z);
        this.up = new THREE.Vector3(upVec.x, upVec.y, upVec.z);
        this.right = new THREE.Vector3().crossVectors(this.faceVec, this.up)
        this.fThrust = this.faceVec.clone().setLength(thrustN);
        this.totalMass = mass;
        this.lastUpdate = performance.now();
        this.translateRate = { x: 0, y: 0, z: 0 };
        this.lasttranslateRate = { x: 0, y: 0, z: 0 };
        this.referenceArea = refArea;
        this.verticalSpeed = new THREE.Vector3();
    }
    setLocVec(x, y, z) {
        this.locVec.set(x, y, z);
    }
    setFaceVec(x, y, z) {
        this.faceVec.set(x, y, z)
    }
    setFaceVecFromVector(vector) {
        this.faceVec = vector;
        this.right = new THREE.Vector3().crossVectors(this.faceVec.clone().normalize(), this.up.clone().normalize())
    }
    setUpFromVector(vector) {
        this.up = vector;
        this.right = new THREE.Vector3().crossVectors(this.faceVec.clone().normalize(), this.up.clone().normalize())
    }
    setTranslateRates(rates) {
        this.translateRate = rates;
    }
    setMass(mass) {
        this.totalMass = mass;
    }
    setThrust(thrustN) {
        this.fThrust = this.faceVec.clone().setLength(thrustN)
    }
    update() {
        const now = performance.now();
        const dt = (now - this.lastUpdate) / 1000; // seconds
        this.lastUpdate = now;
        let localG = 9.81 * Math.pow(EARTH_RADIUS / this.locVec.length(), 2);
        let fGravity = this.locVec.clone().normalize().multiplyScalar(-localG * this.totalMass);
        const h = this.locVec.length() - EARTH_RADIUS;

        //let aeroData = computeAthmospere(h, this.velVec.length(), 10);
        let density = getAirDensity(h)
        //console.log(dt)
        let fDrag = new THREE.Vector3(1, 0, 0);
        let fLift = new THREE.Vector3(0, 1, 0);
        let fLiftDrag = new THREE.Vector3();
        const thrustFront = this.faceVec.clone().normalize().multiplyScalar(this.translateRate.x)// - this.lasttranslateRate.x);
        const thrustRight = new THREE.Vector3(0, 0, 1).clone().normalize().multiplyScalar(this.translateRate.z)// - this.lasttranslateRate.z);
        const thrustUp = new THREE.Vector3(0, 1, 0).clone().normalize().multiplyScalar(this.translateRate.y)// - this.lasttranslateRate.y);
        const translateForce = new THREE.Vector3().add(thrustFront).add(thrustRight).add(thrustUp);

        if (h < 100000) { // Unter 100km
            console.log(density);
            let dragMag = 0.5 * density * Math.pow(this.velVec.length(), 2) * this.referenceArea;
            fDrag = this.velVec.clone().normalize().multiplyScalar(dragMag)//.negate();
            let lifMag = 0.5 * density * Math.pow(this.velVec.length(), 2) * this.referenceArea;
            fLift = thrustUp.clone().normalize().multiplyScalar(lifMag);
            if (this.name == "OV") {
                if (OV.dragChute.deployed && !OV.dragChute.jettisoned) {
                    fDrag.add(this.velVec.clone().normalize().multiplyScalar(2074401))
                }
                if (OV.brakes.applied) {
                    fDrag.add(this.velVec.clone().normalize().multiplyScalar(5423271))
                }
                if (OV.parachutes.brake.deployed) {
                    fDrag.add(this.velVec.clone().normalize().multiplyScalar(25))
                }
                if (OV.parachutes.mainA.deployed) {
                    fDrag.add(this.velVec.clone().normalize().multiplyScalar(17500))
                }
                if (OV.parachutes.mainB.deployed) {
                    fDrag.add(this.velVec.clone().normalize().multiplyScalar(17500))
                }
                if (OV.parachutes.mainC.deployed) {
                    fDrag.add(this.velVec.clone().normalize().multiplyScalar(17500))
                }
                if (OV.parachutes.backUpA.deployed) {
                    fDrag.add(this.velVec.clone().normalize().multiplyScalar(17500))
                }
            }
            if (this.name == "OV" && OV.computers.clasComputer.triggerState) {
            fLiftDrag = fDrag;

            } else {
            fLiftDrag = fDrag.clone();
            }

        }
        if (this.name == "OV") {
            //console.log(this.translateRate, thrustFront.length(), thrustUp.length(), thrustRight.length())
        }
        let radialDir = this.locVec.clone().normalize();
        this.verticalSpeed = this.velVec.dot(radialDir);
        let fTotal;
        let altitude = this.locVec.length() - EARTH_RADIUS;
        if (this.verticalSpeed < 10 && altitude < 100000) {
            fTotal = new THREE.Vector3().add(this.fThrust).add(fGravity).sub(fDrag).sub(fLift)//.add(translateForce);
        } else {
            fTotal = new THREE.Vector3().add(this.fThrust).add(fGravity)//.sub(fDrag)//.add(translateForce);
        }
        console.log(fDrag, fLift)
        //console.log(translateForce)
        let accelVec = fTotal.divideScalar(this.totalMass);

        if (accelVec.length() > 500) {
            accelVec.setLength(500);
        }
        this.lasttranslateRate = this.translateRate;
        //console.log(this.up, this.right)

        // 5. Integration (Euler)
        this.velVec.add(accelVec.multiplyScalar(dt * 3.6))
        this.locVec.add(this.velVec.clone().multiplyScalar(dt / 3.6 / 10));

        // Integration (Euler)
        let deltaV = accelVec.clone().multiplyScalar(dt / 3.6);
        this.velVec.add(deltaV);

        let deltaP = this.velVec.clone().multiplyScalar(dt / 3.6);
        this.locVec.add(deltaP).add(translateForce);
        //console.log(this.velVec, this.verticalSpeed)
        //this.locVec.add(this.up);

        // Boden-Kollision & Start-Check



        if (this.name == "OV") {
            //OV.mission.telemetryPos.g = aeroData.dynamic_pressure;
            //OV.mission.telemetryPos.mach = aeroData.mach_speed;
            if (OV.software.onPad) {
                if (this.locVec.length() < EARTH_RADIUS + 30) {
                    this.locVec.setLength(EARTH_RADIUS + 30)


                    // Nur stoppen, wenn wir wirklich in den Boden REINFLIEGEN
                    if (this.verticalSpeed < -0.1) {
                        // Wir projizieren die Geschwindigkeit auf den Boden (verhindert festkleben)
                        this.velVec.sub(radialDir.multiplyScalar(this.verticalSpeed));
                    }

                    // Wenn wir fast stehen und am Boden sind: Komplett stoppen
                    if (this.velVec.length() < 0.1) {
                        this.velVec.set(0, 0, 0);
                    }
                }
                if (this.verticalSpeed > 10) {
                    OV.software.onPad = false;
                }

            }
        }
        if (altitude < 25) {
            if (altitude < 0) {
                this.locVec.setLength(EARTH_RADIUS);

                // Nur stoppen, wenn wir wirklich in den Boden REINFLIEGEN
                if (this.verticalSpeed < -0.1) {
                    // Wir projizieren die Geschwindigkeit auf den Boden (verhindert festkleben)
                    this.velVec.sub(radialDir.multiplyScalar(this.verticalSpeed));
                }

                // Wenn wir fast stehen und am Boden sind: Komplett stoppen
                if (this.velVec.length() < 0.1) {
                    this.velVec.set(0, 0, 0);
                }
            }
            //velocityVector.setLength(velocityVector.length() * 3.6)
        }
    }
}

export class DockingPort {
    constructor(name) {
        this.name = name;
        this.hasObject = false; // || SpaceObject
    }
    dock(object) {
        this.hasObject = object;
    }
    undock() {
        this.hasObject = false;
    }
}
