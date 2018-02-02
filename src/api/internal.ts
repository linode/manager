import _isNaN from 'lodash/isNaN';
import omit from 'lodash/omit';
import isEmpty from 'lodash/isEmpty';

export const ONE = 'ONE';
export const PUT = 'PUT';
export const MANY = 'MANY';
export const POST = 'POST';
export const DELETE = 'DELETE';

export const createDefaultState = (name) => ({
  totalPages: -1,
  totalResults: -1,
  ids: [],
  [name]: {},
});

export function isPlural(config) {
  return config.supports.indexOf(MANY) > -1;
}

/**
 * Given a config object and a parent object, return an object with the parent added
 * to the config. If the config has subresources, iteratively apply the same.
 *
 * @param {Object} config - A config object optionally containing a
 * subresource collection..
 * @param {*} [parent] A parent value to add to the config and any subresources.
 * @returns {Object} The config with parent appended to the config and any subresources.
 */
export function addParentRefs({ subresources, ...config }, parent) {
  const ret = { ...config, subresources, parent };

  if (subresources) {
    let idx = 0;
    const subresourcesPairs = Object.entries(subresources);
    const len = subresourcesPairs.length;

    for (; idx < len; idx++) {
      const [key, config] = subresourcesPairs[idx];
      ret.subresources[key] = addParentRefs(config, ret);
    }
  }

  return Object.freeze(ret);
}

/**
 * Return a string  value of the objects name property, and the name of any parent
 * property object, recursively.
 *
 * @param {Object} resource
 * @returns {String}
 */
export function fullyQualified(resource) {
  let path = resource.name;
  let res = resource;
  while (res.parent) {
    res = res.parent;
    path = `${res.name}.${path}`;
  }
  return path;
}

/**
 *
 * @param {*} v - The value to be tested.
 * @returns {*} - Either the unchanged value or parsed integer.
 */
export const parseIntIfActualInt = (v) => isNaN(v) ? v : parseInt(v);

export const oneActionCreator = (config) => (resource, ...ids) => ({
  resource,
  type: `GEN@${fullyQualified(config)}/ONE`,
  ids: ids.map(parseIntIfActualInt),
});

export const manyActionCreator = (config) => (page, ...ids) => ({
  page,
  type: `GEN@${fullyQualified(config)}/MANY`,
  ids: ids.map(parseIntIfActualInt),
});

export const deleteActionCreator = (config) => (...ids) => ({
  type: `GEN@${fullyQualified(config)}/DELETE`,
  ids: ids.map(parseIntIfActualInt),
});

export const actionCreatorGenerators = {
  [ONE]: oneActionCreator,
  [MANY]: manyActionCreator,
  [DELETE]: deleteActionCreator,
};

/**
 *
 * @param {SUPPORTS[]} supports
 * @param {ConfigObject} config
 * @param {ActionsObject} actions
 */
export function setFeatureActionCreators(supports, config, actions) {
  let idx = 0;
  const len = supports.length;

  for (; idx < len; idx++) {
    const feature = supports[idx];
    const name = feature.toLowerCase();
    const actionCreator = actionCreatorGenerators[feature];

    if (actionCreator) {
      // eslint-disable-next-line no-param-reassign
      actions[name] = actionCreator(config);
    }
  }

  return actions;
}

/**
 * Generate actions for a given list of configs.
 *
 * @param {List<Config>} list ConfigObject
 * @param {ActionObject} actions ActionsObject
 * @returns {ActionsObject} ActionsObject
 */
export function genActionsForConfig(list, actions) {
  if (isEmpty(list)) {
    return actions;
  }

  const configs = Object.values(list);
  let idx = 0;
  const len = configs.length;

  for (; idx < len; idx++) {
    const config = configs[idx];
    // eslint-disable-next-line no-param-reassign, no-use-before-define
    actions[config.name] = genActions(config);
  }

  return actions;
}


/**
 * Generate an action object for a given config.
 *
 * @param {ConfigObject}
 * @returns {ActionsObject}
 */
export function genActions(config) {
  const { name, supports, subresources } = config;
  let actions = { type: name };

  actions = setFeatureActionCreators(supports, config, actions);

  actions = genActionsForConfig(subresources, actions);

  return actions;
}

/**
 *
 * @param {ConfigObject} config
 * @returns {Object} Either an object containing the default pagination results,
 * or an empty object.
 */
export function generateDefaultStateFull(config) {
  return isPlural(config)
    ? createDefaultState(config.name)
    : {};
}

/**
 *
 * @param {List<Config>} subresources
 * @param {Object} one
 * @returns {Object}
 */
export function generateDefaultStateOne(subresources = {}, one) {
  const result = Object
    .entries(subresources)
    .reduce((result, [key, config]) => ({
      ...result,
      [key]: { ...generateDefaultStateFull(config) },
    }), {});

  return { ...one, ...result };
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
      generateDefaultStateOne(config.subresources, action.resource);

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
