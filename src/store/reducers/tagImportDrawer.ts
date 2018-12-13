import * as Bluebird from 'bluebird';
import { isEmpty, pathOr } from 'ramda';
import { Action, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import actionCreatorFactory from 'typescript-fsa';

import { updateLinode } from 'src/services/linodes';
import getEntitiesWithGroupsToImport from 'src/store/selectors/getEntitiesWithGroupsToImport';

const actionCreator = actionCreatorFactory(`@@manager/tagImportDrawer`);

type State = ApplicationState['tagImportDrawer'];

interface Accumulator {
  success: number[];
  errors: TagError[];
}

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

export const closeGroupDrawer = (): Close => ({
  type: CLOSE,
});

export const openGroupDrawer = (): Open => ({
  type: OPEN,
});

export const handleSuccess = actionCreator<void>(`SUCCESS`);
export const handleError = actionCreator<ErrorPayload>(`ERROR`);
export const handleUpdate = actionCreator<void>(`UPDATE`);

export const defaultState: State = {
  open: false,
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

// Async

/**
 * gatherResponsesAndErrors
 *
 * This magic is needed to accumulate errors from any failed requests, since
 * we need to enable backups for each Linode individually. The final response
 * will be available in the .then() handler for Bluebird.reduce (below), and has
 * the form:
 *
 * {
 *  success: number[] Linodes that successfully enabled Backups.
 *  errors: TagError[] Accumulated errors.
 * }
 */
export const gatherResponsesAndErrors = (accumulator: Accumulator, linodeId: number) => {
  return updateLinode(linodeId, {}).then(() => ({
    ...accumulator,
    success: [...accumulator.success, linodeId]
  }))
    .catch((error) => {
      const reason = pathOr('Error adding tag.',
        ['response', 'data', 'errors', 0, 'reason'], error);
      return {
        ...accumulator,
        errors: [...accumulator.errors, { entityId: linodeId, reason }]
      }
    })
}

type ImportGroupsAsTagsThunk = () => ThunkAction<void, ApplicationState, undefined>;
export const addTagsToEntities: ImportGroupsAsTagsThunk = () => (dispatch: Dispatch<State>, getState) => {
  dispatch(handleUpdate());
  const entities = getEntitiesWithGroupsToImport(getState());
  Bluebird.reduce(entities.linodes as any, gatherResponsesAndErrors, { success: [], errors: [] })
    .then(response => {
      if (response.errors && !isEmpty(response.errors)) {
        dispatch(handleError(response.errors));
      }
      else {
        dispatch(handleSuccess());
      }
      /** @todo */
      // dispatch(requestLinodesWithoutBackups());
    })
    .catch(() => dispatch(
      handleError([{ entityId: 0, reason: "There was an error enabling backups." }])
    ));
}

export default tagImportDrawer;
