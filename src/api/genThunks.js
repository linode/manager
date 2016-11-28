import _ from 'lodash';

import { ONE, MANY, DELETE, POST, PUT, genDefaultState } from './gen';
import { fetch } from '~/fetch';
import { getStorage, setStorage } from '~/storage';

const CROSS_USER_CACHE_HOURS = 1;

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
function getStateOfSpecificResource(config, state, ids) {
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
  return refined;
}

/*
 * Apply a filter to all returned objects so only selected fields (or none)
 * will be updated.
 */
function filterResources(config, resources, resourceFilter = x => x) {
  const filteredResources = { ...resources };

  for (let i = 0; i < filteredResources[config.plural].length; i += 1) {
    const object = filteredResources[config.plural][i];
    const filteredObject = resourceFilter(object);
    if (!filteredObject || !Object.keys(filteredObject).length) {
      filteredResources[config.plural].splice(i, 1);
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
  return (ids, progressReset = false) => async (dispatch, getState) => {
    const state = getStateOfSpecificResource(config, getState(), ids);
    const id = ids[ids.length - 1];
    const prev = state[config.plural][id];

    if (_.isUndefined(prev) || prev.invalid) {
      const { token } = getState().authentication;
      const response = await fetch(token, config.endpoint(...ids));
      // TODO: delete this when progress is implemented in the API
      const progressCheck = prev && prev.progress && !progressReset;
      const progress = progressCheck ? Math.min(prev.progress + 7, 99) : 7;
      const resource = { ...(await response.json()), progress };
      dispatch(actions.one(resource, ...ids));
      return resource;
    }

    return prev;
  };
}

/*
 * This function fetches a single page and stores it into the redux state by default.
 * All results are optionally filtered so only certain fields (or none) are updated.
 * The results are returned.
 */
function genThunkPage(config, actions) {
  function fetchPage(page = 0, ids, resourceFilter, storeInState = true) {
    return async (dispatch, getState) => {
      const { token } = getState().authentication;
      const endpoint = `${config.endpoint(...ids, '')}?page=${page + 1}`;
      const response = await fetch(token, endpoint);
      const resources = await response.json();

      const filteredResources = filterResources(config, resources, resourceFilter);

      if (storeInState) {
        dispatch(actions.many(filteredResources, ...ids));
      }
      return filteredResources;
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
function genThunkAll(config, actions, page) {
  function fetchAll(ids = [], resourceFilter) {
    return async (dispatch, getState) => {
      let state = getStateOfSpecificResource(config, getState(), ids) || genDefaultState(config);
      const resources = [state];

      // Grab first page so we know how many there are.
      if (state.totalPages === -1 || state.invalid) {
        const storeInState = !state.invalid; // Store the fetched results later
        const resource = await dispatch(
          page(0, ids, resourceFilter, storeInState));
        resources[0] = resource;
        state = getStateOfSpecificResource(config, getState(), ids);
      }

      // Grab all pages we know about. If state.invalid, don't save the result
      // in the redux store until we've got all the results.
      for (let i = 1; i < resources[0].total_pages; i += 1) {
        const resource = await dispatch(page(i, ids, resourceFilter, !state.invalid));
        resources.push(resource);
      }

      // If the number of total results returned by the last page is different
      // than the total number of results we have, restart.
      const numFetchedResources = resources.map(
        resource => resource[config.plural].length
      ).reduce((a, b) => a + b);
      const numExpectedResources = resources[resources.length - 1].total_results;
      if (numFetchedResources !== numExpectedResources) {
        return dispatch(fetchAll(ids, resourceFilter));
      }

      // Waits till all events have been fetched so we don't have UI flashes
      // while we wait for requests to be made and the results saved in the redux store.
      if (state.invalid) {
        dispatch(actions.invalidate());

        await Promise.all(resources.map(resources =>
          dispatch(actions.many(resources, ...ids))));
      }

      // The resulting object will look like this, return it so we can store it in localStorage.
      const res = {
        ...resources[resources.length - 1],
        [config.plural]: resources.reduce((a, b) => [...a, ...b[config.plural]], []),
      };

      return res;
    };
  }

  return fetchAll;
}

/*
 * This function will fetch all pages unless they are available in local storage.
 * If they are fetched, it will add them to local storage with a validity timestamp.
 */
function genThunkAllCacheable(config, actions, fetchAllPages) {
  return (ids = [], resourceFilter) => async (dispatch) => {
    if (getStorage(`localStorageCacheable/${config.plural}`)) {
      // localStorage cache hit
      const resource = getStorage(`localStorageCacheable/${config.plural}`);
      const cacheValid = new Date(resource.__cacheUntil) > new Date();
      if (cacheValid) {
        // localStorage still valid
        delete resource.__cacheUntil;
        dispatch(actions.many(resource, ...ids));
        return;
      }
    }

    const state = await dispatch(fetchAllPages(ids, resourceFilter));

    // Set cache time limit in hours.
    const now = new Date();
    state.__cacheUntil = new Date(
      now.getTime() + CROSS_USER_CACHE_HOURS * 3600000);
    setStorage(`localStorageCacheable/${config.plural}`, state);
  };
}

function genThunkUntil(config, actions, one) {
  return (test, ...ids) => async (dispatch) => {
    dispatch(actions.one({ _polling: true }, ...ids));
    let progressReset = true;
    for (;;) {
      try {
        // TODO: remove progressReset when progress is implemented in the API
        await dispatch(actions.invalidate([ids], true));
        const resource = await dispatch(one(ids, progressReset));
        progressReset = false;
        if (test(resource)) break;
      } catch (ex) {
        if (ex.statusCode === 404) {
          dispatch(actions.delete(...ids));
          return;
        }
        throw ex;
      }
      await new Promise(r => setTimeout(r, 3000));
    }
    dispatch(actions.one({ _polling: false }, ...ids));
  };
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
export default function genThunks(config, actions) {
  const thunks = { };
  const supports = a => config.supports.indexOf(a) !== -1;
  if (supports(ONE)) {
    thunks.one = genThunkOne(config, actions);
    thunks.until = genThunkUntil(config, actions, thunks.one);
  }
  if (supports(MANY)) {
    thunks.page = genThunkPage(config, actions);
    thunks.all = genThunkAll(config, actions, thunks.page);
    if (config.localStorageCacheable) {
      thunks.all = genThunkAllCacheable(config, actions, thunks.all);
    }
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
      thunks[plural] = genThunks(subr, actions[plural]);
    });
  }
  thunks.type = config.plural;
  return thunks;
}
