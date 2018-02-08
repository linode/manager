
import '~/typedefs';

import _isNaN from 'lodash/isNaN';
import omit from 'lodash/omit';

import { RESULTS_PER_PAGE } from '~/constants';

export const ONE = 'ONE';
export const PUT = 'PUT';
export const MANY = 'MANY';
export const POST = 'POST';
export const DELETE = 'DELETE';

export const createDefaultState = (name) => ({
  totalPages: -1,
  totalResults: -1,
  ids: [],
  /**
   * TODO: Populate one or more pageIDsBy_ arrays dynamically based on page request parameters
   * given to us through the action. (specifically X-Filter parameters)
   */
  pageIDsBy_id: [],
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
    ret.subresources = Object
      .entries(subresources)
      .reduce((acc, [key, config]) => ({
        ...acc, [key]: addParentRefs(config, ret),
      }), {});
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
 * Generates action creators for the provided config.
 */
export function genActions(config) {
  const { name, supports, subresources } = config;
  let actions = {};

  actions = supports
    .reduce((result, feature) => {
      const actionCreator = actionCreatorGenerators[feature];
      const name = feature.toLowerCase();

      return (actionCreator)
        ? { ...result, [name]: actionCreator(config) }
        : result;
    }, actions);

  if (subresources) {
    actions = Object
      .entries(subresources)
      .reduce((actions, [, subresource]) => {
        return {
          ...actions,
          [subresource.name]: genActions(subresource, 2),
        };
      }, actions);
  }

  actions.type = name;

  return actions;
}

/**
 *
 * @param {Object} config
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
 * @param {Object.<string, ReduxConfig>} subresources
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
  /**
   * @param {ReduxConfig} config
   * @param {State} prevState
   * @param {OneAction} action
   * @param {Date} [updatedAt]
   * @returns {State}
   */
  static one(config, prevState, action, updatedAt = new Date()) {
    if (!isPlural(config)) {
      return { ...prevState, ...action.resource };
    }

    const { name, primaryKey, subresources } = config;

    const nonNanActionIds = (action.ids || []).filter(i => !_isNaN(i));

    const id = nonNanActionIds.length
      ? nonNanActionIds[action.ids.length - 1]
      : action.resource[primaryKey];

    const oldStateOne = prevState[name][id];

    const newStateOne = oldStateOne
      ? action.resource
      : generateDefaultStateOne(subresources, action.resource);

    return {
      ...prevState,
      [name]: {
        ...prevState[name],
        [id]: {
          ...oldStateOne,
          ...newStateOne,
          __updatedAt: updatedAt,
        },
      },
    };
  }

  /**
   * Create a new array of size totalResults filled with nulls.
   * Fill it with oldIDs in their existing location.
   * Then fill it with newPageIDs at the appropriate location by using pageNum
   *
   * @param {number[]} oldIDs An array of all existing IDs
   * @param {number[]} newPageIDs An array of IDs for the items in the newly fetched page
   * @param {number} pageNum The page at which newPageIDs should reside
   * @param {number} totalResults The new number of total IDs that should exist in the array
   */
  static coalesceIDs(oldIDs, newPageIDs, pageNum, totalResults) {
    const newIDs = Array.from({ length: totalResults }, () => null);
    for (let i = 0, len = oldIDs.length; i < len; ++i) {
      newIDs[i] = oldIDs[i];
    }
    const start = (pageNum - 1) * RESULTS_PER_PAGE;
    const end = start + newPageIDs.length;
    for (let i = start; i < end; ++i) {
      newIDs[i] = newPageIDs[i - start];
    }
    return newIDs;
  }

  /**
  * @param {ReduxConfig} config
  * @param {State} prevState
  * @param {ManyAction} action
  * @param {Date} [updatedAt]
  * @returns {State}
  */
  static many(config, prevState, action, updatedAt = new Date()) {
    const { page, dispatch } = action;

    const newState = page[config.name].reduce((stateAccumulator, oneObject) =>
      ReducerGenerator.one(config, stateAccumulator, {
        ids: [oneObject[config.primaryKey]],
        resource: oneObject,
        dispatch,
      }, updatedAt), prevState);

    /* Add to the Array of all IDs */
    let newIDs = Object.values(newState[config.name]).map((obj) => obj[config.primaryKey]);
    if (config.sortFn) {
      newIDs = config.sortFn(newIDs, newState[config.name]);
    }

    /* Add to the Array of IDs for each sort order */
    let newPageIDs = prevState.pageIDsBy_id;
    if (page.data) { // don't populate this array for ad-hoc actions that don't include .data
      const thisPageIds = page.data.map((obj) => obj[config.primaryKey]);
      newPageIDs = this.coalesceIDs(
        prevState.pageIDsBy_id, thisPageIds, page.page, page.results);
    }

    return {
      ...newState,
      ids: newIDs,
      pageIDsBy_id: newPageIDs,
      totalPages: page.pages,
      totalResults: page.results,
    };
  }

  /**
   *
   * @param {ReduxConfig} config
   * @param {State} prevState
   * @param {DeleteAction} action
   * @returns {State}
   */
  static del(config, prevState, action) {
    const id = action.ids[action.ids.length - 1];
    const newMany = omit(prevState[config.name], id);
    return {
      ...prevState,
      ids: Object.values(newMany).map(({ id }) => id),
      [config.name]: newMany,
    };
  }

  /**
   *
   * @param {ReduxConfig} config
   * @param {State} prevState
   * @param {DeleteAction} action
   * @returns {State}
   */
  static subresource(config, state, action) {
    /**
     * Everything between the first '@' and the first '/'.
     * @type {string}
     * @example
     *  GEN@something.whatever/MANY -> something.whatever
    */
    let path = action.type.substr(action.type.indexOf('@') + 1);
    path = path.substr(0, path.indexOf('/'));

    /**
     * @type {Array<string>} - The path split by `.`.
    */
    const names = path.split('.');
    const { ids } = action;

    /** @type {string|undefined} */
    let name = null;
    let i;
    for (i = 0; i < names.length; i += 1) {
      if (names[i] === config.name) {
        name = names[i + 1];
        break;
      }
    }

    if (!name) return state;

    /** @type {Array<ReduxConfig>} */
    const keys = Object.keys(config.subresources);

    /** @type {string} */
    let subkey = null;

    /** @type {ReduxConfig|undefined} */
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

    /**
     * The subaction has an IDs of tail(IDs).
     *
     * @type {OneAction}
     */
    const subaction = { ...action, ids: ids.splice(1) };

    /** @type {Resource} */
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
