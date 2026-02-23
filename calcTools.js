const rEarth = 6378137;
export function CoordsToGroundVector(lat, lon) {
  lat = lat / 180 * Math.PI;
  lon = lon / 180 * Math.PI;
  let x = rEarth * Math.sin(lat) * Math.cos(lon);
  let y = rEarth * Math.cos(lat) * Math.sin(lon);
  let z = rEarth * Math.cos(lat);
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
