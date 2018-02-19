const DEFAULT_TIMEOUT = 10000;


export default function Polling(args) {
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

  const pollingIds = {};

  function poll() {
    return (dispatch) => {
      setTimeout(async function () {
        const ids = Object.keys(pollingIds);
        if (!ids.length) {
          return;
        }

        await dispatch(apiRequestFn(...ids));

        if (backoff && numTries > 0) {
          increment += linearConstant;
          timeout += (increment * 1000);
          if (timeout > maxBackoffTimeout) {
            timeout = maxBackoffTimeout;
          }
        }

        ++numTries;

        if (maxTries !== null) {
          if (numTries <= maxTries) {
            dispatch(poll());
          } else if (onMaxTriesReached) {
            onMaxTriesReached();
          }
        } else {
          dispatch(poll());
        }
      }, timeout);
    };
  }

  function start(id) {
    pollingIds[id] = true;

    if (Object.values(pollingIds).length === 1) {
      return poll();
    }

    // Already polling.
    return () => {};
  }

  function stop(id) {
    delete pollingIds[id];
  }

  function reset() {
    numTries = 0;

    if (backoff) {
      increment = linearConstant;
      timeout = (increment * 1000);
    }
  }

  function isPolling(id) {
    return !!pollingIds[id];
  }

  return Object.freeze({
    reset: reset,
    start: start,
    stop: stop,
    isPolling: isPolling,
  });
}
