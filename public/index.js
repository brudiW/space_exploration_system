import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let physicsObjects = {};

let clock = new THREE.Clock();
let delta = 0;
let interval = 1 / 30; // 30 FPS


const canvas = document.getElementById("pos-display").getContext("2d");
canvas.fillStyle = "black";
canvas.fillRect(0, 0, 500, 200);

canvas.beginPath();
canvas.moveTo(250, 0);
canvas.lineTo(250, 200);
canvas.strokeStyle = "lime";
canvas.stroke();


/////////////////////////
// BASIC SCENE SETUP
/////////////////////////


let selectedPart = "shoulder"; // elbow, hand
let selectedMode = "rotate"; // translate

const w = window.innerWidth;
const h = window.innerHeight;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000005); // Fast schwarz
// Optional: Ein simpler Sternenhimmel
const starsGeo = new THREE.SphereGeometry(120000000, 32, 32);
const starsMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.BackSide,
    wireframe: true // Nur zum Testen, um die Hülle zu sehen
});
const starField = new THREE.Mesh(starsGeo, starsMat);
//scene.add(starField);
//scene.fog = new THREE.Fog(0x000000, 100, 1000000);

const rearPortWindowCamera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100000000);
const rearStarboardWindowCamera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100000000);
const rearTopStarboardWindowCamera = new THREE.PerspectiveCamera(50, 1.736, 0.1, 10000000);
const fwdCdrSideFrontWindowCamera = new THREE.PerspectiveCamera(60, 400 / 200, 0.1, 100000000);
const fwdPltSideFrontWindowCamera = new THREE.PerspectiveCamera(60, 400 / 200, 0.1, 100000000);




// 🔒 Feste Kamera
const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000000);
fwdCdrSideFrontWindowCamera.position.set(12.9, 1.9, 0.64);
fwdCdrSideFrontWindowCamera.rotation.set(0, (170 + 90) / 180 * Math.PI, 0);
fwdPltSideFrontWindowCamera.position.set(12.9, 1.9, -0.64);
fwdPltSideFrontWindowCamera.rotation.set(0, (-170 + 90) / 180 * Math.PI, 0)
rearPortWindowCamera.position.set(10.75, 2.12, -0.38);
rearPortWindowCamera.rotation.set(0, Math.PI / 2, 0);
rearStarboardWindowCamera.position.set(10.75, 2.12, 0.38);
rearStarboardWindowCamera.rotation.set(0, Math.PI / 2, 0);
rearTopStarboardWindowCamera.position.set(11.1202, 2.02535, 0.4148);
rearTopStarboardWindowCamera.rotation.set(Math.PI / 2, 0, -Math.PI / 2);
camera.lookAt(6378137, 0, 0);

console.log("hi")
let armCamera;
let activeCamera = rearPortWindowCamera; // Start mit Hauptkamera

const rendererFwdCdr = new THREE.WebGLRenderer({
    //antialias: true,
    //logarithmicDepthBuffer: true
});
rendererFwdCdr.setSize(1750, 750);
//rendererFwdCdr.shadowMap.enabled = true;

const rendererFwdPlt = new THREE.WebGLRenderer({
    antialias: true,
    //logarithmicDepthBuffer: true
});
rendererFwdPlt.setSize(1750, 750);
rendererFwdPlt.shadowMap.enabled = true;

const rendererRearTopPrt = new THREE.WebGLRenderer({
    antialias: true,
    //logarithmicDepthBuffer: true
});
rendererRearTopPrt.setSize(1750, 750);
rendererRearTopPrt.shadowMap.enabled = true;

const rendererRearPrt = new THREE.WebGLRenderer({
    antialias: true,
    //logarithmicDepthBuffer: true
});
rendererRearPrt.setSize(1750, 750);
rendererRearPrt.shadowMap.enabled = true;

const rendererRearTopStb = new THREE.WebGLRenderer({
    antialias: true,
    //logarithmicDepthBuffer: true
});
rendererRearTopStb.setSize(1750, 750);
rendererRearTopStb.shadowMap.enabled = true;

const rendererRearStb = new THREE.WebGLRenderer({
    antialias: true,
    //logarithmicDepthBuffer: true
});
rendererRearStb.setSize(1750, 750);
rendererRearStb.shadowMap.enabled = true;

const rendererRMS = new THREE.WebGLRenderer({
    antialias: true,
    logarithmicDepthBuffer: true
});
rendererRMS.setSize(1000, 1000);
rendererRMS.shadowMap.enabled = true;

//const controls = new OrbitControls(camera, rendererFwdPlt.domElement);
// controls.update() must be called after any manual changes to the camera's transform
camera.position.set(6378147, 100, 0);
//controls.update();
let fwdCdrElement = rendererFwdCdr.domElement;
fwdCdrElement.style.width = "1750px";
fwdCdrElement.style.height = "750px";
document.getElementById("cdr-windows-front").appendChild(fwdCdrElement);

let fwdPltElement = rendererFwdPlt.domElement;
fwdPltElement.style.width = "1750px";
fwdPltElement.style.height = "750px";
fwdPltElement.style.marginLeft = "auto"
document.getElementById("plt-windows-front").appendChild(fwdPltElement);

