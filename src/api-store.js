import _ from 'underscore';

function transformItem(item) {
  return {
    ...item,
    _polling: false,
  };
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
export default function makeApiList(plural, singular,
    _actions, transform = d => d) {
  const defaultState = {
    pagesFetched: [],
    totalPages: -1,
    [plural]: {},
    _singular: singular,
    _plural: plural,
  };

  const actions = {
    update_singular: -1,
    update_many: -1,
    delete_one: -1,
    ..._actions,
  };

  return (state = defaultState, action) => {
    switch (action.type) {
      case actions.update_many: {
        const { response } = action;
        return {
          ...state,
          pagesFetched: [
            ...state.pagesFetched.filter(p => p !== response.page),
            response.page,
          ],
          totalPages: response.total_pages,
          [plural]: {
            ...state[plural],
            ...response[plural].reduce((s, i) =>
            ({ ...s, [i.id]: transform(transformItem(i)) }), { }),
          },
        };
      }
      case actions.update_singular: {
        const item = action[singular];
        return {
          ...state,
          [plural]: {
            ...state[plural],
            [item.id]: { ...state[plural][item.id], ...item },
          },
        };
      }
      case actions.delete_one: {
        const { id } = action;
        return {
          ...state,
          [plural]: _.omit(state[plural], id),
        };
      }
      default:
        return state;
    }
  };
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
