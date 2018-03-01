const REQUEST = '@@manager/resources/REQUEST';
const SUCCESS = '@@manager/resources/SUCCESS';
const FAILURE = '@@manager/resources/FAILURE';

interface RequestAction {
  type: typeof REQUEST;
  meta: { path: string[] };
}

interface SuccessAction {
  type: typeof SUCCESS;
  meta: { path: string[] };
  payload: any;
}

interface FailureAction {
  type: typeof FAILURE;
  meta: { path: string[] };
  error: Error;
}

type Actions = RequestAction | SuccessAction | FailureAction;

import { compose, ifElse, assocPath, when } from 'ramda';

function oneOfType(action: Actions, list: string[]): boolean {
  return list.reduce(
    (result, type) => result || action.type === type,
    false,
  );
}

export const defaultState = {};

export default (
  state: Linode.ResourcesState = defaultState,
  action: Actions,
): Linode.ResourcesState =>
  when(
    (/* state */) => oneOfType(action, [REQUEST, SUCCESS, FAILURE]),
    (state) => {
      const path = action.meta.path;
      const setLoading = assocPath([...path, 'loading']);
      const setData = assocPath([...path, 'data']);
      const setError = assocPath([...path, 'error']);

      return compose(

        ifElse(
          () => action.type === REQUEST,
          setLoading(true),
          setLoading(false),
        ),

        when(
          () => action.type === SUCCESS,
          setData((action as SuccessAction).payload),
        ),

        when(
          () => action.type === FAILURE,
          setError((action as FailureAction).error),
        ),
      )(state);
    },
  )(state);

export const request = (path: string[]) => ({
  type: REQUEST,
  meta: { path },
});

export const success = (path: string[], payload: any) => ({
  type: SUCCESS,
  meta: { path },
  payload,
});

export const failure = (path: string[], error: Error) => ({
  type: FAILURE,
  meta: { path },
  error,
});
