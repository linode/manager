import _ from 'lodash';

function makeDefaultState(config) {
  return {
    pagesFetched: [],
    totalPages: -1,
    [config.plural]: {},
    singular: config.singular,
    plural: config.plural,
    filter: null,
  };
}

/**
 * Adds subresource metadata to the given item, plus polling state.
 */
function transformItem(subresources, item) {
  const subs = _.reduce(subresources, (acc, config, key) => (
      { ...acc, [key]: { ...makeDefaultState(config) } }), { });
  return { ...item, _polling: false, ...subs };
}

/**
 * Creates a reducer function for the specified API list endpoint. See
 * https://developers.linode.com/reference/#lists-and-objects for details on
 * such API endpoints. This will return a reducer function that handles one or
 * more actions containing resource(s) to update.
 * @param {Object} config - A configuration object for the reducer.
 * @param {string} config.plural - The plural form of this resource (i.e.
 * "linodes")
 * @param {string} config.singular - The singular form of this resource (i.e.
 * "linode")
 * @param {Object} config.actions - A list of action names for the reducer to
 * use
 * @param {string} config.actions.updateItem - The action to use for
 * updating a single item
 * @param {string} config.actions.updateItems - The action to use for updating
 * several items
 * @param {string} config.actions.deleteItem - The action to use for deleting a
 * single item
 * @param {Object} config.subresources - An object of subresource configs (i.e.
 * disks on a linode) keyed by their name in the state
 * @param {Function} transform - A function that is passed a resource and
 * returns a new version of that resource, which is persisted to the store
 */
export default function makeApiList(config, transform = d => d) {
  const actions = {
    updateItem: -1,
    updateItems: -1,
    deleteItem: -1,
    ...config.actions,
  };

  function updateMany(_config, state, action) {
    const { response } = action;
    return {
      ...state,
      pagesFetched: [
        ...state.pagesFetched.filter(p => p !== response.page),
        response.page,
      ],
      totalPages: response.total_pages,
      [_config.plural]: {
        ...state[_config.plural],
        ...response[_config.plural].reduce((s, i) =>
          ({ ...s, [i.id]: transform(
             transformItem(_config.subresources, i)) }), { }),
      },
    };
  }

  function updateItem(_config, state, action) {
    let item = action[_config.singular];
    if (!state[_config.plural][item.id]) {
      item = transform(transformItem(_config.subresources, item));
    }
    return {
      ...state,
      [_config.plural]: {
        ...state[_config.plural],
        [item.id]: {
          ...state[_config.plural][item.id],
          ...item,
        },
      },
    };
  }

  function deleteOne(_config, state, action) {
    const { id } = action;
    return {
      ...state,
      [_config.plural]: _.omit(state[_config.plural], id),
    };
  }

  function invalidate(_config, state) {
    return { ...state, [_config.plural]: { }, totalPages: -1, pagesFetched: [] };
  }

  function handleSetFilter(_config, state, action) {
    const { filter } = action;
    return { ...state, filter };
  }

  function passToSubresource(_config, state, action) {
    for (let i = 0; i < Object.keys(_config.subresources).length; i++) {
      const key = Object.keys(_config.subresources)[i];
      const subresource = _config.subresources[key];
      if (_.includes(subresource.actions, action.type)) {
        const id = action[_config.plural];
        const parentItem = state[_config.plural][id];
        const childState = parentItem[key];
        // eslint-disable-next-line no-use-before-define
        const newState = handleAction(subresource, childState, action);
        return {
          ...state,
          [_config.plural]: {
            ...state[_config.plural],
            [parentItem.id]: {
              ...state[_config.plural][parentItem.id],
              [key]: newState,
            },
          },
        };
      }
    }
    return state;
  }

  function handleAction(_config, state, action) {
    switch (action.type) {
      case _config.actions.updateItems:
        return updateMany(_config, state, action);
      case _config.actions.updateItem:
        return updateItem(_config, state, action);
      case _config.actions.deleteItem:
        return deleteOne(_config, state, action);
      case `@@${_config.plural}/INVALIDATE_CACHE`:
        return invalidate(_config, state, action);
      case `@@${_config.plural}/SET_FILTER`:
        return handleSetFilter(_config, state, action);
      default:
        if (_config.subresources) {
          return passToSubresource(_config, state, action);
        }
        return state;
    }
  }

  const mergedConfig = { ...config, actions };
  const defaultState = makeDefaultState(mergedConfig);
  return (state = defaultState, action) =>
    handleAction(mergedConfig, state, action);
}

