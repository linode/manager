import isArray from 'lodash/isArray';
import reduce from 'lodash/reduce';
import _isNaN from 'lodash/isNaN';
import omit from 'lodash/omit';

export const ONE = 'ONE';
export const PUT = 'PUT';
export const MANY = 'MANY';
export const POST = 'POST';
export const DELETE = 'DELETE';


export function isPlural(config) {
  return config.supports.indexOf(MANY) > -1;
}

/**
 * Adds parent properties to all subresources and returns a new config.
 */
export function addParentRefs(config, parent = undefined) {
  const result = { ...config, parent };
  if (config.subresources) {
    Object.keys(config.subresources).forEach((key) => {
      result.subresources[key] =
        addParentRefs(config.subresources[key], result);
    });
  }
  return Object.freeze(result);
}

function fullyQualified(resource) {
  let path = resource.name;
  let res = resource;
  while (res.parent) {
    res = res.parent;
    path = `${res.name}.${path}`;
  }
  return path;
}

function parseIntIfActualInt(string) {
  if (isArray(string)) {
    // eslint-disable-next-line no-console
    console.error('You sent a list of lists rather than a list of ids.');
  }
  return isNaN(string) ? string : parseInt(string);
}

const actionCreatorGenerators = {
  [ONE]: c => (resource, ...ids) =>
    ({
      resource,
      type: `GEN@${fullyQualified(c)}/ONE`,
      ids: ids.map(parseIntIfActualInt),
    }),
  [MANY]: c => (page, ...ids) =>
    ({
      page,
      type: `GEN@${fullyQualified(c)}/MANY`,
      ids: ids.map(parseIntIfActualInt),
    }),
  [DELETE]: c => (...ids) =>
    ({
      type: `GEN@${fullyQualified(c)}/DELETE`,
      ids: ids.map(parseIntIfActualInt),
    }),
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
    if (typeof actionCreatorGenerators[feature] !== 'undefined') {
      actions[fns[feature]] = actionCreatorGenerators[feature](config);
    }
  });
  if (config.subresources) {
    Object.keys(config.subresources).forEach((key) => {
      const subresource = config.subresources[key];
      const subActions = genActions(subresource, 2);
      actions[subresource.name] = subActions;
    });
  }
  actions.type = config.name;
  return actions;
}

export function generateDefaultStateFull(config) {
  if (isPlural(config)) {
    return {
      totalPages: -1,
      totalResults: -1,
      ids: [],
      [config.name]: {},
    };
  }

  return {};
}

export function generateDefaultStateOne(config, one) {
  const subresources = reduce(
    config.subresources, (accumulated, subresourceConfig, subresourceName) => ({
      ...accumulated,
      [subresourceName]: { ...generateDefaultStateFull(subresourceConfig) },
    }), {});
  return { ...one, ...subresources };
}

export class ReducerGenerator {
  static one(config, oldStateMany, action) {
    if (!isPlural(config)) {
      return { ...oldStateMany, ...action.resource };
    }

    const nonNanActionIds = (action.ids || []).filter(i => !_isNaN(i));
    const id = nonNanActionIds.length ? nonNanActionIds[action.ids.length - 1] :
      action.resource[config.primaryKey];
    const oldStateOne = oldStateMany[config.name][id];
    const newStateOne = oldStateOne ? action.resource :
      generateDefaultStateOne(config, action.resource);

    const combinedStateOne = { ...oldStateOne, ...newStateOne, __updatedAt: new Date() };

    const newStateMany = {
      ...oldStateMany,
      [config.name]: {
        ...oldStateMany[config.name],
        [id]: combinedStateOne,
      },
    };

    return newStateMany;
  }

  static many(config, oldState, action) {
    const { page } = action;

    const newState = page[config.name].reduce((stateAccumulator, oneObject) =>
      ReducerGenerator.one(config, stateAccumulator, {
        ids: [oneObject[config.primaryKey]],
        resource: oneObject,
        dispatch: action.dispatch,
      }), oldState);

    let ids = Object.values(newState[config.name]).map((obj) => obj[config.primaryKey]);

    if (config.sortFn) {
      ids = config.sortFn(ids, newState[config.name]);
    }

    return {
      ...newState,
      ids,
      totalPages: page.pages,
      totalResults: page.results,
    };
  }

  static del(config, state, action) {
    const id = action.ids[action.ids.length - 1];
    const newMany = omit(state[config.name], id);
    return {
      ...state,
      ids: Object.values(newMany).map(({ id }) => id),
      [config.name]: newMany,
    };
  }

  static subresource(config, state, action) {
    let path = action.type.substr(action.type.indexOf('@') + 1);
    path = path.substr(0, path.indexOf('/'));
    const names = path.split('.');
    const { ids } = action;

    let name = null;
    let i;
    for (i = 0; i < names.length; i += 1) {
      if (names[i] === config.name) {
        name = names[i + 1];
        break;
      }
    }

    if (!name) return state;

    const keys = Object.keys(config.subresources);
    let subkey = null;
    let subconfig = null;
    for (i = 0; i < keys.length; i += 1) {
      subkey = keys[i];
      subconfig = config.subresources[subkey];
      if (subconfig.name === name) {
        break;
      }
    }

    if (i === keys.length) {
      return state;
    }

    const subaction = { ...action, ids: ids.splice(1) };
    const item = state[config.name][ids[0]];
    return ReducerGenerator.one(config, state, {
      ids: action.ids,
      // eslint-disable-next-line no-use-before-define
      resource: { [subkey]: ReducerGenerator.reducer(subconfig, item[subkey], subaction) },
    });
  }

  static reducer(config, state, action) {
    const subTypeMatch = `GEN@${fullyQualified(config)}`;

    switch (action.type) {
      case `GEN@${fullyQualified(config)}/ONE`:
        return ReducerGenerator.one(config, state, action);
      case `GEN@${fullyQualified(config)}/MANY`:
        return ReducerGenerator.many(config, state, action);
      case `GEN@${fullyQualified(config)}/DELETE`:
        return ReducerGenerator.del(config, state, action);
      // eslint-disable-next-line no-case-declarations
      default:
        if (action.type && action.type.split('/')[0].indexOf(subTypeMatch) === 0) {
          // Go inside a nested config
          return ReducerGenerator.subresource(config, state, action);
        }
        return state;
    }
  }

  constructor(_config) {
    const defaultState = generateDefaultStateFull(_config);
    this.reducer = (state = defaultState, action) =>
      ReducerGenerator.reducer(_config, state, action);
  }
}
