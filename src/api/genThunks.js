import _ from 'lodash';

import { ONE, MANY, DELETE, POST, PUT } from './gen';
import { fetch } from '~/fetch';
import { getStorage, setStorage } from '~/storage';

const CROSS_USER_CACHE_HOURS = 1;

function refineState(config, state, ids) {
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

function genThunkOne(config, actions) {
  return (...ids) => async (dispatch, getState) => {
    let overwrite = false;
    if (typeof ids[ids.length - 1] === 'boolean') {
      overwrite = ids.pop();
    }
    let progressReset = false;
    if (typeof ids[ids.length - 1] === 'boolean') {
      progressReset = ids.pop();
    }
    const state = refineState(config, getState(), ids);
    const id = ids[ids.length - 1];
    const prev = state[config.plural][id];

    if (overwrite || _.isUndefined(prev)) {
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

function genThunkPage(config, actions) {
  function fetchPage(page = 0, ...ids) {
    return async (dispatch, getState) => {
      const { token } = getState().authentication;
      const state = refineState(config, getState(), ids);
      if (state.totalPages !== -1 &&
          state.pagesFetched.indexOf(page + 1) !== -1) {
        // cache hit
        return;
      } else if (config.crossUserCache && getStorage(`crossUserCache/${config.plural}`)) {
        // localstorage cache hit
        const resource = getStorage(`crossUserCache/${config.plural}`);
        const cacheValid = new Date(resource.__cacheUntil) > new Date();
        if (cacheValid) {
          // localstorage still valid
          delete resource.__cacheUntil;
          return resource;
        }
      }

      // Update the pages fetched first so we don't double-fetch this resource
      dispatch(actions.many({
        page: page + 1,
        totalPages: -2,
        totalResults: -2,
        [config.plural]: [],
      }, ...ids));
      const endpoint = `${config.endpoint(...ids, '')}?page=${page + 1}`;
      const response = await fetch(token, endpoint);
      const resources = await response.json();

      if (state.totalPages !== -1 &&
          state.totalResults !== resources.total_results) {
        dispatch(actions.invalidate());
        for (let i = 0; i < state.pagesFetched.length; i += 1) {
          if (state.pagesFetched[i] - 1 !== page) {
            await dispatch(fetchPage(state.pagesFetched[i] - 1, ...ids));
          }
        }
      }
      dispatch(actions.many(resources, ...ids));

      // Cache response for all users
      if (config.crossUserCache) {
        // Set cache time limit in hours.
        const now = new Date();
        resources.__cacheUntil = new Date(
          now.getTime() + CROSS_USER_CACHE_HOURS * 3600000);
        setStorage(`crossUserCache/${config.plural}`, resources);
      }

      return resources;
    };
  }
  return fetchPage;
}

function genThunkAll(config, page) {
  return (...ids) => async (dispatch, getState) => {
    let state = refineState(config, getState(), ids);
    if (state.totalPages === -1) {
      await dispatch(page(0, ...ids));
      state = refineState(config, getState(), ids);
    }

    for (let i = 1; i < state.totalPages; i += 1) {
      if (state.pagesFetched.indexOf(i + 1) === -1) {
        await dispatch(page(i, ...ids));
      }
    }
  };
}

function genThunkUntil(config, actions, one) {
  return (test, ...ids) => async (dispatch) => {
    dispatch(actions.one({ _polling: true }, ...ids));
    let progressReset = true;
    for (;;) {
      try {
        // TODO: remove progressReset when progress is implemented in the API
        const resource = await dispatch(one(...ids, progressReset, true));
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
    thunks.all = genThunkAll(config, thunks.page);
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
