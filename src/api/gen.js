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

const actionGenerators = {
  [ONE]: c => (resource, ...ids) =>
    ({ type: `GEN@${c.plural}/ONE`, resource, ids }),
  [MANY]: c => (page, ...ids) =>
    ({ type: `GEN@${c.plural}/MANY`, page, ids }),
  [DELETE]: c => (...ids) =>
    ({ type: `GEN@${c.plural}/DELETE`, ids }),
};

function refineState(config, state, ids) {
  let parent = config;
  const names = [];
  const match = key => {
    if (parent.parent.subresources[key] === parent) {
      names.push(key);
    }
  };
  while (parent.parent) {
    Object.keys(parent.parent.subresources).forEach(match);
    parent = parent.parent;
  }
  let refined = state.api;
  const _ids = [...ids];
  while (parent !== config) {
    refined = refined[parent.plural][_ids.shift()];
    parent = parent.subresources[names.pop()];
  }
  return refined;
}

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
  return actions;
}

function genThunkOne(config, actions) {
  return (...ids) => async (dispatch, getState) => {
    let overwrite = false;
    if (typeof ids[ids.length - 1] === 'boolean') {
      overwrite = ids.pop();
    }
    const state = refineState(config, getState(), ids);
    const id = ids[ids.length - 1];
    if (!overwrite && !_.isUndefined(state[config.plural][id])) {
      return;
    }
    const { token } = getState().authentication;
    const response = await fetch(token, config.endpoint(...ids));
    const resource = await response.json();
    dispatch(actions.one(resource, ...ids));
    return resource;
  };
}

function genThunkPage(config, actions) {
  return (page = 0, ...ids) => async (dispatch, getState) => {
    const { token } = getState().authentication;
    const state = refineState(config, getState(), ids);
    if (state.totalPages !== -1
        && state.pagesFetched.indexOf(page) !== -1) {
      return;
    }
    const endpoint = `${config.endpoint(...ids, '')}?page=${page + 1}`;
    const response = await fetch(token, endpoint);
    const resources = await response.json();
    // TODO: Finish this
    actions.many();
    return resources;
  };
}

function genThunkAll() {
  // TODO
}

/**
 * Generates thunks for the provided config.
 */
export function genThunks(config, actions) {
  const thunks = { };
  const supports = a => config.supports.indexOf(a) !== -1;
  if (supports(ONE)) {
    thunks.one = genThunkOne(config, actions);
  }
  if (supports(MANY)) {
    thunks.page = genThunkPage(config, actions);
    thunks.all = genThunkAll(config, actions);
  }
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
    const { id } = action.resource;
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
    config; action;
    return state;
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

  function reducer(config, state, action) {
    switch (action.type) {
      case `GEN@${config.plural}/ONE`:
        return one(config, state, action);
      case `GEN@${config.plural}/MANY`:
        return many(config, state, action);
      case `GEN@${config.plural}/DELETE`:
        return del(config, state, action);
      case `GEN@${config.plural}/INVALIDATE`:
        return invalidate(config, state);
      default:
        return state;
    }
  }

  const defaultState = genDefaultState(_config);
  return (state = defaultState, action) => reducer(_config, state, action);
}
