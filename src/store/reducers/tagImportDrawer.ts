import { Action, compose, Dispatch } from 'redux';
import actionCreatorFactory from 'typescript-fsa';

const actionCreator = actionCreatorFactory(`@@manager/tagImportDrawer`);

type State = ApplicationState['tagImportDrawer'];

const CLOSE = '@@manager/tagImportDrawer/CLOSE';
const OPEN = '@@manager/tagImportDrawer/OPEN';
const UPDATE = '@@manager/tagImportDrawer/UPDATE';
const SUCCESS = '@@manager/tagImportDrawer/SUCCESS';
const ERROR = '@@manager/tagImportDrawer/ERROR';

interface Close extends Action {
  type: typeof CLOSE;
}

interface Open extends Action {
  type: typeof OPEN;
}

interface Update extends Action {
  type: typeof UPDATE;
}

interface Success extends Action {
  type: typeof SUCCESS;
}

interface Error extends Action {
  type: typeof ERROR;
  payload: ErrorPayload;
}

type ErrorPayload = TagError[];

export const close = (): Close => ({
  type: CLOSE,
});

export const open = (): Open => ({
  type: OPEN,
});

export const handleSuccess = actionCreator<void>(`SUCCESS`);
export const handleError = actionCreator<ErrorPayload>(`ERROR`);
export const handleUpdate = actionCreator<void>(`UPDATE`);

export const defaultState: State = {
  open: true,
  errors: [],
  loading: false,
  success: false,
};

type ActionTypes =
  | Open
  | Close
  | Error
  | Success
  | Update

export const tagImportDrawer = (state = defaultState, action: ActionTypes) => {
  switch (action.type) {
    case CLOSE:
      return {
        ...state,
        open: false,
      };

    case OPEN:
      return {
        ...defaultState,
        open: true,
      };

    case ERROR:
      return {
        ...state,
        loading: false,
        errors: action.payload
      }

    case SUCCESS:
      return {
        ...state,
        loading: false,
        errors: [],
        success: true,
      }

    case UPDATE:
      return {
        ...state,
        loading: true,
        errors: [],
        success: false,
      }

    default:
      return state;
  }
}
const mockUpdateLinodes = () => new Promise((resolve, reject) => {
  // setTimeout(() => resolve({ data: 'success!'}), 3000);
  setTimeout(() => reject([{entityId: 123, reason: 'A bad error'}]), 3000);
});

// Async

export const addTagsToEntities = () => (dispatch: Dispatch<State>) => {
  dispatch(handleUpdate());
  mockUpdateLinodes()
    .then(compose(dispatch, handleSuccess))
    .catch(compose(dispatch, handleError));
}

export default tagImportDrawer;
