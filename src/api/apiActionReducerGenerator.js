import {
  ONE, MANY, DELETE, POST, PUT, generateDefaultStateMany,
} from './apiResultActionReducerGenerator';
import { fetch } from '~/fetch';

import _ from 'lodash';


/*
 * This function applies the ids to the config to try to find
 * the particular object we are talking about.
 *
 * Examples:
 *   getStateOfSpecificResource(require('~/api/configs/linodes').config.configs,
 *                              store.api, ['1234'])
 *   returns store.api.linodes.linodes['1234']._configs.configs
 *
 *   getStateOfSpecificResource(require('~/api/configs/linodes').config.configs,
 *                              store.api, ['1234', '1'])
 *   returns store.api.linodes.linodes['1234']._configs.configs['1']
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
  let refined = state.api[root.plural];
  const _ids = [...ids];
  let current = root;
  let name = null;

  while (current !== config) {
    name = path.pop();
    refined = refined[current.plural][_ids.shift()][name];
    current = current.subresources[name];
  }

  if (_ids.length) {
    return refined[current.plural][_ids.shift()];
  }
  return refined;
}

/*
 * Apply a filter to all returned objects so only selected fields (or none)
 * will be updated.
 */
export function filterResources(config, resources, resourceFilter = x => x) {
  const filteredResources = { ...resources };

  for (let i = 0; i < filteredResources[config.plural].length; i += 1) {
    const object = filteredResources[config.plural][i];
    const filteredObject = resourceFilter(object);

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
  return (ids = [], options) => async (dispatch, getState) => {
    const oldState = getStateOfSpecificResource(config, getState(), ids);

    const { token } = getState().authentication;
    const response = await fetch(token, config.endpoint(...ids), options);
    const resource = {
      ...(await response.json()),
      __progress: oldState && oldState.__progress || 100,
    };
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
                     fetchBeganAt, options) {
    return async (dispatch, getState) => {
      const { token } = getState().authentication;
      const endpoint = `${config.endpoint(...ids, '')}?page=${page + 1}`;

      const fetchOptions = _.merge({}, config.options, options);
      const response = await fetch(token, endpoint, fetchOptions);
      const resources = await response.json();

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
          const updatedAt = existingResourceState.__updatedAt || fetchBeganAt;
          if (updatedAt > now) {
            return await dispatch(fetchOne([...ids, resource.id]));
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
        generateDefaultStateMany(config);

      const fetchBeganAt = new Date();

      // Grab first page so we know how many there are.
      const storeInState = !state.invalid; // Store the fetched results later
      const resource = await dispatch(
        fetchPage(0, ids, resourceFilter, storeInState, fetchBeganAt, options));
      const resources = [resource];
      state = getStateOfSpecificResource(config, getState(), ids);

      // Grab all pages we know about. If state.invalid, don't save the result
      // in the redux store until we've got all the results.
      for (let i = 1; i < resources[0].total_pages; i += 1) {
        const resource = await dispatch(
          fetchPage(i, ids, resourceFilter, !state.invalid, fetchBeganAt, options));
        resources.push(resource);
      }

      // If the number of total results returned by the last page is different
      // than the total number of results we have, restart.
      const numFetchedResources = resources.map(
        resource => resource[config.plural].length
      ).reduce((a, b) => a + b);
      const numExpectedResources = resources[resources.length - 1].total_results;
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
  return (...ids) => async (dispatch, getState) => {
    const { token } = getState().authentication;
    const response = await fetch(token, config.endpoint(...ids),
      { method: 'DELETE' });
    const json = await response.json();
    dispatch(actions.delete(...ids));
    return json;
  };
}

function genThunkPut(config, actions) {
  return (resource, ...ids) => async (dispatch, getState) => {
    const { token } = getState().authentication;
    const response = await fetch(token, config.endpoint(...ids), {
      method: 'PUT',
      body: JSON.stringify(resource),
    });
    const json = await response.json();
    dispatch(actions.one(json, ...ids));
    return json;
  };
}

function genThunkPost(config, actions) {
  return (resource, ...ids) => async (dispatch, getState) => {
    const { token } = getState().authentication;
    const response = await fetch(token, config.endpoint(...ids, ''), {
      method: 'POST',
      body: JSON.stringify(resource),
    });
    const json = await response.json();
    dispatch(actions.one(json, ...ids));
    return json;
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
      const subr = config.subresources[key];
      const plural = subr.plural;
      thunks[plural] = apiActionReducerGenerator(subr, actions[plural]);
    });
  }
  thunks.type = config.plural;
  return thunks;
}

// Helpers function when making calls outside of the ability of the above thunks.
function _thunkFetch(method) {
  return (url, body) =>
    async (dispatch, getState) => {
      const state = getState();
      const { token } = state.authentication;
      const result = await fetch(token, url, {
        method: method,
        body: JSON.stringify(body),
      });

      return await result.json();
    };
}

export const thunkFetch = {
  post: _thunkFetch('POST'),
  put: _thunkFetch('PUT'),
  get: _thunkFetch('GET'),
  delete: _thunkFetch('delete'),
};
