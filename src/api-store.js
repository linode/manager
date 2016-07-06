import _ from 'lodash';

function makeDefaultState(config) {
  return {
    pagesFetched: [],
    totalPages: -1,
    [config.plural]: {},
    singular: config.singular,
    plural: config.plural,
  };
}

function transformItem(subresources, item) {
  const subs = _.reduce(subresources, (acc, config, key) => (
      { ...acc, [key]: { ...makeDefaultState(config) } }), { });
  return { ...item, _polling: false, ...subs };
}

/*
 * plural: the name of several of the resource (i.e. "linodes")
 *
 * singular: the name of one of the resource (i.e. "linode")
 *
 * actions: {
 *  update_singular,
 *  update_many,
 *  delete_one
 * }
 *
 * Leave any action NULL and it'll be unsupported
 *
 * transform: a function each object will be run through to add custom
 * properties and what-not
 */
export default function makeApiList(config, transform = d => d) {
  const actions = {
    update_singular: -1,
    update_many: -1,
    delete_one: -1,
    ...config.actions,
  };

  function handleAction(_config, state, action) {
    switch (action.type) {
      case _config.actions.update_many: {
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
      case _config.actions.update_singular: {
        const item = action[_config.singular];
        return {
          ...state,
          [_config.plural]: {
            ...state[_config.plural],
            [item.id]: { ...state[_config.plural][item.id], ...item },
          },
        };
      }
      case _config.actions.delete_one: {
        const { id } = action;
        return {
          ...state,
          [_config.plural]: _.omit(state[_config.plural], id),
        };
      }
      default:
        if (_config.subresources) {
          for (let i = 0; i < Object.keys(_config.subresources).length; i++) {
            const key = Object.keys(_config.subresources)[i];
            const subresource = _config.subresources[key];
            if (_.includes(subresource.actions, action.type)) {
              const id = action[_config.singular];
              const parentItem = state[_config.plural][id];
              const childState = parentItem[key];
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

export function makeFetchPage(action, plural) {
  return (page = 0) => async (dispatch, getState) => {
    const { token } = getState().authentication;
    const response = await fetch(token, `/${plural}?page=${page + 1}`);
    const json = await response.json();
    dispatch({ type: action, response: json });
  };
}

export function makeUpdateItem(action, plural, singular) {
  return id => async (dispatch, getState) => {
    const { token } = getState().authentication;
    const response = await fetch(token, `/${plural}/${id}`);
    const json = await response.json();
    dispatch({ type: action, [singular]: json });
  };
}

export function makeUpdateUntil(action, plural, singular) {
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