let RMSCamElement = rendererRMS.domElement;
RMSCamElement.style.width = "1000px";
RMSCamElement.style.height = "1000px";
document.getElementById("cam").appendChild(RMSCamElement);

let rearTopWindowPrtElement = rendererRearTopPrt.domElement;
rearTopWindowPrtElement.style.width = window.innerWidth / 2.5 + "px";
rearTopWindowPrtElement.style.height = window.innerHeight / 2.5 + "px";
rearTopWindowPrtElement.style.marginLeft = "auto"
document.getElementById("window-top-prt").appendChild(rearTopWindowPrtElement);

let rearWindowPrtElement = rendererRearPrt.domElement;
rearWindowPrtElement.style.width = window.innerWidth / 2.5 + "px";
rearWindowPrtElement.style.height = window.innerHeight / 2.5 + "px";
rearWindowPrtElement.style.marginLeft = "auto"
document.getElementById("window-aft-prt").appendChild(rearWindowPrtElement);

let rearTopWindowStbElement = rendererRearTopStb.domElement;
rearTopWindowStbElement.style.width = window.innerWidth / 2.5 + "px";
rearTopWindowStbElement.style.height = window.innerHeight / 2.5 + "px";
rearTopWindowStbElement.style.marginLeft = "auto"
document.getElementById("window-top-stb").appendChild(rearTopWindowStbElement);

let rearWindowStbElement = rendererRearStb.domElement;
rearWindowStbElement.style.width = window.innerWidth / 2.5 + "px";
rearWindowStbElement.style.height = window.innerHeight / 2.5 + "px";
rearWindowStbElement.style.marginLeft = "auto"
document.getElementById("window-aft-stb").appendChild(rearWindowStbElement);



/////////////////////////
// LIGHTING
/////////////////////////

scene.add(new THREE.AmbientLight(0x404040));

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10000000, 5000000, 10000000);
light.castShadow = true;
scene.add(light);

const LVGroup = new THREE.Group();
const OVGroup = new THREE.Group();
scene.add(OVGroup)

const loader = new GLTFLoader();
//const dracoLoader = new DRACOLoader();
//dracoLoader.setDecoderPath('./draco/');
//loader.setDRACOLoader(dracoLoader);


loader.load('scene.glb', function (gltf) {

    const model = gltf.scene;

    model.position.set(0, 0, 0); // ungefähr Nose / Docking Port
    // falls nötig
    //model.rotation.y = -Math.PI / 2

    model.scale.set(0.025, 0.025, 0.025);
    model.rotation.set(0, 0, 0)
    //console.log(model)
    OVGroup.add(model)
}, undefined, function (error) {

    console.error(error);

});

loader.load('Space Shuttle (D) door-prt.glb', function (gltf) {

    const model = gltf.scene;

    model.position.set(0, 0, 0); // ungefähr Nose / Docking Port
    // falls nötig
    //model.rotation.y = -Math.PI / 2

    model.scale.set(0.025, 0.025, 0.025);
    model.name = "Door Port"
    model.rotation.set(-90 / 180 * Math.PI, 0, 0)
    //console.log(model)
    //OVGroup.add(model)
}, undefined, function (error) {

    console.error(error);

});
loader.load('Space Shuttle (D) door-stb.glb', function (gltf) {

    const model = gltf.scene;

    model.position.set(0, 0, 0); // ungefähr Nose / Docking Port
    // falls nötig
    //model.rotation.y = -Math.PI / 2

    model.scale.set(0.025, 0.025, 0.025);
    model.rotation.set(-Math.PI / 2, 0, 0)
    model.name = "Door Starboard"
    //console.log(model)
    //OVGroup.add(model)
}, undefined, function (error) {

    console.error(error);

});
const ISS = new THREE.Group()
scene.add(ISS)

loader.load('ISS_stationary.glb', function (gltf) {

    const model = gltf.scene;

    model.position.set(0, 0, 0); // ungefähr Nose / Docking Port
    model.rotation.set(Math.PI, 0, -Math.PI / 2)
    // falls nötig
    //model.rotation.y = -Math.PI / 2

    model.name = "ISS";
    //console.log(model)
    ISS.add(model)
}, undefined, function (error) {

    console.error(error);

});
const etObj = new THREE.Group();
scene.add(etObj)

loader.load('External Tank.glb', function (gtlf) {
    const model = gtlf.scene;

    model.position.set(-7.66765, 0, -10.088875); //
    model.rotation.set(Math.PI, -Math.PI / 2, 0);
    model.scale.set(0.025, 0.025, 0.025)
    model.name = "ET";
    const helpi = new THREE.AxesHelper(100);
    model.add(helpi)
    etObj.add(model);
    etObj.visible = false;
})






/////////////////////////
// PAYLOAD BAY
/////////////////////////

/*const material = new THREE.LineBasicMaterial( { color: 0x00ff00 } );
const points = [];
points.push( new THREE.Vector3( 13.25, 1.75, 0.55 ) );
points.push( new THREE.Vector3( 13.25, 1.9, 0.55 ) );
//points.push( new THREE.Vector3( 10, 0, 0 ) );
const geometry = new THREE.BufferGeometry().setFromPoints( points );
const line = new THREE.Line( geometry, material );
OVGroup.add( line );*/

