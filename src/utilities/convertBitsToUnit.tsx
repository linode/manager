type UnitType = 'bits' | 'bytes' | 'KB' | 'MB' | 'GB';

// calls to /:linodeID/stats and /:nodeBalancer/stats
// returns units in bits, so we want to transform it
// in whatever unit we please
export const convertBitsToUnit = (value: number, unitType: UnitType) => {
  let convertedValue = value;
  switch (unitType) {
    case 'bytes':
      convertedValue = value / 8; // bits to bytes
      break;
    case 'KB':
      convertedValue = (value / 8) / 1024; // bits to KB
      break;
    case 'MB':
      convertedValue = (value / 8) / 1024 / 1024; // bits to MB
      break;
    case 'GB':
      convertedValue = (value / 8) / 1024 / 1024 / 1024; // bits to GB
      break;
    default:
      break; // just bits
  }
  return +convertedValue.toFixed(20);
};
