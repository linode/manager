export const convertMegabytesTo = (data: number) => {
  // API v4 always returns nodebalancer transfer in MB, so we want to clean it up if it's too
  // big or too small
  const gb = 1073741824;
  const mb = 1048576;
  const kb = 1024;
  const totalToBytes = data * 1024 * 1024; // convert the MB to Bytes
  if (totalToBytes >= gb) {
    // convert bytes to GB
    return `${Math.max(Math.ceil(totalToBytes / gb)).toFixed(2)} GB`;
  }
  if (totalToBytes >= mb) {
    // convert bytes to MB
    return `${Math.max(Math.ceil((totalToBytes / mb) * 100) / 100).toFixed(
      2
    )} MB`;
  }
  if (totalToBytes >= kb) {
    // convert bytes to KB
    return `${Math.max(Math.ceil((totalToBytes / kb) * 100) / 100).toFixed(
      2
    )} KB`;
  }
  return `${totalToBytes} bytes`;
};

// Returns a human-readable version of the byte value passed in.
// Example: readableBytes(2097152) --> { value: 2, unit: 'MB', formatted: '2 MB }
// Value and unit are returned separately for flexibility of use.
export const readableBytes = (num: number) => {
  if (num === 0) {
    return { value: 0, unit: 'B', formatted: '0 bytes' };
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
