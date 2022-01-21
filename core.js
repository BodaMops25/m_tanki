function radToDeg(rad) {
  return rad * 180 / Math.PI
}

function degToRad(deg) {
  return deg * Math.PI / 180
}

function vecAngle(x, y) {
  if(x === 0 && y === 0) return 0

  if(y >= 0) return radToDeg(Math.acos(x/(x**2 + y**2)**.5))
  else if(y < 0) return 360 - radToDeg(Math.acos(x/(x**2 + y**2)**.5))
}

if(typeof(module) !== "undefined") module.exports = {radToDeg, degToRad, vecAngle}

