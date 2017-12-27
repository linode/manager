import { fetch } from './fetch';
import {
  ONE, MANY, DELETE, POST, PUT, generateDefaultStateFull,
} from './internal';


// Sometimes the object will have sub-objects of it created before the object actually
// exists. However, this is not cause to refetch the object after we just grabbed it.
export function fullyLoadedObject(object) {
  return object && !!Object.keys(object).filter(key => !key.startsWith('_')).length;
}

/*
 * This function applies the ids to the config to try to find
 * the particular object we are talking about.
 *
 * Examples:
 *   getStateOfSpecificResource(require('~/api/generic/linodes').config.generic,
 *                              store.api, ['1234'])
 *   returns store.api.linodes.linodes['1234']._generic.generic
 *
 *   getStateOfSpecificResource(require('~/api/generic/linodes').config.generic,
 *                              store.api, ['1234', '1'])
 *   returns store.api.linodes.linodes['1234']._generic.generic['1']
 */
export function getStateOfSpecificResource(config, state, ids) {
  const path = [];
  let root = config;
  const match = (sub, parent) => {
    if (parent.subresources[sub] === root) {
      path.push(sub);
    }
  };
  while (root.parent) {
    const parent = root.parent;
    Object.keys(parent.subresources).forEach(s => match(s, parent));
    root = parent;
  }
  let refined = state.api[root.plural || root.singular];
  const _ids = [...ids];
  let current = root;
  let name = null;

  while (current !== config) {
    name = path.pop();
    if (current.singular) {
      // Not totally sure how things would work with a plural inside a singular
      refined = refined[current.singular][name];
    } else {
      refined = refined[current.plural][_ids.shift()][name];
    }
    current = current.subresources[name];
  }

  if (_ids.length) {
    // Should only be a plural one anyway, but just in case.
    const objects = refined[current.plural || current.singular];
    if (current.singular) {
      return objects;
    }

    return objects[_ids[_ids.length - 1]];
  }
  return refined;
}

/*
 * Apply a filter to all returned objects so only selected fields (or none)
 * will be updated.
 */
export function filterResources(config, resources, resourceFilter) {
  const filteredResources = { ...resources };

  for (let i = 0; i < filteredResources[config.plural].length; i += 1) {
    const object = filteredResources[config.plural][i];
    const filteredObject = resourceFilter ? resourceFilter(object) : object;

    if (!filteredObject || !Object.keys(filteredObject).length) {
      filteredResources[config.plural].splice(i, 1);
    } else {
      filteredResources[config.plural][i] = {
        ...object,
        ...filteredObject,
      };
    }
  }

  const oldObjects = resources[config.plural];
  const newObjects = filteredResources[config.plural];
  if (oldObjects.length !== newObjects.length) {
    filteredResources.totalResults -= (oldObjects.length - newObjects.length);
  }

  return filteredResources;
}

