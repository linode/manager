export function convertUnits(value, units, unitType, fixedNumber = 0) {
  return `${value.toFixed(fixedNumber) / Math.pow(1000, units)}${unitType[units]}/s`;
}
