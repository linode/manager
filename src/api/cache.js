import { STATIC_ENDPOINT_CACHE_MINUTES } from '~/constants';
import { getStorage, setStorage } from '~/storage';

function key(pluralName) {
  return `staticEndpointCache/${pluralName}`;
}

export function get(pluralName) {
  console.log(pluralName, 1);
  const resource = getStorage(key(pluralName));
  if (!resource) {
    return;
  }
  console.log(pluralName, 2);

  const cacheValid = new Date(resource.__cacheUntil) > new Date();
  if (cacheValid) {
    delete resource.__cacheUntil;
    return resource;
  }
  console.log(pluralName, 3);
}

export function set(pluralName, resources) {
  const now = new Date();
  setStorage(key(pluralName), {
    ...resources,
    __cacheUntil: new Date(now.getTime() + STATIC_ENDPOINT_CACHE_MINUTES * 60 * 1000),
  });
}
