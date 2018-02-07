import { fetch } from './fetch';


/**
 * Sometimes the object will have sub-objects of it created before the object actually exists.
 * However, this is not cause to refetch the object after we just grabbed it.
 *
 * @param {Object} object
 * @returns {boolean} - Whether or not the object provided contains any keys which start with
 * an underscore.
 */
export function fullyLoadedObject(object) {
  return object && !!Object
    .keys(object)
    .filter(key => !key.startsWith('_'))
    .length;
}

export function genThunkOne(config, actions) {
  return (ids = [], headers = {}) => async (dispatch) => {
    const endpoint = config.endpoint(...ids);
    const resource = await dispatch(fetch.get(endpoint, undefined, headers));
    dispatch(actions.one(resource, ...ids));
    return resource;
  };
}

/*
 * This function fetches a single page and stores it into the redux state by default.
 * All results are optionally filtered so only certain fields (or none) are updated.
 * The results are returned.
 */
export function genThunkPage(config, actions) {
  return function fetchPage(page = 0, ids = [], resourceFilter, headers) {
    return async (dispatch) => {
      const endpoint = `${config.endpoint(...ids, '')}?page=${page + 1}`;
      const resources = await dispatch(fetch.get(endpoint, undefined, headers));
      resources[config.name] = resources.data || [];
      await dispatch(actions.many(resources, ...ids));
      return resources;
    };
  };
}

/*
 * This function fetches all pages, stores them in Redux and returns the result
 */
export function genThunkAll(config, actions, fetchPage) {
  function fetchAll(ids = [], resourceFilter, options) {
    return async (dispatch) => {
      // Grab first page so we know how many there are.
      const resource = await dispatch(
        fetchPage(0, ids, resourceFilter, options));
      const resources = [resource];

      // Grab all pages we know about and store them in Redux.
      const requests = [];
      for (let i = 1; i < resources[0].pages; i += 1) {
        requests.push(fetchPage(i, ids, resourceFilter, options));
      }

      // Gather all the results for for return to the caller
      const allPages = await Promise.all(requests.map(r => dispatch(r)));
      allPages.forEach(function (response) {
        resources.push(response);
      });
      const res = {
        ...resources[resources.length - 1],
        [config.name]: resources.reduce((a, b) => [...a, ...b[config.name]], []),
      };
      return res;
    };
  }

  return fetchAll;
}

export function genThunkDelete(config, actions) {
  return (...ids) => async (dispatch) => {
    const endpoint = config.endpoint(...ids);
    const json = await dispatch(fetch.delete(endpoint));
    dispatch(actions.delete(...ids));
    return json;
  };
}

export function genThunkPut(config, actions) {
  return (resource, ...ids) => async (dispatch) => {
    const endpoint = config.endpoint(...ids);
    const json = await dispatch(fetch.put(endpoint, resource));
    dispatch(actions.one(json, ...ids));
    return json;
  };
}

export function genThunkPost(config, actions) {
  return (resource, ...ids) => {
    return async (dispatch) => {
      const endpoint = config.endpoint(...ids, '');
      const json = await dispatch(fetch.post(endpoint, resource));
      dispatch(actions.one(json, ...ids));
      return json;
    };
  };
}
