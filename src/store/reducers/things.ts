const REQUEST = '@@manager/things/REQUEST';
const SUCCESS = '@@manager/things/SUCCESS';
const FAILURE = '@@manager/things/FAILURE';

type REQUEST = typeof REQUEST;
type SUCCESS = typeof SUCCESS;
type FAILURE = typeof FAILURE;

interface RequestAction {
  type: REQUEST;
  meta: { path: string[] };
}

interface SuccessAction {
  type: SUCCESS;
  meta: { path: string[] };
  payload: any;
}

interface FailureAction {
  type: FAILURE;
  meta: { path: string[] };
  error: Error;
}

interface State { }

type Actions = RequestAction | SuccessAction | FailureAction;

export default (state: State = {}, action: Actions): State => {
  switch (action.type) {
    case REQUEST:
      return state;

    case SUCCESS:
      return state;

    case FAILURE:
      return state;

    default:
      return state;
  }
};

export const request = (path: string[]) => ({
  type: REQUEST,
  meta: { path },
});

export const suceess = (path: string[], payload: any) => ({
  type: SUCCESS,
  payload,
  meta: { path },
});

export const failure = (path: string[], error: Error) => ({
  type: FAILURE,
  error,
  meta: { path },
});
