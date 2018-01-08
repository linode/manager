import isArray from 'lodash/isArray';
import reduce from 'lodash/reduce';
import isNaN from 'lodash/isNaN';
import omit from 'lodash/omit';

export const ONE = 'ONE';
export const PUT = 'PUT';
export const MANY = 'MANY';
export const POST = 'POST';
export const DELETE = 'DELETE';

/**
 * Adds parent properties to all subresources and returns a new config.
 */
export function genConfig(config, parent = undefined) {
  const result = { primaryKey: 'id', ...config, parent };
  if (config.subresources) {
    Object.keys(config.subresources).forEach((key) => {
      result.subresources[key] =
        genConfig(config.subresources[key], result);
    });
  }
  return Object.freeze(result);
}

function fullyQualified(resource) {
  let path = resource.plural ? resource.plural : resource.singular;
  let res = resource;
  while (res.parent) {
    res = res.parent;
    path = `${res.plural ? res.plural : res.singular}.${path}`;
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

const actionGenerators = {
  [ONE]: c => (resource, ...ids) => (dispatch) =>
    dispatch({
      resource,
      dispatch,
      type: `GEN@${fullyQualified(c)}/ONE`,
      ids: ids.map(parseIntIfActualInt),
    }),
  [MANY]: c => (page, ...ids) => (dispatch) =>
    dispatch({
      page,
      dispatch,
      type: `GEN@${fullyQualified(c)}/MANY`,
      ids: ids.map(parseIntIfActualInt),
    }),
  [DELETE]: c => (...ids) =>
    ({ type: `GEN@${fullyQualified(c)}/DELETE`, ids: ids.map(parseIntIfActualInt) }),
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
      const subresource = config.subresources[key];
      const subActions = genActions(subresource, 2);
      if (subresource.plural) {
        actions[subresource.plural] = subActions;
      } else if (subresource.singular) {
        actions[subresource.singular] = subActions;
      }
    });
  }
  if (config.plural) {
    actions.type = config.plural;
  } else if (config.singular) {
    actions.type = config.singular;
  }
  return actions;
}

export function pluralDefaultState(name) {
  return {
    totalPages: -1,
    totalResults: -1,
    ids: [],
    [name]: {},
  };
}

export function generateDefaultStateFull(config) {
  return config.plural ? pluralDefaultState(config.plural) : {};
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
    if (config.singular) {
      return { ...oldStateMany, ...action.resource };
    }

    const nonNanActionIds = (action.ids || []).filter(i => !isNaN(i));
    const id = nonNanActionIds.length ? nonNanActionIds[action.ids.length - 1] :
      action.resource[config.primaryKey];
    const oldStateOne = oldStateMany[config.plural][id];
    const newStateOne = oldStateOne ? action.resource :
      generateDefaultStateOne(config, action.resource);

    const combinedStateOne = { ...oldStateOne, ...newStateOne, __updatedAt: new Date() };

    if (config.properties && action.dispatch) {
      Object.keys(config.properties).forEach(function (property) {
        const accessor = config.properties[property];

        const stateWithoutPropertyDefined = newStateOne;
        if (typeof stateWithoutPropertyDefined[property] !== 'undefined') {
          Object.defineProperty(combinedStateOne, property, {
            get: () => action.dispatch(accessor(newStateOne)),
          });
        }
      });
    }

    (config.properiesMasks || []).forEach(function (property) {
      delete combinedStateOne[property];
    });

    const newStateMany = {
      ...oldStateMany,
      [config.plural]: {
        ...oldStateMany[config.plural],
        [id]: combinedStateOne,
      },
    };

    return newStateMany;
  }

  static many(config, oldState, action) {
    const { page } = action;

    const newState = page[config.plural].reduce((stateAccumulator, oneObject) =>
      ReducerGenerator.one(config, stateAccumulator, {
        ids: [oneObject[config.primaryKey]],
        resource: oneObject,
        dispatch: action.dispatch,
      }), oldState);

    let ids = Object.values(newState[config.plural]).map((obj) => obj[config.primaryKey]);

    if (config.sortFn) {
      ids = config.sortFn(ids, newState[config.plural]);
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
    const newMany = omit(state[config.plural], id);
    return {
      ...state,
      ids: Object.values(newMany).map(({ id }) => id),
      [config.plural]: newMany,
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
        newState = generateDefaultStateFull(config);
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

    const keys = Object.keys(config.subresources);
    let subkey = null;
    let subconfig = null;
    for (i = 0; i < keys.length; i += 1) {
      subkey = keys[i];
      subconfig = config.subresources[subkey];
      if (subconfig.plural === name || subconfig.singular === name) {
        break;
      }
    }

    if (i === keys.length) {
      return state;
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
    const subTypeMatch = `GEN@${fullyQualified(config)}`;

    switch (action.type) {
      case `GEN@${fullyQualified(config)}/ONE`:
        return ReducerGenerator.one(config, state, action);
      case `GEN@${fullyQualified(config)}/MANY`:
        return ReducerGenerator.many(config, state, action);
      case `GEN@${fullyQualified(config)}/DELETE`:
        return ReducerGenerator.del(config, state, action);
      case `GEN@${fullyQualified(config)}/INVALIDATE`:
        return ReducerGenerator.invalidate(config, state, action);
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
