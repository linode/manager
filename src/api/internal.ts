import _isNaN from 'lodash/isNaN';
import omit from 'lodash/omit';
import actionCreatorGenerator from 'src/api/actionCreatorGenerator';

/**
 * If/when other files were converted to TS these consts could be removed in
 * favor of using the following ENUM.
 */
export const ONE = 'ONE';
export const MANY = 'MANY';
export const PUT = 'PUT';
export const POST = 'POST';
export const DELETE = 'DELETE';

type State = any;

type Action = Object;

type AsyncAction = any;

type Reducer<S, A> = (state: S, action: A) => S;

type ActionCreator = (...args: Array<any>) => Action | AsyncAction

const enum Features {
  ONE = 'ONE',
  MANY = 'MANY',
  PUT = 'PUT',
  POST = 'POST',
  DELETE = 'DELETE'
}

type Feature = Features.DELETE | Features.MANY | Features.ONE | Features.POST | Features.PUT

type List<T> = {
  [index: string]: T
}

interface ReduxConfig {
  name: string;
  supports: Array<Feature>;
  endpoint: Function;
  subresources?: List<ReduxConfig>;
  parent?: ReduxConfig;

}

interface ResourceState {
  totalPages: number;
  totalResults: number;
  ids: Array<number>;
  [index: string]: any;
};

interface Page {
  data: Array<Object>;
  pages: number;
  results: number;
  page: number;
  [index: string]: any;
};

interface Resource {
  name: string,
  parent?: Resource
}

interface IAction extends Action {
  type: string
}

interface OneAction extends IAction {
  resource: Object,
  ids: Array<number | string>
}

interface ManyAction extends IAction {
  page: Object,
  ids: Array<number | string>
}

interface DeleteAction extends IAction {
  ids: Array<number | string>
}

export const createDefaultState = (name: string): ResourceState => ({
  totalPages: -1,
  totalResults: -1,
  ids: [],
  [name]: {},
});

export function isPlural(config: ReduxConfig) {
  return config.supports.indexOf(Features.MANY) > -1;
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

export function addParentRefs({ subresources, ...config }: ReduxConfig, parent: ReduxConfig) {
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
export function fullyQualified(resource: Resource) {
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
 */
export const parseIntIfActualInt = (v: any): any => isNaN(v) ? v : parseInt(v);

export const oneActionCreator = (config: ReduxConfig): ActionCreator =>
  (resource: Resource, ...ids: Array<number | string>): OneAction =>
    ({
      resource,
      type: `GEN@${fullyQualified(config)}/${Features.ONE}`,
      ids: ids.map(parseIntIfActualInt),
    });

export const manyActionCreator = (config: ReduxConfig): ActionCreator =>
  (page: Page, ...ids: Array<number | string>): ManyAction =>
    ({
      page,
      type: `GEN@${fullyQualified(config)}/${Features.MANY}`,
      ids: ids.map(parseIntIfActualInt),
    });

export const deleteActionCreator = (config: ReduxConfig): ActionCreator =>
  (...ids: Array<number | string>): Action =>
    ({
      type: `GEN@${fullyQualified(config)}/${Features.DELETE}`,
      ids: ids.map(parseIntIfActualInt),
    });

/**
* Get an action creator for a feature.
*/
function getActionCreator(feature: Feature) {
  switch (feature) {

    case Features.ONE:
      return oneActionCreator;

    case Features.MANY:
      return manyActionCreator;

    case Features.DELETE:
      return deleteActionCreator;

    default:
      return;
  }
}

interface ReduxActions {
  type: string,
  [index: string]: any,
}

/**
 * Generates action creators for the provided config.
 */
export function genActions(config: ReduxConfig): ReduxActions {
  const { name, supports, subresources } = config;
  let actions: ReduxActions = { type: name };

  actions = supports
    .reduce((result, feature) => {
      const actionCreator = getActionCreator(feature);
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
          [subresource.name]: genActions(subresource),
        };
      }, actions);
  }

  return actions;
}

/**
 *
 * @param {Object} config
 * @returns {Object} Either an object containing the default pagination results,
 * or an empty object.
 */
export function generateDefaultStateFull(
  config: ReduxConfig
): ResourceState | Object {
  return isPlural(config)
    ? createDefaultState(config.name)
    : {};
}

/**
 *
 * @param {Object} subresources
 * @param {Object} one
 * @returns {Object}
 */
export function generateDefaultStateOne(
  subresources: ReduxConfig | Object = {}, 
  one: Object
) {
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

  static del(
    config: ReduxConfig,
    state: State,
    action: OneAction | ManyAction | DeleteAction
  ) {
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
