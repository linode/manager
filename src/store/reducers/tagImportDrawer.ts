import * as Bluebird from 'bluebird';
import { isEmpty, pathOr } from 'ramda';
import { Action, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import actionCreatorFactory from 'typescript-fsa';

import { updateLinode } from 'src/services/linodes';
import { updateLinode as _updateLinode } from 'src/store/reducers/resources/linodes';
import getEntitiesWithGroupsToImport,
  { GroupImportProps } from 'src/store/selectors/getEntitiesWithGroupsToImport';

const actionCreator = actionCreatorFactory(`@@manager/tagImportDrawer`);

type State = ApplicationState['tagImportDrawer'];

interface Accumulator {
  success: Linode.Linode[]; // | Linode.Domain[]
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
 * we need to import display groups for each entity individually. The final response
 * will be available in the .then() handler for Bluebird.reduce (below), and has
 * the form:
 *
 * {
 *  success: number[] IDs of successfully updated entities.
 *  errors: TagError[] Accumulated errors.
 * }
 */
export const gatherResponsesAndErrors = (
  accumulator: Accumulator,
  entity: GroupImportProps) => {
  return updateLinode(entity.id, {tags: [...entity.tags, entity.group!]})
    .then((linode) => ({
    ...accumulator,
    success: [...accumulator.success, linode]
    }))
    .catch((error) => {
      const reason = pathOr('Error adding tag.',
        ['response', 'data', 'errors', 0, 'reason'], error);
      return {
        ...accumulator,
        errors: [...accumulator.errors, { entityId: entity.id, reason }]
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
      // We want to update the successfully updated Linodes in the store
      // regardless of whether there were any errors elsewhere.
      response.success.forEach(
        (linode: Linode.Linode) => dispatch(_updateLinode(linode)),
      )
    })
    .catch(() => dispatch(
      handleError([{ entityId: 0, reason: "There was an error enabling backups." }])
    ));
}

export default tagImportDrawer;
