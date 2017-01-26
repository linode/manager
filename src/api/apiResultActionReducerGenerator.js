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
    Object.keys(config.subresources).forEach((key) => {
      result.subresources[key] =
        genConfig(config.subresources[key], result);
    });
  }
  return Object.freeze(result);
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
    ({ type: `GEN@${fullyQualified(c)}/ONE`, resource, ids: ids.map(n => parseInt(n) || n) }),
  [MANY]: c => (page, ...ids) =>
    ({ type: `GEN@${fullyQualified(c)}/MANY`, page, ids: ids.map(n => parseInt(n) || n) }),
  [DELETE]: c => (...ids) =>
    ({ type: `GEN@${fullyQualified(c)}/DELETE`, ids: ids.map(n => parseInt(n) || n) }),
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
  config.supports.forEach((feature) => {
    if (typeof actionGenerators[feature] !== 'undefined') {
      actions[fns[feature]] = actionGenerators[feature](config);
    }
  });
  actions.invalidate = (ids = [], partial = false) =>
    ({ type: `GEN@${fullyQualified(config)}/INVALIDATE`, ids, partial });
  if (config.subresources) {
    Object.keys(config.subresources).forEach((key) => {
      actions[config.subresources[key].plural] =
        genActions(config.subresources[key], 2);
    });
  }
  actions.type = config.plural;
  return actions;
}

export function generateDefaultStateMany(config) {
  return {
    totalPages: -1,
    totalResults: -1,
    [config.plural]: {},
  };
}

export function generateDefaultStateOne(config, one) {
  const subresources = _.reduce(
    config.subresources, (accumulated, subresourceConfig, subresourceName) => ({
      ...accumulated,
      [subresourceName]: { ...generateDefaultStateMany(subresourceConfig) },
    }), {});
  return { ...one, ...subresources };
}

export class ReducerGenerator {
  static one(config, oldStateMany, action) {
    const id = action.ids.length ? action.ids[action.ids.length - 1] : action.resource.id;
    const oldStateOne = oldStateMany[config.plural][id];
    const newStateOne = oldStateOne ? action.resource :
                        generateDefaultStateOne(config, action.resource);

    const newStateMany = {
      ...oldStateMany,
      [config.plural]: {
        ...oldStateMany[config.plural],
        [id]: {
          ...oldStateOne,
          ...newStateOne,
          __updatedAt: new Date(),
        },
      },
    };

    return newStateMany;
  }

  static many(config, oldState, action) {
    const { page } = action;

    const newState = page[config.plural].reduce((stateAccumulator, oneObject) =>
      ReducerGenerator.one(config, stateAccumulator, {
        ids: [oneObject.id],
        resource: oneObject,
      }), oldState);

    return {
      ...newState,
      totalPages: page.total_pages,
      totalResults: page.total_results,
    };
  }

  static del(config, state, action) {
    const id = action.ids[action.ids.length - 1];
    return {
      ...state,
      [config.plural]: _.omit(state[config.plural], id),
    };
  }

  static invalidate(config, state, action) {
    let newState = { ...state };
    if (action.partial) {
      // Keep data but mark as invalid to be overwritten
      // when new data is available by thunks.all.
      if (action.ids.length) {
        // action.ids should only ever be just 1 id
        newState[config.plural][action.ids[0]].invalid = true;
      } else {
        newState.invalid = true;
      }
    } else {
      if (action.ids.length) {
        // action.ids should only ever be just 1 id
        delete newState[config.plural][action.ids[0]];
      } else {
        newState = generateDefaultStateMany(config);
      }
    }

    return { ...newState, __updatedAt: new Date() };
  }

  static subresource(config, state, action) {
    let path = action.type.substr(action.type.indexOf('@') + 1);
    path = path.substr(0, path.indexOf('/'));
    const names = path.split('.');
    const { ids } = action;

    let name = null;
    let i;
    for (i = 0; i < names.length; i += 1) {
      if (names[i] === config.plural) {
        name = names[i + 1];
        break;
      }
    }

    if (!name) return state;

    if (i !== names.length - 2) {
      throw new Error('3-layer configs not supported');
    }

    const keys = Object.keys(config.subresources);
    let subkey = null;
    let subconfig = null;
    for (let i = 0; i < keys.length; i += 1) {
      subkey = keys[i];
      subconfig = config.subresources[subkey];
      if (subconfig.plural === name) {
        break;
      }
    }

    const subaction = { ...action, ids: ids.splice(1) };
    const item = state[config.plural][ids[0]];
    return ReducerGenerator.one(config, state, {
      ids: action.ids,
      // eslint-disable-next-line no-use-before-define
      resource: { [subkey]: ReducerGenerator.reducer(subconfig, item[subkey], subaction) },
    });
  }

  static reducer(config, state, action) {
    switch (action.type) {
      case `GEN@${fullyQualified(config)}/ONE`:
        return ReducerGenerator.one(config, state, action);
      case `GEN@${fullyQualified(config)}/MANY`:
        return ReducerGenerator.many(config, state, action);
      case `GEN@${fullyQualified(config)}/DELETE`:
        return ReducerGenerator.del(config, state, action);
      case `GEN@${fullyQualified(config)}/INVALIDATE`:
        return ReducerGenerator.invalidate(config, state, action);
      default:
        if (action.type && action.type.indexOf(`GEN@${config.plural}.`) === 0) {
          return ReducerGenerator.subresource(config, state, action);
        }
        return state;
    }
  }

  constructor(_config) {
    const defaultState = generateDefaultStateMany(_config);
    this.reducer = (state = defaultState, action) =>
      ReducerGenerator.reducer(_config, state, action);
  }
}
