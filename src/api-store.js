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
    actions, transform = d => d) {

  const default_state = {
    pagesFetched: [],
    totalPages: -1,
    [plural]: {},
    _singular: singular,
    _plural: plural,
  };

  actions = {
    update_singular: -1,
    update_many: -1,
    delete_one: -1,
    ...actions,
  };

  return (state = default_state, action) => {
    switch (action.type) {
      case actions.update_many:
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
      case actions.update_singular:
        const item = action[singular];
        return {
          ...state,
          [plural]: {
            ...state[plural],
            [item.id]: { ...state[plural][item.id], ...item },
          },
        };
      case actions.delete_one:
        const { id } = action;
        return {
          ...state,
          [plural]: _.omit(state[plural], id),
        };
      default:
        return state;
    }
  };
}

import { fetch } from './fetch';

export function makeFetchPage(action, plural) {
  return (page = 0) => {
    return async (dispatch, getState) => {
      const { token } = getState().authentication;
      const response = await fetch(token, `/${plural}?page=${page + 1}`);
      const json = await response.json();
      dispatch({ type: action, response: json });
    };
  };
}

export function make_update_item(action, plural, singular) {
  return (id) => {
    return async (dispatch, getState) => {
      const { token } = getState().authentication;
      const response = await fetch(token, `/${plural}/${id}`);
      const json = await response.json();
      dispatch({ type: action, [singular]: json });
    };
  };
}

export function make_update_until(action, plural, singular) {
  return (id, test, timeout = 3000) => {
    return async (dispatch, getState) => {
      const { token } = getState().authentication;
      const item = getState().api[plural][plural][id];
      if (item._polling) {
        return;
      }
      dispatch({ type: action, [singular]: { id, _polling: true } });
      while (true) {
        const response = await fetch(token, `/${plural}/${id}`);
        const json = await response.json();
        dispatch({ type: action, [singular]: json });
        if (test(json)) break;

        await new Promise(r => setTimeout(r, timeout));
      }
      dispatch({ type: action, [singular]: { id, _polling: false } });
    };
  };
}

export function make_delete_item(action, plural) {
  return (id) => {
    return async (dispatch, getState) => {
      const state = getState();
      const { token } = state.authentication;
      dispatch({ type: action, id });
      const response = await fetch(token, `/${plural}/${id}`, { method: 'DELETE' });
      const json = await response.json();
      // Note: do we want to do anything at this point?
    };
  };
}
