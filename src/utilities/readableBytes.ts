export const readableBytes = (num: number) => {
  if (num === 0) {
    return { value: 0, unit: 'B', formatted: '0 B' };
  }

  const kilobyte = 1024;

  const power = Math.floor(Math.log(num) / Math.log(kilobyte));
  const result = num / Math.pow(kilobyte, power);

  // Rounding rules that Classic Manager uses.
  let decimalPlaces;
  if (result === 0) {
    decimalPlaces = 0;
  } else if (result < 10) {
    decimalPlaces = 2;
  } else if (result < 100) {
    decimalPlaces = 1;
  } else {
    decimalPlaces = 0;
  }

  const value = parseFloat(result.toFixed(decimalPlaces));

  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const unit = sizes[power];

  return {
    value,
    unit,
    formatted: value + ' ' + unit
  };
};
