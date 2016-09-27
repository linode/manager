import { fetch } from '../fetch';

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
    actions.many();
    return resources;
  };
}

function genThunkAll() {
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

export function genReducer() {
}
