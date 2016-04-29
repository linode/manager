import _ from 'underscore';

/*
 * multiple: the name of several of the resource (i.e. "linodes")
 *
 * single: the name of one of the resource (i.e. "linode")
 *
 * actions: {
 *  update_single,
 *  update_many,
 *  delete_one
 * }
 *
 * Leave any action NULL and it'll be unsupported
 *
 * transform: a function each object will be run through to add custom
 * properties and what-not
 */
export default function make_api_list(multiple, single,
    actions, transform=d => d) {

  const default_state = {
    pagesFetched: [ ],
    totalPages: -1,
    [multiple]: {}
  };

  actions = {
      update_single: -1,
      update_many: -1,
      delete_one: -1,
      ...actions
  };

  return (state=default_state, action) => {
    switch (action.type) {
    case actions.update_many:
      const { response } = action;
      return {
        ...state,
        pagesFetched: [
          ...state.pagesFetched.filter(p => p !== response.page),
          response.page
        ],
        totalPages: response.total_pages,
        [multiple]: {
          ...state[multiple],
          ...response[multiple].reduce((s, i) =>
            ({ ...s, [i.id]: transform(i) }), { })
        }
      };
    case actions.update_single:
      const item = action[single];
      return {
        ...state,
        [multiple]: {
          ...state[multiple],
          [item.id]: { ...state[multiple][item.id], ...item }
        }
      };
    case actions.delete_one:
      const { id } = action;
      return {
        ...state,
        [multiple]: _.omit(state[multiple], id)
      };
    default:
      return state;
    }
  };
}