/**
 * Returns a cache invalidation action for the specified resource.
 */
export function invalidateCache(plural) {
  return { type: `@@${plural}/INVALIDATE_CACHE` };
}

/**
 * Returns a set filter action for the specified resource.
 */
export function setFilter(plural, filter = null) {
  return { type: `@@${plural}/SET_FILTER`, filter };
}

import { fetch } from './fetch';

/**
 * As the name might imply, this function refines the state. It also is nice
 * enough to reduce the config for you as well. Basically it takes your config
 * and your state and, given a list of subresources and ids, refines the
 * config/state to the config/state of the specified subresource.
 * @param {Object} state - getState().api
 * @param {Object} config - the config of the top level resource
 * @param {string[]} subresources - a list of subresource names to drill down
 * into. Note that this is the name of the subresource in the config, not the
 * server's name. For example, the subresource config for Linodes is { _backups:
 * { ... } }, so you'd pass '_backups' in for that.
 * @param {string{}} ids - a list of IDs to drill down with. This starts with
 * the top level ID and continues for all but the deepest subresource.
 */
function refineState(state, config, subresources, ids) {
  let refinedState = state[config.plural];
  let refinedConfig = config;
  let path = `/${config.plural}`;
  const plurals = [[config.plural]];
  for (let i = 0; i < subresources.length; i++) {
    const newConfig = refinedConfig.subresources[subresources[i]];
    refinedState = refinedState[refinedConfig.plural][ids[i]][subresources[i]];
    refinedConfig = newConfig;
    path += `/${ids[i]}/${refinedConfig.plural}`;
    plurals[plurals.length - 1].push(ids[i]);
    plurals.push([refinedConfig.plural]);
  }
  return { state: refinedState, config: refinedConfig, path, plurals };
}

/**
 * Returns an action creator that fetches a page of resources when invoked and
 * dispatched. The action creator returns a thunk, and is invoked with a page
 * index and a list of IDs of parent resources.
 * @param {Object} _config - the top-level resource configuration
 * @param {string[]} subresources - a list of subresource names. The returned
 * function will fetch pages of the bottom-most resource included in this list.
 * Do not include the top-level resource. Use the name of the subresource as
 * provided in the configuration, not the plural name given by the server.
 */
export function makeFetchPage(_config, ...subresources) {
  function fetchPage(page = 0, ...ids) {
    return async (dispatch, getState) => {
      const { token } = getState().authentication;
      const { state, config, path, plurals } = refineState(
        getState().api, _config, subresources, ids);
      if (state.totalPages !== -1 &&
          state.pagesFetched.indexOf(page + 1) !== -1) {
        return;
      }
      const { filter } = state;
      const options = filter ? {
        headers: { 'X-Filter': JSON.stringify(filter) },
      } : {};
      const response = await fetch(token, `${path}?page=${page + 1}`, options);
      const json = await response.json();
      if (state.totalPages !== -1 && state.totalPages !== json.totalPages) {
        dispatch(invalidateCache(config.plural));
        for (let i = 0; i < state.pagesFetched.length; ++i) {
          if (state.pagesFetched[i] - 1 !== page) {
            await dispatch(fetchPage(state.pagesFetched[i] - 1, ...ids));
          }
        }
      }
      dispatch({
        type: config.actions.updateItems,
        response: json,
        ...plurals.reduce((a, [plural, id]) =>
          id ? { ...a, [plural]: id } : a, {}),
      });
      return json;
    };
  }
  return fetchPage;
}

/**
 * Given a resource config and a function returned from makeFetchPage, this
 * returns a function that will fetch all pages for the given resource.
 * @param {Object} _config - the top level resource configuration
 * @param {Function} fetchPage - a function returned by makeFetchPage for this
 * resource
 * @param {string[]} subresources - a list of subresource names. The returned
 * function will fetch pages of the bottom-most resource included in this list.
 * Do not include the top-level resource. Use the name of the subresource as
 * provided in the configuration, not the plural name given by the server.
 */
