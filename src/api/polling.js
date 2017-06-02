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
  const linearConstant = timeout / 1000;
  let increment = linearConstant;
  let numTries = 0;

  function clear(id) {
    if (pollingIdMap[id] !== undefined) {
      clearTimeout(pollingIdMap[id].timeout);
    }
  }

  function stop(id) {
    if (pollingIdMap[id] !== undefined) {
      clear(id);
      pollingIdMap[id].isPolling = false;
    }
  }

  function poll(id) {
    return (dispatch) => {
      // Prevent requests from stacking.
      clear(id);

      const _timeout = setTimeout(async function () {
        await dispatch(apiRequestFn(id));

        if (backoff && numTries > 0) {
          increment += linearConstant;
          timeout = timeout + (increment * 1000);
          if (timeout > maxBackoffTimeout) {
            timeout = maxBackoffTimeout;
          }
        }

        delete pollingIdMap[id].timeout;
        ++numTries;

        if (maxTries !== null) {
          if (numTries <= maxTries) {
            dispatch(poll(id));
          } else if (onMaxTriesReached) {
            onMaxTriesReached();
          }
        } else {
          dispatch(poll(id));
        }
      }, timeout);

      pollingIdMap[id] = { timeout: _timeout, isPolling: true };
    };
  }

  function start(id) {
    // additional calls to this function will restart polling by default
    // so that requests don't stack
    stop(id);

    return poll(id);
  }

  function reset() {
    if (backoff) {
      numTries = 0;
      increment = linearConstant;
      timeout = (increment * 1000);
    }
  }

  function isPolling(id) {
    if (pollingIdMap[id] === undefined) {
      return false;
    }

    return pollingIdMap[id].isPolling;
  }

  return Object.freeze({
    reset: reset,
    start: start,
    stop: stop,
    isPolling: isPolling,
  });
}
