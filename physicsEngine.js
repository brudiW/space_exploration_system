import THREE from 'three';

export class PhysicsEngine {
	constructor() {
        this.physicsObjects = {};
    }
    add(obj) {
    	this.physicsObjects[obj.name] = obj;
    }
    update() {
        this.physicsObjects.forEach(obj => {
        	obj.update();
        }
    }
}

export class SpaceObject {
	constructor(id, name, locVec = {x: 0, y: 0, z: 0}, faceVec = {x: 0, y: 0, z: 0}, velVec = {x: 0, y: 0, z: 0}) {
    	this.id = id;
        this.name = name;
        this.locVec = new THREE.Vector3(locVec.x, locVec.y, locVec.z);
        this.faceVec = new THREE.Vector3(faceVec.x, faceVec.y, faceVec.z);
        this.velVec = new THREE.Vector3(velVec.x, velVec.y, velVec.z);
    }
    update() {
    	const gravityForce = locVec.clone().normalize().multiplyScalar(9.81);
        let accelVec = new THREE.Vector3(0, 0, 0);
        accelVec.sub(gravityForce);
        this.velVec.add(accelVec);
        this.locVec.add(this.velVec);
    }
}
        