export function makeFetchAll(_config, fetchPage, ...subresources) {
  return (...ids) => async (dispatch, getState) => {
    let { state } = refineState(getState().api, _config, subresources, ids);
    if (state.totalPages === -1) {
      await dispatch(fetchPage(0, ...ids));
      state = refineState(getState().api, _config, subresources, ids).state;
    }

    for (let i = 1; i < state.totalPages; i++) {
      if (state.pagesFetched.indexOf(i + 1) === -1) {
        await dispatch(fetchPage(i, ...ids));
      }
    }
  };
}

/**
 * Returns an action creator that fetches a single resource when dispatched.
 * The action creator returns a thunk, and is invoked with a page index and a
 * list of IDs, starting with the topmost and continuing down any subresources.
 * @param {string} config - the top level resource configuration
 * @param {string[]} subresources - a list of subresource names. The returned
 * function will fetch items of the bottom-most resource included in this list.
 * Do not include the top-level resource. Use the name of the subresource as
 * provided in the configuration, not the plural name given by the server.
 */
export function makeFetchItem(_config, ...subresources) {
  return (...ids) => async (dispatch, getState) => {
    const { token } = getState().authentication;
    const refined = refineState(getState().api, _config, subresources, ids);

    const { config, plurals } = refined;
    let { path } = refined;

    const id = ids[ids.length - 1];
    plurals[plurals.length - 1].push(id);
    path += `/${id}`;

    const response = await fetch(token, path);
    const json = await response.json();

    dispatch({
      type: config.actions.updateItem,
      [config.singular]: json,
      ...plurals.reduce((u, [plural, id]) =>
        (id ? { ...u, [plural]: id } : u), { }),
    });

    return json;
  };
}

/*
 * Returns an action creator that fetches a single resource until it passes a
 * test. The action creator returns a thunk, and is invoked with the ID, a test
 * function, and a timeout between requests (which defaults to 3000).
 * @param {Object} config - the top level config for this resource
 */
export function makeFetchUntil(config) {
  // TODO: Support subresources here
  return (id, test, timeout = 3000) => async (dispatch, getState) => {
    const { token } = getState().authentication;
    const item = getState().api[config.plural][config.plural][id];
    if (item._polling) {
      return;
    }
    dispatch({
      type: config.actions.updateItem,
      [config.singular]: { id, _polling: true },
    });
    for (;;) {
      const response = await fetch(token, `/${config.plural}/${id}`);
      const json = await response.json();
      dispatch({
        type: config.actions.updateItem,
        [config.singular]: json,
      });
      if (test(json)) break;

      await new Promise(r => setTimeout(r, timeout));
    }
    dispatch({
      type: config.actions.updateItem,
      [config.singular]: { id, _polling: false },
    });
  };
}

/**
 * Returns an action creator that deletes a single resource. The action
 * creator returns a thunk, and is invoked with the ID.
 * @param {Object} config - the top level config for this resource
 */
export function makeDeleteItem(config) {
  return id => async (dispatch, getState) => {
    const state = getState();
    const { token } = state.authentication;
    dispatch({ type: config.actions.deleteItem, id });
    const response = await fetch(token,
      `/${config.plural}/${id}`, { method: 'DELETE' });
    await response.json();
    // Note: do we want to do anything at this point?
  };
}

/**
 * Returns an action creator that puts a single resource to the API. The action
 * creator returns a thunk, and is invoked with { id, data }.
 * @param {string} config - the top level config for this resource
 */
export function makePutItem(config) {
  return ({ id, data }) => async (dispatch, getState) => {
    const state = getState();
    const { token } = state.authentication;
    dispatch({ type: config.actions.updateItem, id, data });
    const response = await fetch(token, `/${config.plural}/${id}`, {
      method: 'PUT', body: JSON.stringify(data),
    });
    await response.json();
  };
}

/**
 * Returns an action creator that creates a single resource with the API. The
 * action creator returns a thunk, and is invoked with the POST data to submit.
 * @param {string} config - the top level config for this resource
 */
export function makeCreateItem(config) {
  return data => async (dispatch, getState) => {
    const state = getState();
    const { token } = state.authentication;
    const response = await fetch(token, `/${config.plural}`, {
      method: 'POST', body: JSON.stringify(data),
    });
    const json = await response.json();
    dispatch({
      type: config.actions.updateItem,
      [config.singular]: json,
    });
    return json;
  };
}
