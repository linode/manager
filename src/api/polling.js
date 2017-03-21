import {
  createHeaderFilter,
} from './util';

const DEFAULT_TIMEOUT = 10000;


export default function Polling(args) {
  const {
    apiRequestFn,
    filterOptions = {},
    timeout = DEFAULT_TIMEOUT,
    maxTries = null,
    onMaxTriesReached = null,
  } = args;

  const options = createHeaderFilter(filterOptions);
  let numTries = 0;
  let pollingTimeoutId = null;

  function stop() {
    if (pollingTimeoutId !== null) {
      clearTimeout(pollingTimeoutId);
    }
  }

  function poll() {
    // additional calls to this function will restart polling by default
    // so that requests don't stack
    stop();

    pollingTimeoutId = setTimeout(async function () {
      await apiRequestFn(options);

      pollingTimeoutId = null;
      ++numTries;

      if (maxTries !== null) {
        if (numTries <= maxTries) {
          poll();
        } else if (onMaxTriesReached) {
          onMaxTriesReached();
        }
      } else {
        poll();
      }
    }, timeout);
  }

  function start() {
    poll();
  }

  return Object.freeze({
    start: start,
    stop: stop,
  });
}