function addCockpit() {
    const mat = new THREE.MeshStandardMaterial({
        color: 0x444444,
        metalness: 0.7,
        roughness: 0.3,
        side: THREE.FrontSide
    });

    // --- Hauptzylinder ---
    const cylinderHeight = 1; // Länge des Cockpits
    const cylinderRadiusTop = 2.25;
    const cylinderRadiusBottom = 2.25;
    const cylinderGeo = new THREE.CylinderGeometry(
        cylinderRadiusTop,
        cylinderRadiusBottom,
        cylinderHeight,
        32,
        1,
        false
    );
    const cockpitBody = new THREE.Mesh(cylinderGeo, mat);

    // Position: oben auf der Nase
    cockpitBody.position.set(11.3, 0.2, 0); // y=2 für Höhe, z=16 vorne
    cockpitBody.rotation.x = Math.PI / 2; // längsrichtung z
    cockpitBody.rotation.z = Math.PI / 2;

    OVGroup.add(cockpitBody)


    // --- Frontscheibe / Kuppel ---
    const domeRadius = 2.27;
    const domeGeo = new THREE.SphereGeometry(domeRadius, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
    const cockpitDome = new THREE.Mesh(domeGeo, mat);

    // Position: vorne am Cylinder
    cockpitDome.position.set(11.9, 0.2, 0); // vorne am Cylinder
    cockpitDome.rotation.x = Math.PI / 2; // Kuppel zeigt nach vorne
    cockpitDome.rotation.z = -Math.PI / 2;

    OVGroup.add(cockpitDome);

    // Optional: Rückseite leicht konisch
    const backConeGeo = new THREE.CylinderGeometry(
        2.3, 1.8, 1, 32
    );
    const backCone = new THREE.Mesh(backConeGeo, mat);
    backCone.position.set(0, 2, 16 - cylinderHeight / 2 - 0.5);
    backCone.rotation.x = Math.PI / 2;
    //OVGroup.add(backCone);

    return cockpitBody;
}

/////////////////////////
// RMS ROBOT ARM
/////////////////////////





const origin = new THREE.Vector3(8.5, 0.585, -2.2);

let shoulderHolder, shoulder, elbow, wrist;

function addRMS() {

    const material = new THREE.MeshNormalMaterial();

    // === SHOULDER ===
    shoulderHolder = new THREE.Group();
    shoulderHolder.position.copy(origin);
    shoulderHolder.position.y = origin.y - 0.5;
    OVGroup.add(shoulderHolder);
    shoulderHolder.rotation.y = 90 / 180 * Math.PI

    shoulder = new THREE.Group();
    shoulder.position.y = 0.5;
    shoulderHolder.add(shoulder);

    const shoulderGeo = new THREE.CylinderGeometry(0.2, 0.2, 1, 16);
    const shoulderPart = new THREE.Mesh(shoulderGeo, material);

    shoulderHolder.add(shoulderPart);



    // === UPPER ARM ===
    const upperLength = 7;
    const upperGeo = new THREE.CylinderGeometry(0.2, 0.2, upperLength, 16);
    const upperArm = new THREE.Mesh(upperGeo, material);
    upperArm.position.y = upperLength / 2;
    shoulder.add(upperArm);
    shoulder.rotation.x = -90 / 180 * Math.PI;

    // === ELBOW ===
    elbow = new THREE.Group();
    elbow.position.y = upperLength;
    shoulder.add(elbow);

    // === LOWER ARM ===
    const lowerLength = 7;
    const lowerGeo = new THREE.CylinderGeometry(0.2, 0.2, lowerLength, 16);
    const lowerArm = new THREE.Mesh(lowerGeo, material);
    lowerArm.position.y = lowerLength / 2;
    elbow.add(lowerArm);

    // === WRIST (NEU) ===
    wrist = new THREE.Group();
    wrist.position.y = lowerLength;
    elbow.add(wrist);

    // === HAND / ENDEFFEKTOR ===
    const handLength = 1;
    const handGeo = new THREE.CylinderGeometry(0.2, 0.2, handLength, 16);
    const hand = new THREE.Mesh(handGeo, material);
    hand.position.y = handLength / 2;
    wrist.add(hand);

    // === ARM CAMERA (NEU) ===
    armCamera = new THREE.PerspectiveCamera(80, 1, 0.1, 100000000);

    // Position relativ zur Wrist
    armCamera.position.set(0, 1.2, 0);   // leicht vor dem Greifer
    armCamera.lookAt(0, 2, 0);           // Blick nach vorne entlang des Arms

    wrist.add(armCamera);
}

/////////////////////////
// KEYBOARD CONTROL
/////////////////////////

document.addEventListener("keydown", (e) => {
    console.log(e.key)

    // Schulter
    if (e.key === "s") fetch("/api/ov/rms/shoulderPitch", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({direction: +1})});
    if (e.key === "w") fetch("/api/ov/rms/shoulderPitch", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({direction: -1})});
    if (e.key === "a") fetch("/api/ov/rms/shoulderYaw", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({direction: +1})});
    if (e.key === "d") fetch("/api/ov/rms/shoulderYaw", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({direction: -1})});

    if (e.key === "i") fetch("/api/ov/rms/elbowPitch", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({direction: +1})});
    if (e.key === "k") fetch("/api/ov/rms/elbowPitch", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({direction: -1})});
    //if (e.key === "j") elbow.rotation.z += 2 / 180 * Math.PI;
    //if (e.key === "l") elbow.rotation.z -= 2 / 180 * Math.PI;

    if (e.key === "8") fetch("/api/ov/rms/wristPitch", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({direction: +1})});
    if (e.key === "2") fetch("/api/ov/rms/wristPitch", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({direction: -1})});
    if (e.key === "4") fetch("/api/ov/rms/wristYaw", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({direction: +1})});
    if (e.key === "6") fetch("/api/ov/rms/wristYaw", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({direction: -1})});

    if (e.key === "t") {
        //OVGroup.translateY(0.2);
        (async () => {
            await fetch("/api/ov/translate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ axis: "z+" }) })
        })()
    }
    if (e.key === "g") {
        (async () => {
            //OVGroup.translateY(-0.2);
            fetch("/api/ov/translate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ axis: "z-" }) })
        })()
    }
    if (e.key === "f") {
        (async () => {
            //OVGroup.translateX(0.2);
            fetch("/api/ov/translate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ axis: "x+" }) })
        })()
    }
    if (e.key === "h") {
        (async () => {
            //OVGroup.translateX(-0.2);
            fetch("/api/ov/translate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ axis: "x-" }) })
        })()
    }
    if (e.key === "r") {
        (async () => {
            //OVGroup.translateZ(0.2);
            fetch("/api/ov/translate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ axis: "y+" }) })
        })()
    }
    if (e.key === "z") {
        (async () => {
            //OVGroup.translateZ(-0.2);
            fetch("/api/ov/translate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ axis: "y-" }) })
        })()
    }

    if (e.key === "c") {
        OVGroup.children[OVGroup.children.length - 1].children[0].children[8].far = 10000000;
        activeCamera = (activeCamera === OVGroup.children[OVGroup.children.length - 1].children[0].children[8]) ? armCamera : OVGroup.children[OVGroup.children.length - 1].children[0].children[8]; //children[12] top vert stab, children[8] et down

    }
    /*if (e.key === "+") {
        shoulder.rotation.x += 1 / 180 * Math.PI;
        elbow.rotation.x -= 2 / 180 * Math.PI;
        wrist.rotation.x += 1 / 180 * Math.PI;
    }
    if (e.key === "-") {
        shoulder.rotation.x -= 1 / 180 * Math.PI;
        elbow.rotation.x += 2 / 180 * Math.PI;
        wrist.rotation.x -= 1 / 180 * Math.PI
    }*/
    // Ellenbogen
    //if (e.key === "w") elbow.rotation.y += 0.1;
    //if (e.key === "s") elbow.rotation.y -= 0.1;
});

/////////////////////////
// INIT
/////////////////////////

addRMS();
addCockpit();



//console.log(camera)
function renderCanvas() {
    canvas.fillStyle = "black";
    canvas.fillRect(0, 0, 500, 200);

    canvas.beginPath();
    canvas.moveTo(250, 0);
    canvas.lineTo(250, 200);
    canvas.strokeStyle = "lime";
    canvas.stroke();
    canvas.beginPath();
    canvas.moveTo(200, 150);
    let upperX = 200 + ((60 * Math.sin(shoulder.rotation.x)) / Math.sin(90 / 180 * Math.PI));
    let upperY = 150 - ((60 * Math.sin((90 - (shoulder.rotation.x / Math.PI * 180)) / 180 * Math.PI)) / Math.sin(90 / 180 * Math.PI));
    canvas.lineTo(upperX, upperY);
    canvas.strokeStyle = "lime";
    canvas.stroke();
    canvas.beginPath();
    canvas.moveTo(upperX, upperY);
    let lowerX = upperX + ((60 * Math.sin(elbow.rotation.x + shoulder.rotation.x)) / Math.sin(90 / 180 * Math.PI));
    let lowerY = upperY - ((60 * Math.sin((90 - (((elbow.rotation.x * (-1)) - shoulder.rotation.x) / Math.PI * 180)) / 180 * Math.PI)) / Math.sin(90 / 180 * Math.PI));
    canvas.lineTo(lowerX, lowerY);
    canvas.strokeStyle = "lime";
    canvas.stroke();
}

function renderRCS() {
}


/////////////////////////
// ANIMATION LOOP
/////////////////////////

const earthMat = new THREE.MeshPhongMaterial({ color: 0x0000ff, side: THREE.FrontSide })
const earthGeo = new THREE.SphereGeometry(6378137, 64, 64, 0, Math.PI * 2);
const earth = new THREE.Mesh(earthGeo, earthMat)
earth.position.set(0, 0, 0);
earth.name = "ERDE"
//console.log(LVGroup)
OVGroup.add(fwdCdrSideFrontWindowCamera);
OVGroup.add(fwdPltSideFrontWindowCamera);
OVGroup.add(rearPortWindowCamera);
OVGroup.add(rearStarboardWindowCamera);
OVGroup.add(rearTopStarboardWindowCamera);
scene.add(earth);
const camhelper = new THREE.CameraHelper(fwdCdrSideFrontWindowCamera);
scene.add(camhelper);
(async () => {
    const resp = await fetch("/api/sim/objects");
    const data = await resp.json();
    //console.log(locVec)
    //console.log(data);
    if (data['OV']) {
        OVGroup.position.set(data['OV'].locVec.x, data['OV'].locVec.y, data['OV'].locVec.z);
    }
})()
const pivotHelper = new THREE.AxesHelper(100);
const earthHelper = new THREE.AxesHelper(10000)
OVGroup.add(pivotHelper); // Zeigt dir genau, wo (0,0,0) der Gruppe ist
//console.log(pivotHelper)
scene.add(earthHelper)

console.log(scene)


// ... (Dein bisheriges Setup für Kameras, Licht und Geometrie bleibt gleich)

let lastLocVec = new THREE.Vector3();
let isFetching = false;
let lastFaceVec = new THREE.Vector3();
let locVec = new THREE.Vector3(1, 0, 0);
let groundPlane = new THREE.Plane(locVec, -6378137)
const helper = new THREE.PlaneHelper(groundPlane, 1000, 0xffff00);

let lastISSLocVec = new THREE.Vector3();
let lastISSFaceVec = new THREE.Vector3();
let ISSlocVec = new THREE.Vector3(1, 0, 0);
let ISSgroundPlane = new THREE.Plane(ISSlocVec, -6378137)
const ISShelper = new THREE.PlaneHelper(ISSgroundPlane, 1000, 0x00ff00);

let lastH = new THREE.Vector3();
let velocity = new THREE.Vector3(); // smoothed velocity
let ISSlastH = new THREE.Vector3();
let ISSvelocity = new THREE.Vector3(); // smoothed velocity

scene.add(helper);
scene.add(ISShelper);
let launchVec = new THREE.Vector3(1, 0, 0);
let launchPlane = new THREE.Plane(launchVec, -6378137)
const launchHelper = new THREE.PlaneHelper(launchPlane, 1000, 0xff0000);
scene.add(launchHelper)
const PadGroup = new THREE.Group();
scene.add(PadGroup)
PadGroup.position.set(1, 1, 0)
loader.load('scene_.glb', function (gltf) {

    const model = gltf.scene;


    model.scale.set(10, 10, 10);
    model.position.set(6378137, -20, 10); // ungefähr Nose / Docking Port
    model.rotation.set(Math.PI / 2, 0, -Math.PI / 2)
    // falls nötig
    //model.rotation.y = -Math.PI / 2

    model.name = "Pad";
    //console.log(model.position)
    //console.log(model)
    earth.add(model)
    //model.position.set(0, 0, 0)

    //setTimeout(() => {console.log(model.getWorldPosition()); model.position.set(10000, 0, 0)}, 3000)
}, undefined, function (error) {

    console.error(error);

});

// Hilfsfunktion zur Berechnung der LVLH-Matrix
function updateOVTransform(data) {
    //console.log(data);
    //console.log(data['OV'])
    locVec.set(data['OV'].locVec.x, data['OV'].locVec.y, data['OV'].locVec.z)
    groundPlane.set(locVec, -6378137)

    // 1. Position setzen
    OVGroup.position.copy(locVec);

    // 2. Berechne Vektoren für das LVLH-Koordinatensystem
    // Radial (Up / +Y im LVLH): Zeigt vom Erdmittelpunkt zum Shuttle
    const r = locVec.clone().normalize();

    // Berechne approximativen Geschwindigkeitsvektor (V-Bar)
    // --- velocity (SMOOTHED) ---
    let rawVelocity;

    if (!lastLocVec.equals(new THREE.Vector3(0, 0, 0))) {
        rawVelocity = new THREE.Vector3().subVectors(locVec, lastLocVec).normalize();
    } else {
        rawVelocity = new THREE.Vector3(1, 0, 0).cross(r).normalize();
    }

    // smooth it (critical!)
    velocity.lerp(rawVelocity, 0.15).normalize();


    // --- stable orbital normal (H) ---
    let h = new THREE.Vector3().crossVectors(r, velocity);

    // handle near-singularity
    if (h.lengthSq() < 1e-6) {
        h.copy(lastH);
    } else {
        h.normalize();
    }

    // 🔥 PREVENT 180° FLIPS
    if (lastH.lengthSq() > 0 && h.dot(lastH) < 0) {
        h.negate();
    }

    lastH.copy(h);


    // --- recompute V AFTER stabilizing H ---
    const v = new THREE.Vector3().crossVectors(h, r).normalize();

    const faceVec = new THREE.Vector3(OV.IMU.pitch, OV.IMU.yaw, OV.IMU.roll)

    // 3. Erstelle die Rotationsmatrix (LVLH Basis)
    const basis = new THREE.Matrix4();
    // Spalten: X = Right(h), Y = Up(r), Z = Forward(v)
    basis.makeBasis(h, r, v);
    //console.log(h, r, v,)
    OVGroup.setRotationFromMatrix(basis);
    //const imuEuler = new THREE.Euler(
    //THREE.MathUtils.degToRad(-OV.IMU.roll),    // roll
    //THREE.MathUtils.degToRad(OV.IMU.yaw - 180), // yaw offset to align
    //THREE.MathUtils.degToRad(OV.IMU.pitch),   // pitch
    //"ZYX" // important order
    //);

    // apply relative to LVLH
    //OVGroup.rotation.copy(imuEuler);

    // 4. IMU-Euler-Rotationen (Relativ zum LVLH-Frame) anwenden
    // Wichtig: Achte auf die korrekte Reihenfolge (z.B. YXZ)
    //if (!velocity.equals(new THREE.Vector3(0, 0, 0))) {
    //if (!lastFaceVec.equals(faceVec)) {
    //OVGroup.rotation.set(Math.PI/2, -Math.PI, Math.PI/2);
    //OVGroup.rotation.copy(groundPlane)


    OVGroup.rotateY(OV.IMU.yaw / 180 * Math.PI - Math.PI)
    OVGroup.rotateZ(OV.IMU.pitch / 180 * Math.PI + Math.PI * 2)
    OVGroup.rotateX((-OV.IMU.roll) / 180 * Math.PI + Math.PI * 2)


    //OVGroup.rotateOnAxis(r, THREE.MathUtils.degToRad(OV.IMU.yaw));
    //OVGroup.rotateOnAxis(h, THREE.MathUtils.degToRad(OV.IMU.pitch));
    //OVGroup.rotateOnAxis(v, THREE.MathUtils.degToRad(-OV.IMU.roll));
    //}


    lastLocVec.copy(locVec);
    lastFaceVec.copy(faceVec);
}

function updateISSTransform(data) {
    //console.log(data);
    //console.log(data['OV'])
    ISSlocVec.set(data['ISS'].locVec.x, data['ISS'].locVec.y, data['ISS'].locVec.z)
    ISSgroundPlane.set(ISSlocVec, -6378137)

    // 1. Position setzen
    ISS.position.copy(ISSlocVec);

    // 2. Berechne Vektoren für das LVLH-Koordinatensystem
    // Radial (Up / +Y im LVLH): Zeigt vom Erdmittelpunkt zum Shuttle
    const r = ISSlocVec.clone().normalize();

    // Berechne approximativen Geschwindigkeitsvektor (V-Bar)
    // --- velocity (SMOOTHED) ---
    let rawVelocity;

    if (!lastISSLocVec.equals(new THREE.Vector3(0, 0, 0))) {
        rawVelocity = new THREE.Vector3().subVectors(ISSlocVec, lastISSLocVec).normalize();
    } else {
        rawVelocity = new THREE.Vector3(1, 0, 0).cross(r).normalize();
    }

    // smooth it (critical!)
    ISSvelocity.lerp(rawVelocity, 0.15).normalize();


    // --- stable orbital normal (H) ---
    let h = new THREE.Vector3().crossVectors(r, ISSvelocity);

    // handle near-singularity
    if (h.lengthSq() < 1e-6) {
        h.copy(ISSlastH);
    } else {
        h.normalize();
    }

    // 🔥 PREVENT 180° FLIPS
    if (ISSlastH.lengthSq() > 0 && h.dot(ISSlastH) < 0) {
        h.negate();
    }

    ISSlastH.copy(h);


    // --- recompute V AFTER stabilizing H ---
    const v = new THREE.Vector3().crossVectors(h, r).normalize();

    const faceVec = new THREE.Vector3(data['ISS'].faceVec.x, data['ISS'].faceVec.y, data['ISS'].faceVec.z)

    // 3. Erstelle die Rotationsmatrix (LVLH Basis)
    const basis = new THREE.Matrix4();
    // Spalten: X = Right(h), Y = Up(r), Z = Forward(v)
    basis.makeBasis(h, r, v);
    //console.log(h, r, v,)
    ISS.setRotationFromMatrix(basis);
    //const imuEuler = new THREE.Euler(
    //THREE.MathUtils.degToRad(-OV.IMU.roll),    // roll
    //THREE.MathUtils.degToRad(OV.IMU.yaw - 180), // yaw offset to align
    //THREE.MathUtils.degToRad(OV.IMU.pitch),   // pitch
    //"ZYX" // important order
    //);

    // apply relative to LVLH
    //OVGroup.rotation.copy(imuEuler);

    // 4. IMU-Euler-Rotationen (Relativ zum LVLH-Frame) anwenden
    // Wichtig: Achte auf die korrekte Reihenfolge (z.B. YXZ)
    //if (!velocity.equals(new THREE.Vector3(0, 0, 0))) {
    //if (!lastFaceVec.equals(faceVec)) {
    //OVGroup.rotation.set(Math.PI/2, -Math.PI, Math.PI/2);
    //OVGroup.rotation.copy(groundPlane)


    ISS.rotateY(Math.PI / 2)
    ISS.rotateZ(Math.PI / 2)
    ISS.rotateX(Math.PI * 2)


    //OVGroup.rotateOnAxis(r, THREE.MathUtils.degToRad(OV.IMU.yaw));
    //OVGroup.rotateOnAxis(h, THREE.MathUtils.degToRad(OV.IMU.pitch));
    //OVGroup.rotateOnAxis(v, THREE.MathUtils.degToRad(-OV.IMU.roll));
    //}


    lastLocVec.copy(locVec);
    lastFaceVec.copy(faceVec);

    data['ISS'].dockingPorts.forEach(port => {
        if (port.hasObject == data['OV']) {
            ISS.add(OVGroup)
        }
    })
}

function enginePlume() {
    if (OV.ssme.ctr.thrust > 0) {
        OVGroup.children[OVGroup.children.length - 1].children[0].children[14].visible = true;
    } else {
        OVGroup.children[OVGroup.children.length - 1].children[0].children[14].visible = false;
    }
    if (OV.ssme.r.thrust > 0) {
        OVGroup.children[OVGroup.children.length - 1].children[0].children[13].visible = true;
    } else {
        OVGroup.children[OVGroup.children.length - 1].children[0].children[13].visible = false;
    }
    if (OV.ssme.l.thrust > 0) {
        OVGroup.children[OVGroup.children.length - 1].children[0].children[15].visible = true;
    } else {
        OVGroup.children[OVGroup.children.length - 1].children[0].children[15].visible = false;
    }
}
let srblSep = false;
let srbrSep = false;
let srbL;
let srbR;
function srbHandle(data) {
    if (!OV.srblSep) {
        if (OV.SRBs.l.ignited) {
            OVGroup.children[OVGroup.children.length - 1].children[0].children[16].visible = true;
        } else {
            OVGroup.children[OVGroup.children.length - 1].children[0].children[16].visible = false;
        }
        if (OV.SRBs.l.seperated) {
            //    srbL = 
            OVGroup.children[OVGroup.children.length - 1].children[0].children[16].visible = false;
            OVGroup.children[OVGroup.children.length - 1].children[0].children[4].translateZ(-8).translateY(-16).translateX(-4)//.rotateZ(-0.8/180*Math.PI)//.rotateY(-0.4/180*Math.PI);
            setTimeout(() => {
                OVGroup.children[OVGroup.children.length - 1].children[0].children[4].visible = false;
            }, 92000)
        }
    }
    if (!OV.srbrSep) {
        if (OV.SRBs.r.ignited) {
            OVGroup.children[OVGroup.children.length - 1].children[0].children[17].visible = true;
        } else {
            OVGroup.children[OVGroup.children.length - 1].children[0].children[17].visible = false;
        }
        if (OV.SRBs.r.seperated) {
            //    srbL = 
            OVGroup.children[OVGroup.children.length - 1].children[0].children[17].visible = false;
            OVGroup.children[OVGroup.children.length - 1].children[0].children[2].translateZ(8).translateY(-16).translateX(-4)//.rotateZ(-0.8/180*Math.PI)//.rotateY(-0.4/180*Math.PI);
        }
    }
}
function etHandle(data) {
    if (data['ET']) {
        etObj.visible = true;
        etObj.position.set(data['ET'].locVec.x, data['ET'].locVec.y, data['ET'].locVec.z)
        //etObj.rotation.setFromVector3(new THREE.Vector3(data['ET'].faceVec.x, data['ET'].faceVec.y, data['ET'].faceVec.z))
    } else {
        etObj.position.set(data['OV'].locVec.x, data['OV'].locVec.y, data['OV'].locVec.z)
        //etObj.rotation.setFromVector3(new THREE.Vector3(data['OV'].faceVec.x, data['OV'].faceVec.y, data['OV'].faceVec.z))
    }
}


//scene.add(locVec)

console.log(OVGroup.children[9])
const velVec = new THREE.Vector3();

//camera.lookAt(OVGroup)
// Separate Funktion für den Datenabruf, um animate() nicht zu blockieren
async function fetchTelemetry() {
    if (isFetching) return;
    isFetching = true;
    const resp = await fetch("/api/sim/objects");
    const data = await resp.json();
    if (data['OV']) {
        updateOVTransform(data);
        OVGroup.position.set(data['OV'].locVec.x, data['OV'].locVec.y, data['OV'].locVec.z)
        velVec.set(data['OV'].velVec.x, data['OV'].velVec.y, data['OV'].velVec.z)
    }
    if (data['ISS']) {
        updateISSTransform(data)
        scene.children[scene.children.length - 1].position.set(data['ISS'].locVec.x, data['ISS'].locVec.y, data['ISS'].locVec.z);

    }
    etHandle(data);
    if (data['ET']) {
        etObj.visible = true;
        etObj.children[0].visible = true;
        etHandle(data);
        //console.log("ff")
        for (let i = 0; i < OVGroup.children[OVGroup.children.length-1].children[0].children.length; i++) {
            if (OVGroup.children[OVGroup.children.length-1].children[0].children[i].name == "External_tank_(1)glb") {
                OVGroup.children[OVGroup.children.length-1].children[0].children[i].visible = false;
                //console.log("found")
            }
        }
    }
    try {

    } catch (e) {
        console.error("Telemetry error:", e);
    } finally {
        isFetching = false;
    }
}
const baseFacingVec = new THREE.Vector3(-1, -1, -1); // Richtung in OV-Localframe
let facingVec = new THREE.Vector3(1, 1, 1)
const ReentryMaterial = new THREE.MeshStandardMaterial({color: 14382874, emissive: 15489846, opacity: 0.7, transparent: true, side: THREE.DoubleSide});
const ReentryConeFrontGeo = new THREE.SphereGeometry(1, 32, 16, Math.PI/2, Math.PI, 0, Math.PI);
const ReentryConeFront = new THREE.Mesh(ReentryConeFrontGeo, ReentryMaterial);
OVGroup.add(ReentryConeFront)
ReentryConeFront.position.set(11.466, -0.259, 0);
ReentryConeFront.rotation.set(0, 0, -8.15/180*Math.PI);
ReentryConeFront.scale.set(8.293, 3.083, 2.794)

//normalize the direction vector (convert to vector of length 1)
const length = 100;
const hex = 0xffff00;
const arrowHelper = new THREE.ArrowHelper(velVec, OVGroup.position, length, hex);
OVGroup.add(arrowHelper);
function openPayload() {
    if(OVGroup.children[10]) {
        OVGroup.children[10].rotation.x = 90/180*Math.PI
        OVGroup.children[10].position.setZ(-5.3)
        OVGroup.children[10].position.setY(1)
    }
    if(OVGroup.children[11]) {
        OVGroup.children[11].rotation.x = 90/180*Math.PI
        OVGroup.children[11].position.setZ(5.3)
        OVGroup.children[11].position.setY(1)
    }
}
function updateRMS() {
    shoulder.rotation.x = OV.RMS.shoulderPitch/180*Math.PI;
    shoulderHolder.rotation.y = OV.RMS.shoulderYaw/180*Math.PI;
    elbow.rotation.x = OV.RMS.elbowPitch/180*Math.PI;
    wrist.rotation.x = OV.RMS.wristPitch/180*Math.PI;
    wrist.rotation.z = OV.RMS.wristYaw/180*Math.PI;
}


async function animate() {
    //console.log(OVGroup.children)
    //openPayload()
    updateRMS();
    camera.lookAt(OVGroup.position)
    camera.zoom = camera.position.distanceTo(OVGroup.position)*10000
    //controls.update()
    //console.log(earth.position)
    //console.log(rendererFwdCdr.info.render)


    // Telemetrie abrufen (nur wenn die letzte Anfrage fertig ist)
    let camVec = new THREE.Vector3()
    fetchTelemetry();
    //if (OVGroup.children[9]) {
    //    OVGroup.children[9].children[6].getWorldDirection(facingVec);
    //} else {
    //    facingVec = baseFacingVec.clone().applyQuaternion(OVGroup.quaternion).normalize();
    //}
    //facingVec.subVectors(facingVec, new THREE.Vector3().addVectors(facingVec, facingVec))
    //facingVec.setX(-facingVec.x)
    //facingVec.setY(-facingVec.y)
    //facingVec.setZ(-2*facingVec.z)

    arrowHelper.origin = OVGroup.position
    arrowHelper.setDirection(velVec)
    //console.log(facingVec)
    //arrowHelper.position.copy(locVec);

    //setTimeout(function () {
        requestAnimationFrame(animate);
    //}, 1000 / 30); // Limit to 30 FPS


    // Robot-Arm Constraints
    //if (shoulder.rotation.x / Math.PI * 180 + 90 > 145) {
        //shoulder.rotation.x = (145 - 90) / 180 * Math.PI;
    //}
    //if (shoulder.rotation.x / Math.PI * 180 + 90 < 0) {
    //    shoulder.rotation.x = (-90) / 180 * Math.PI;
    //}
    //if (elbow.rotation.x > 0) {
    //    elbow.rotation.x = 0;
    //} else if (elbow.rotation.x / Math.PI * 180 < -160) {
    //    elbow.rotation.x = -160 / 180 * Math.PI;
    //}

    renderCanvas();
    enginePlume();
    srbHandle();
    document.getElementById("rotation").innerHTML = `Shoulder: Y ${OV.RMS.shoulderYaw - 90}, P ${OV.RMS.shoulderPitch - 90}, Elbow: P ${OV.RMS.elbowPitch}, Wrist: Y ${OV.RMS.wristYaw}, P ${OV.RMS.wristPitch}`

    // Rendering aller Fenster

    rendererFwdCdr.render(scene, fwdCdrSideFrontWindowCamera);
    rendererFwdPlt.render(scene, fwdPltSideFrontWindowCamera);
    rendererRearPrt.render(scene, rearPortWindowCamera);
    rendererRearTopPrt.render(scene, OVGroup.children[OVGroup.children.length - 1].children[0].children[10])
    rendererRMS.render(scene, activeCamera);
    rendererRearStb.render(scene, rearStarboardWindowCamera);
    rendererRearTopStb.render(scene, rearTopStarboardWindowCamera);
    //console.log(OVGroup.children[OVGroup.children.length - 1].children[0].children[10])
}

console.log(OVGroup.children[OVGroup.children.length - 1].children[0].children[10])

animate();

//setInterval(() => {
//    fetch("/api/ov/facingVec", {
//        method: "POST",
//        headers: { "Content-Type": "application/json" },
//        body: JSON.stringify({ facingVec })
//    })
//}, 100)
/////////////////////////
// RESIZE HANDLING
/////////////////////////

/*window.addEventListener("resize", () => {
    const w = window.innerWidth;
    const h = window.innerHeight;

    rearPortWindowCamera.aspect = w / h;
    rearPortWindowCamera.updateProjectionMatrix();

    renderer.setSize(w, h);
});*/
