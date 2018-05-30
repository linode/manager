export const convertMegabytesTo = (data: number) => {
  // API v4 always returns nodebalancer transfer in MB, so we want to clean it up if it's too
  // big or too small
  const gb = 1073741824;
  const mb = 1048576;
  const kb = 1024;
  const totalToBytes = data * 1024 * 1024; // convert the MB to Bytes
  if (totalToBytes >= gb) { // convert bytes to GB
    return `${Math.max(Math.ceil(totalToBytes / gb)).toFixed(2)} GB`;
  }
  if (totalToBytes >= mb) { // convert bytes to MB
    return `${Math.max(Math.ceil(totalToBytes / mb * 100) / 100).toFixed(2)} MB`;
  }
  if (totalToBytes >= kb) { // convert bytes to KB
    return `${Math.max(Math.ceil(totalToBytes / kb * 100) / 100).toFixed(2)} KB`;
  }
  return `${totalToBytes} bytes`;
};
