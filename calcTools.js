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
