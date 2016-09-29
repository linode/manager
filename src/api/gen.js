import { fetch } from '../fetch';
import _ from 'lodash';

export const ONE = 'ONE';
export const PUT = 'PUT';
export const MANY = 'MANY';
export const POST = 'POST';
export const DELETE = 'DELETE';

/**
 * Adds parent properties to all subresources and returns a new config.
 */
export function genConfig(config, parent = undefined) {
  const result = { ...config, parent };
  if (config.subresources) {
    Object.keys(config.subresources).forEach(key => {
      result.subresources[key] =
        genConfig(result.subresources[key], result);
    });
  }
  return result;
}

function fullyQualified(resource) {
  let path = resource.plural;
  let res = resource;
  while (res.parent) {
    res = res.parent;
    path = `${res.plural}.${path}`;
  }
  return path;
}

const actionGenerators = {
  [ONE]: c => (resource, ...ids) =>
    ({ type: `GEN@${fullyQualified(c)}/ONE`, resource, ids: ids.map(n => parseInt(n)) }),
  [MANY]: c => (page, ...ids) =>
    ({ type: `GEN@${fullyQualified(c)}/MANY`, page, ids: ids.map(n => parseInt(n)) }),
  [DELETE]: c => (...ids) =>
    ({ type: `GEN@${fullyQualified(c)}/DELETE`, ids: ids.map(n => parseInt(n)) }),
};

/**
 * Generates action creators for the provided config.
 */
export function genActions(config) {
  const actions = { };
  const fns = {
    [ONE]: 'one',
    [MANY]: 'many',
    [DELETE]: 'delete',
  };
  config.supports.forEach(feature => {
    if (typeof actionGenerators[feature] !== 'undefined') {
      actions[fns[feature]] = actionGenerators[feature](config);
    }
  });
  actions.invalidate = () => ({ type: `GEN@${config.plural}/INVALIDATE` });
  if (config.subresources) {
    Object.keys(config.subresources).forEach(key => {
      actions[config.subresources[key].plural] =
        genActions(config.subresources[key]);
    });
  }
  actions.type = config.plural;
  return actions;
}

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
    const state = refineState(config, getState(), ids);
    const id = ids[ids.length - 1];
    const prev = state[config.plural][id];
    if (!overwrite && !_.isUndefined(prev)) {
      return prev;
    }
    const { token } = getState().authentication;
    const response = await fetch(token, config.endpoint(...ids));
    const resource = await response.json();
    dispatch(actions.one(resource, ...ids));
    return resource;
  };
}

function genThunkPage(config, actions) {
  function fetchPage(page = 0, ...ids) {
    return async (dispatch, getState) => {
      const { token } = getState().authentication;
      const state = refineState(config, getState(), ids);
      if (state.totalPages !== -1 &&
          state.pagesFetched.indexOf(page) !== -1) {
        // cache hit
        return;
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
      actions.many();
      if (state.totalPages !== -1 &&
          state.totalResults !== resources.totalResults) {
        dispatch(actions.invalidate());
        for (let i = 0; i < state.pagesFetched.length; ++i) {
          if (state.pagesFetched[i] - 1 !== page) {
            await dispatch(fetchPage(state.pagesFetched[i] - 1, ...ids));
          }
        }
      }
      dispatch(actions.many(resources, ...ids));
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

    for (let i = 1; i < state.totalPages; i++) {
      if (state.pagesFetched.indexOf(i + 1) === -1) {
        await dispatch(page(i, ...ids));
      }
    }
  };
}

function genThunkUntil(config, actions, one) {
  return (test, ...ids) => async (dispatch) => {
    dispatch(actions.one({ _polling: true }, ...ids));
    for (;;) {
      try {
        const resource = await dispatch(one(...ids, true));
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
export function genThunks(config, actions) {
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
    Object.keys(config.subresources).forEach(key => {
      const subr = config.subresources[key];
      const plural = subr.plural;
      thunks[plural] = genThunks(subr, actions[plural]);
    });
  }
  thunks.type = config.plural;
  return thunks;
}

function genDefaultState(config) {
  return {
    pagesFetched: [],
    totalPages: -1,
    totalResults: -1,
    [config.plural]: {},
  };
}

function addMeta(config, item) {
  const subs = config.subresources ?
    _.reduce(config.subresources, (acc, conf, key) => (
      { ...acc, [key]: { ...genDefaultState(conf) } }), { })
    : undefined;
  return { ...item, _polling: false, ...subs };
}

export function genReducer(_config) {
  function one(config, state, action) {
    const id = action.ids[action.ids.length - 1];
    const previous = state[config.plural][id];
    const next = previous ? action.resource : addMeta(config, action.resource);
    return {
      ...state,
      [config.plural]: {
        ...state[config.plural],
        [id]: {
          ...previous,
          ...next,
        },
      },
    };
  }

  function many(config, state, action) {
    const { page } = action;
    return {
      ...state,
      pagesFetched: [
        ...state.pagesFetched.filter(p => p !== page.page),
        page.page,
      ],
      totalPages: page.total_pages,
      totalResults: page.total_results,
      [config.plural]: {
        ...state[config.plural],
        ...page[config.plural].reduce((s, i) =>
          ({ ...s, [i.id]: addMeta(config, i) }), { }),
      },
    };
  }

  function del(config, state, action) {
    const id = action.ids[action.ids.length - 1];
    return {
      ...state,
      [config.plural]: _.omit(state[config.plural], id),
    };
  }

  function invalidate(config, state) {
    return {
      ...state,
      [config.plural]: { },
      totalPages: -1,
      totalResults: -1,
      pagesFetched: [],
    };
  }

  function subresource(config, state, action) {
    let path = action.type.substr(action.type.indexOf('@') + 1);
    path = path.substr(0, path.indexOf('/'));
    const names = path.split('.');
    const { ids } = action;

    let name = null;
    for (let i = 0; i < names.length; i++) {
      if (names[i] === config.plural) {
        name = names[i + 1];
        break;
      }
    }

    if (!name) return state;

    const item = state[config.plural][ids[0]];
    const keys = Object.keys(config.subresources);
    let subkey = null;
    let subconfig = null;
    for (let i = 0; i < keys.length; i++) {
      subkey = keys[i];
      subconfig = config.subresources[subkey];
      if (subconfig.plural === name) {
        break;
      }
    }
    const subaction = { ...action, ids: ids.splice(1) };
    return one(config, state, {
      ids: action.ids,
      // eslint-disable-next-line no-use-before-define
      resource: { [subkey]: reducer(subconfig, item[subkey], subaction) },
    });
  }

  function reducer(config, state, action) {
    switch (action.type) {
      case `GEN@${fullyQualified(config)}/ONE`:
        return one(config, state, action);
      case `GEN@${fullyQualified(config)}/MANY`:
        return many(config, state, action);
      case `GEN@${fullyQualified(config)}/DELETE`:
        return del(config, state, action);
      case `GEN@${fullyQualified(config)}/INVALIDATE`:
        return invalidate(config, state);
      default:
        if (action.type && action.type.indexOf(`GEN@${config.plural}.`) === 0) {
          return subresource(config, state, action);
        }
        return state;
    }
  }

  const defaultState = genDefaultState(_config);
  return (state = defaultState, action) => reducer(_config, state, action);
}
