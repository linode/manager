const DEFAULT_TIMEOUT = 10000;


export default function Polling(args) {
  // map for managing multiple polling timeouts at once, using an object.id
  const pollingIdMap = {};
  const {
    apiRequestFn,
    maxTries = null,
    onMaxTriesReached = null,
    backoff = false,
    maxBackoffTimeout = null,
  } = args;
  let { timeout = DEFAULT_TIMEOUT } = args;

  let numTries = 0;

  function stop(id) {
    if (pollingIdMap[id] !== undefined) {
      clearTimeout(pollingIdMap[id]);
    }
  }

  function poll(id) {
    // additional calls to this function will restart polling by default
    // so that requests don't stack
    stop(id);

    let updatedTimeout = timeout;
    if (backoff && numTries > 0) {
      updatedTimeout = Math.pow((timeout / 1000), numTries) * 1000;
      if (updatedTimeout > maxBackoffTimeout) {
        updatedTimeout = maxBackoffTimeout;
      }
    }

    pollingIdMap[id] = setTimeout(async function () {
      await apiRequestFn();

      delete pollingIdMap[id];
      ++numTries;

      if (maxTries !== null) {
        if (numTries <= maxTries) {
          poll(id);
        } else if (onMaxTriesReached) {
          onMaxTriesReached();
        }
      } else {
        poll(id);
      }
    }, updatedTimeout);
  }

  function start(id) {
    poll(id);
  }

  return Object.freeze({
    start: start,
    stop: stop,
  });
}
