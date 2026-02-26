const rEarth = 6378137;
export function CoordsToGroundVector(lat, lon) {
  lat = lat / 180 * Math.PI;
  lon = lon / 180 * Math.PI;
  
  let x = rEarth * Math.cos(lat) * Math.cos(lon);
  let y = rEarth * Math.cos(lat) * Math.sin(lon);
  let z = rEarth * Math.sin(lat);
  
  return [x, y, z];
}
export function groundVectorToCoords(x, y, z) {
  const lat = Math.asin(z / rEarth);
  const lon = Math.atan2(y, x);
  return [ lat, lon ];
}
export function groundVectorToLocationVector(x, y, z, h) {
  x = (x / rEarth) * (rEarth + h);
  y = (y / rEarth) * (rEarth + h);
  z = (z / rEarth) * (rEarth + h);
  return [x, y, z];
}
export function groundVectorToLocalFacingVector(x, y, z) {

  const R = Math.sqrt(x*x + y*y + z*z);

  // Up-Vektor (normalisiert)
  const ux = x / R;
  const uy = y / R;
  const uz = z / R;

  // Sonderfall Pol
  const horizontalLen = Math.sqrt(x*x + y*y);

  if (horizontalLen < 1e-6) {
    return [1, 0, 0]; // beliebige Richtung
  }

  // Tangentialer Vektor (Ost-Richtung)
  const kx = -y / horizontalLen;
  const ky =  x / horizontalLen;
  const kz =  0;

  return [kx, ky, kz];
}
export function computeAthmospere(h = 0, v = 0, rl = 10) {

  // Standardatmosphäre Meereshöhe (SI)
  var TEMPSL = 288.15;    // K
  var RHOSL = 1.225;      // kg/m^3
  var PRESSSL = 101325;   // Pa

  var saTheta = 1.0;
  var saSigma = 1.0;
  var saDelta = 1.0;

  // einfache ISA-Troposphäre bis 11 km
  if (h < 11000) {
    saTheta = 1 - 0.0065 * h / TEMPSL;
    saDelta = Math.pow(saTheta, 5.2561);
    saSigma = Math.pow(saTheta, 4.2561);
  }

  let tempVal = TEMPSL * saTheta;
  let rhoVal = RHOSL * saSigma;
  let pVal = PRESSSL * saDelta;

  // dynamische Viskosität (Sutherland)
  let viscVal = 1.458e-6 * Math.pow(tempVal, 1.5) / (tempVal + 110.4);

  // Schallgeschwindigkeit
  let soundVal = Math.sqrt(1.4 * 287.05 * tempVal);

  let machVal = v / soundVal;
  let qVal = 0.5 * rhoVal * v * v;
  let reynolds = rhoVal * v * rl / viscVal;

  let cfturb = 0.455 / Math.pow(Math.log10(reynolds), 2.58);
  let cflam = 1.328 / Math.sqrt(reynolds);
  return {
    temp: tempVal,
    density: rhoVal,
    pressure: pVal,
    viscosity: viscVal,
    speed_of_sound: soundVal,
    mach_speed: machVal,
    dynamic_pressure: qVal,
    reynolds: reynolds,
    laminar_flow: cflam,
    turbular_flow: cfturb
  };
}
export function destinationPoint(lat, lon, distance, bearing) {
  const φ1 = lat * Math.PI / 180;
  const λ1 = lon * Math.PI / 180;
  const θ = bearing * Math.PI / 180;
  const δ = distance / rEarth;

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

