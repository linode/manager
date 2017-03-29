import {
  createHeaderFilter,
} from './util';

const DEFAULT_TIMEOUT = 10000;


export default function Polling(args) {
  // map for managing multiple polling timeouts at once, using an object.id
  const pollingIdMap = {};
  const {
    apiRequestFn,
    filterOptions = {},
    timeout = DEFAULT_TIMEOUT,
    maxTries = null,
    onMaxTriesReached = null,
  } = args;

  const options = createHeaderFilter(filterOptions);
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
      await apiRequestFn(options);

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

  return Object.freeze({
    start: start,
    stop: stop,
  });
}
