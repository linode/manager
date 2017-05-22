import { STATIC_ENDPOINT_CACHE_MINUTES } from '~/constants';
import { getStorage, setStorage } from '~/storage';

function key(pluralName) {
  return `staticEndpointCache/${pluralName}`;
}

export function get(pluralName) {
  const resource = getStorage(key(pluralName));
  if (!resource) {
    return;
  }

  const cacheValid = new Date(resource.__cacheUntil) > new Date();
  if (cacheValid) {
    delete resource.__cacheUntil;
    return resource;
  }
}

export function set(pluralName, resources) {
  const now = new Date();
  setStorage(key(pluralName), {
    ...resources,
    __cacheUntil: new Date(now.getTime() + STATIC_ENDPOINT_CACHE_MINUTES * 60 * 1000),
  });
}
