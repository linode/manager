import { fetch } from './fetch';
import {
  ONE, MANY, DELETE, POST, PUT,
} from './internal';


// Sometimes the object will have sub-objects of it created before the object actually
// exists. However, this is not cause to refetch the object after we just grabbed it.
export function fullyLoadedObject(object) {
  return object && !!Object.keys(object).filter(key => !key.startsWith('_')).length;
}

/*
 * Apply a filter to all returned objects so only selected fields (or none)
 * will be updated.
 */
export function filterResources(config, resources, resourceFilter) {
  const filteredResources = { ...resources };

  for (let i = 0; i < filteredResources[config.name].length; i += 1) {
    const object = filteredResources[config.name][i];
    const filteredObject = resourceFilter ? resourceFilter(object) : object;

    if (!filteredObject || !Object.keys(filteredObject).length) {
      filteredResources[config.name].splice(i, 1);
    } else {
      filteredResources[config.name][i] = {
        ...object,
        ...filteredObject,
      };
    }
  }

  const oldObjects = resources[config.name];
  const newObjects = filteredResources[config.name];
  if (oldObjects.length !== newObjects.length) {
    filteredResources.totalResults -= (oldObjects.length - newObjects.length);
  }

  return filteredResources;
}

function genThunkOne(config, actions) {
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
function genThunkPage(config, actions) {
  function fetchPage(page = 0, ids = [], resourceFilter, headers) {
    return async (dispatch) => {
      const endpoint = `${config.endpoint(...ids, '')}?page=${page + 1}`;
      const resources = await dispatch(fetch.get(endpoint, undefined, headers));
      resources[config.name] = resources.data || [];
      const filteredResources = filterResources(config, resources, resourceFilter);
      await dispatch(actions.many(filteredResources, ...ids));
      return filteredResources;
    };
  }

  return fetchPage;
}

/*
 * This function fetches all pages, stores them in Redux and returns the result
 */
function genThunkAll(config, actions, fetchPage) {
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

function genThunkDelete(config, actions) {
  return (...ids) => async (dispatch) => {
    const endpoint = config.endpoint(...ids);
    const json = await dispatch(fetch.delete(endpoint));
    dispatch(actions.delete(...ids));
    return json;
  };
}

function genThunkPut(config, actions) {
  return (resource, ...ids) => async (dispatch) => {
    const endpoint = config.endpoint(...ids);
    const json = await dispatch(fetch.put(endpoint, resource));
    dispatch(actions.one(json, ...ids));
    return json;
  };
}

function genThunkPost(config, actions) {
  return (resource, ...ids) => {
    return async (dispatch) => {
      const endpoint = config.endpoint(...ids, '');
      const json = await dispatch(fetch.post(endpoint, resource));
      dispatch(actions.one(json, ...ids));
      return json;
    };
  };
}

/**
 * Generates thunks for the provided config.
 */
export default function apiActionReducerGenerator(config, actions) {
  const thunks = { };
  const supports = a => config.supports.indexOf(a) !== -1;
  if (supports(ONE)) {
    thunks.one = genThunkOne(config, actions);
  }
  if (supports(MANY)) {
    thunks.page = genThunkPage(config, actions);
    thunks.all = genThunkAll(config, actions, thunks.page);
  }
  if (supports(DELETE)) {
    thunks.delete = genThunkDelete(config, actions);
  }
  if (supports(PUT)) {
    thunks.put = genThunkPut(config, actions);
  }
  if (supports(POST)) {
    thunks.post = genThunkPost(config, actions);
  }
  if (config.subresources) {
    Object.keys(config.subresources).forEach((key) => {
      const subresource = config.subresources[key];
      thunks[subresource.name] = apiActionReducerGenerator(subresource,
        actions[subresource.name]);
    });
  }
  thunks.type = config.name;
  return thunks;
}
