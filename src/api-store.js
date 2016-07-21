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
 * @param {string} config.actions.update_singular - The action to use for
 * updating a single item
 * @param {string} config.actions.update_many - The action to use for updating
 * several items
 * @param {string} config.actions.delete_one - The action to use for deleting a
 * single item
 * @param {Object} config.subresources - An object of subresource configs (i.e.
 * disks on a linode) keyed by their name in the state
 * @param {Function} transform - A function that is passed a resource and
 * returns a new version of that resource, which is persisted to the store
 */
export default function makeApiList(config, transform = d => d) {
  const actions = {
    update_singular: -1,
    update_many: -1,
    delete_one: -1,
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

  function updateSingular(_config, state, action) {
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

  function setFilter(_config, state, action) {
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
      case _config.actions.update_many:
        return updateMany(_config, state, action);
      case _config.actions.update_singular:
        return updateSingular(_config, state, action);
      case _config.actions.delete_one:
        return deleteOne(_config, state, action);
      case `@@${_config.plural}/INVALIDATE_CACHE`:
        return invalidate(_config, state, action);
      case `@@${_config.plural}/SET_FILTER`:
        return setFilter(_config, state, action);
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

import { fetch } from './fetch';

/**
 * Returns an action creator that fetches a page of resources when invoked and
 * dispatched. The action creator returns a thunk, and is invoked with a page
 * index and a list of IDs of parent resources.
 * @param {string} action - The name of the action to use when dispatching the
 * results
 * @param {string...} plurals - The plural form of the resources involved,
 * starting with the topmost and continuing with any subresources.
 */
export function makeFetchPage(action, ...plurals) {
  return (page = 0, ...ids) => async (dispatch, getState) => {
    const pairs = _.zip(plurals, ids);
    const { token } = getState().authentication;
    const url = _.reduce(pairs, (u, [plural, id]) => `${u}/${plural}/${id || ''}`, '');
    const response = await fetch(token, `${url}?page=${page + 1}`);
    const json = await response.json();
    dispatch(_.reduce(pairs, (u, [plural, id]) => (id ? { ...u, [plural]: id } : u),
      { type: action, response: json }));
  };
}

/**
 * Returns an action creator that fetches a single resource when dispatched.
 * The action creator returns a thunk, and is invoked with a page index and a
 * list of IDs, starting with the topmost and continuing down any subresources.
 * @param {string} action - The name of the action to use when dispatching the
 * results
 * @param {string} singular - The singular form of the resource being fetched
 * @param {string...} plurals - The plural form of the resources involved,
 * starting with the topmost and continuing with any subresources.
 */
export function makeFetchItem(action, singular, ...plurals) {
  return (...ids) => async (dispatch, getState) => {
    const pairs = _.zip(plurals, ids);
    const { token } = getState().authentication;
    const url = _.reduce(pairs, (u, [plural, id]) => `${u}/${plural}/${id}`, '');
    const response = await fetch(token, url);
    const json = await response.json();
    dispatch(_.reduce(pairs, (u, [plural, id]) => (id ? { ...u, [plural]: id } : u),
      { type: action, [singular]: json }));
    return json;
  };
}

/*
 * Returns an action creator that fetches a single resource until it passes a
 * test. The action creator returns a thunk, and is invoked with the ID, a test
 * function, and a timeout between requests (which defaults to 3000).
 * @param {string} action - The name of the action to use when dispatching the
 * results
 * @param {string} plural - The plural form of the resource being fetched
 * @param {string} singular - The singular form of the resource being fetched
 */
export function makeFetchUntil(action, plural, singular) {
  // TODO: Support subresources here
  return (id, test, timeout = 3000) => async (dispatch, getState) => {
    const { token } = getState().authentication;
    const item = getState().api[plural][plural][id];
    if (item._polling) {
      return;
    }
    dispatch({ type: action, [singular]: { id, _polling: true } });
    for (;;) {
      const response = await fetch(token, `/${plural}/${id}`);
      const json = await response.json();
      dispatch({ type: action, [singular]: json });
      if (test(json)) break;

      await new Promise(r => setTimeout(r, timeout));
    }
    dispatch({ type: action, [singular]: { id, _polling: false } });
  };
}

/**
 * Returns an action creator that deletes a single resource. The action
 * creator returns a thunk, and is invoked with the ID.
 * @param {string} action - The name of the action to use when dispatching the
 * results
 * @param {string} plural - The plural form of the resource being deleted
 */
export function makeDeleteItem(action, plural) {
  return id => async (dispatch, getState) => {
    const state = getState();
    const { token } = state.authentication;
    dispatch({ type: action, id });
    const response = await fetch(token, `/${plural}/${id}`, { method: 'DELETE' });
    await response.json();
    // Note: do we want to do anything at this point?
  };
}

/**
 * Returns an action creator that puts a single resource to the API. The action
 * creator returns a thunk, and is invoked with { id, data }.
 * @param {string} action - The name of the action to use when dispatching the
 * results
 * @param {string} plural - The plural form of the resource being updated
 */
export function makePutItem(action, plural) {
  return ({ id, data }) => async (dispatch, getState) => {
    const state = getState();
    const { token } = state.authentication;
    dispatch({ type: action, id, data });
    const response = await fetch(token, `/${plural}/${id}`, {
      method: 'PUT', body: JSON.stringify(data),
    });
    await response.json();
  };
}

/**
 * Returns an action creator that creates a single resource with the API. The
 * action creator returns a thunk, and is invoked with the POST data to submit.
 * @param {string} action - The name of the action to use when dispatching the
 * new resource
 * @param {string} plural - The plural form of the resource being created
 * @param {string} singular - The singular form of the resource being created
 */
export function makeCreateItem(action, plural, singular) {
  return data => async (dispatch, getState) => {
    const state = getState();
    const { token } = state.authentication;
    const response = await fetch(token, `/${plural}`, {
      method: 'POST', body: JSON.stringify(data),
    });
    const json = await response.json();
    dispatch({ type: action, [singular]: json });
    return json;
  };
}

/**
 * Returns a cache invalidation action for the specified resource.
 */
export function invalidateCache(plural) {
  return { type: `@@${plural}/INVALIDATE_CACHE` };
}
