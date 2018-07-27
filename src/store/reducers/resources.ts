import { assocPath, compose, ifElse, merge, path, when } from 'ramda';
import { Action } from 'redux';

export const REQUEST = '@@manager/resources/REQUEST';
export const RESPONSE = '@@manager/resources/RESPONSE';

interface RequestAction {
  type: typeof REQUEST;
  meta: { path: string[] };
}

interface ResponseAction {
  type: typeof RESPONSE;
  meta: { path: string[] };
  payload: any;
  error: boolean;
}

type Actions = RequestAction | ResponseAction;

export function oneOfType(action: { type: string }, list: string[]): action is Actions {
  let i = 0;
  const len = list.length;
  const type = action.type;

  while (i < len) {
    if (type === list[i]) {
      return true;
    }
    i += 1;
  }
  return false;
}

export const defaultState: Linode.ResourcesState = {
  regions: { loading: false, data: [], },
  types: { loading: false, data: { data: [], results: 0, pages: 1, page: 0 }, },
  kernels: { loading: false, data: [], },
  profile: {
    loading: false, data: {
      uid: 1,
      username: '',
      email: '',
      timezone: '',
      email_notifications: false,
      referrals: {
        code: '',
        url: '',
        total: 0,
        completed: 0,
        pending: 0,
        credit: 0,
      },
      ip_whitelist_enabled: false,
      lish_auth_method: 'password_keys',
      authorized_keys: [],
      two_factor_auth: false,
      restricted: false,
    },
  }
}

export default (
  state: Linode.ResourcesState = defaultState,
  action: Actions | Action,
): Linode.ResourcesState => when(
  () => oneOfType(action, [REQUEST, RESPONSE]),
  (state) => {
    const _path = (action as Actions).meta.path;
    const setLoading = assocPath([..._path, 'loading']);
    const setData = assocPath([..._path, 'data']);
    const setError = assocPath([..._path, 'error']);

    return compose(
      ifElse(
        () => action.type === REQUEST,
        setLoading(true),
        setLoading(false),
      ),

      when(
        () => action.type === RESPONSE,
        compose(
          setData(merge(
            path([..._path, 'data'], state),
            (action as ResponseAction).payload, 
          )),
          when(() => (action as ResponseAction).error, setError(true)),
        ),
      ),
    )(state);
  },
)(state);

export const request = (path: string[]): RequestAction => ({
  type: REQUEST,
  meta: { path },
});

export const response = (path: string[], payload: any): ResponseAction => ({
  type: RESPONSE,
  meta: { path },
  payload,
  error: payload instanceof Error,
});