function genThunkOne(config, actions) {
  return (ids = [], headers = {}) => async (dispatch) => {
    const endpoint = config.endpoint(...ids);
    const resource = await fetch.get(endpoint, undefined, headers);
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
  function fetchPage(page = 0, ids = [], resourceFilter, storeInState = true,
    fetchBeganAt, headers) {
    return async (dispatch, getState) => {
      const endpoint = `${config.endpoint(...ids, '')}?page=${page + 1}`;

      const resources = await fetch.get(endpoint, undefined, headers);
      resources[config.plural] = resources.data || [];

      const now = fetchBeganAt || new Date();

      // The filterResources function must acknowledge that it may not be getting
      // the most up-to-date results.
      const filteredResources = filterResources(config, resources, resourceFilter);

      // Refetch any existing results that have been updated since fetchBeganAt.
      const fetchOne = genThunkOne(config, actions);
      const objects = await Promise.all(filteredResources[config.plural].map(async (resource) => {
        const existingResourceState = getStateOfSpecificResource(
          config, getState(), [...ids, resource.id]);
        if (existingResourceState) {
          const hasActualState = fullyLoadedObject(existingResourceState);

          const updatedAt = hasActualState && existingResourceState.__updatedAt || fetchBeganAt;
          if (updatedAt > now) {
            try {
              return await dispatch(fetchOne([...ids, resource.id]));
            } catch (e) {
              // There's some case where fetching will 404 because there's some item in internal
              // state that is not returned from the API (or was because the API is returning
              // deleted items?). Catch that and don't blow up; log for good measure.
              // eslint-disable-next-line
              console.trace(e);
              return Promise.resolve();
            }
          }
        }
        return resource;
      }));

      const updatedResources = {
        ...filteredResources,
        [config.plural]: objects,
      };

      if (storeInState) {
        await dispatch(actions.many(updatedResources, ...ids));
      }

      return updatedResources;
    };
  }

  return fetchPage;
}

/*
 * This function fetches all pages. If the final page indicates the total results
 * were not fetched, it restarts the process. If it is fixing partial invalidation,
 * it waits to invalidate and store the new data into the store until all the
 * pages have been fetched.
 */
function genThunkAll(config, actions, fetchPage) {
  function fetchAll(ids = [], resourceFilter, options) {
    return async (dispatch, getState) => {
      let state = getStateOfSpecificResource(config, getState(), ids) ||
        generateDefaultStateFull(config);

      const fetchBeganAt = new Date();

      // Grab first page so we know how many there are.
      const storeInState = !state.invalid; // Store the fetched results later
      const resource = await dispatch(
        fetchPage(0, ids, resourceFilter, storeInState, fetchBeganAt, options));
      const resources = [resource];
      state = getStateOfSpecificResource(config, getState(), ids);

      // Grab all pages we know about. If state.invalid, don't save the result
      // in the redux store until we've got all the results.
      const requests = [];
      for (let i = 1; i < resources[0].pages; i += 1) {
        requests.push(fetchPage(i, ids, resourceFilter, !state.invalid, fetchBeganAt, options));
      }

      const allPages = await Promise.all(requests.map(r => dispatch(r)));
      allPages.forEach(function (response) {
        resources.push(response);
      });

      // If the number of total results returned by the last page is different
      // than the total number of results we have, restart.
      const numFetchedResources = resources.map(
        resource => resource[config.plural].length
      ).reduce((a, b) => a + b);
      const numExpectedResources = resources[resources.length - 1].results;
      if (numFetchedResources !== numExpectedResources) {
        return await dispatch(fetchAll(ids, resourceFilter));
      }

      // Waits until all things have been fetched so we don't have UI flashes
      // while we wait for requests to be made and the results saved in the redux store.
      if (state.invalid) {
        dispatch(actions.invalidate());

        await Promise.all(resources.map(page =>
          dispatch(actions.many(page, ...ids))));
      }

      // The resulting object will look like this, return it so anyone can use it immediately.
      const res = {
        ...resources[resources.length - 1],
        [config.plural]: resources.reduce((a, b) => [...a, ...b[config.plural]], []),
      };

      return res;
    };
  }

  return fetchAll;
}

function genThunkDelete(config, actions) {
  return (...ids) => async (dispatch) => {
    const endpoint = config.endpoint(...ids);
    const json = await fetch.delete(endpoint);
    dispatch(actions.delete(...ids));
    return json;
  };
}

function genThunkPut(config, actions) {
  return (resource, ...ids) => async (dispatch) => {
    const endpoint = config.endpoint(...ids);
    const json = await fetch.put(endpoint, resource);
    dispatch(actions.one(json, ...ids));
    return json;
  };
}

function genThunkPost(config, actions) {
  return (resource, ...ids) => {
    return async (dispatch) => {
      const endpoint = config.endpoint(...ids, '');
      const json = await fetch.post(endpoint, resource);
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
      if (subresource.plural) {
        thunks[subresource.plural] = apiActionReducerGenerator(subresource,
          actions[subresource.plural]);
      } else if (subresource.singular) {
        thunks[subresource.singular] = apiActionReducerGenerator(subresource,
          actions[subresource.singular]);
      }
    });
  }
  if (config.plural) {
    thunks.type = config.plural;
  } else if (config.singular) {
    thunks.type = config.singular;
  }
  return thunks;
}
