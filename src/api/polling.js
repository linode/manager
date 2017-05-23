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
  let linearConstant = timeout / 1000;
  let increment = linearConstant;
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

    pollingIdMap[id] = setTimeout(async function () {
      await apiRequestFn();

      if (backoff && numTries > 0) {
        increment += linearConstant;
        timeout = timeout + (increment * 1000);
        if (timeout > maxBackoffTimeout) {
          timeout = maxBackoffTimeout;
        }
      }

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
    }, timeout);
  }

  function start(id) {
    poll(id);
  }

  function reset() {
    if (backoff) {
      numTries = 0;
      increment = linearConstant;
      timeout = (increment * 1000);
    }
  }

  return Object.freeze({
    reset: reset,
    start: start,
    stop: stop,
  });
}
