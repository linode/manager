import * as Bluebird from 'bluebird';
import { curry, isEmpty, pathOr } from 'ramda';
import { Action, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import actionCreatorFactory from 'typescript-fsa';

import { updateDomain } from 'src/services/domains';
import { updateLinode } from 'src/services/linodes';
import getEntitiesWithGroupsToImport,
  { GroupImportProps } from 'src/store/selectors/getEntitiesWithGroupsToImport';

const actionCreator = actionCreatorFactory(`@@manager/tagImportDrawer`);

type State = ApplicationState['tagImportDrawer'];

interface Accumulator<T> {
  success: T[];
  errors: TagError[];
}

const CLOSE = '@@manager/tagImportDrawer/CLOSE';
const OPEN = '@@manager/tagImportDrawer/OPEN';
const UPDATE = '@@manager/tagImportDrawer/UPDATE';
const SUCCESS = '@@manager/tagImportDrawer/SUCCESS';
const ERROR = '@@manager/tagImportDrawer/ERROR';
const RESET = '@@manager/tagImportDrawer/RESET';

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

interface Reset extends Action {
  type: typeof RESET;
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
export const handleReset = actionCreator<void>(`RESET`);

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
  | Reset

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

    case RESET:
      return defaultState;

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
 *  success: Entity[] Array of successfully updated entities.
 *  errors: TagError[] Accumulated errors.
 * }
 */
export const gatherResponsesAndErrors = (
  cb: (id: number, data: any) => Promise<Linode.Linode|Linode.Domain>,
  accumulator: Accumulator<Linode.Linode | Linode.Domain>,
  entity: GroupImportProps) => {
    // @todo if the API decides to enforce lowercase tags, remove this lowercasing.
    return cb(entity.id, {tags: [...entity.tags, entity.group!.toLowerCase()]})
      .then((updatedEntity) => ({
      ...accumulator,
      success: [...accumulator.success, updatedEntity]
      }))
      .catch((error) => {
        const reason = pathOr('Error adding tag.',
          ['response', 'data', 'errors', 0, 'reason'], error);
        return {
          ...accumulator,
          errors: [...accumulator.errors, { entityId: entity.id, reason, entityLabel: entity.label }]
        }
      })
}

const curriedAccumulator = curry(gatherResponsesAndErrors);
const domainAccumulator = curriedAccumulator(updateDomain);
const linodeAccumulator = curriedAccumulator(updateLinode);

/**
 *  handleAccumulatedResponsesAndErrors
 *
 *  Bluebird.join() returns a tuple containing the responses of each of its joined Promises.
 *  In this case, we get separate accumulated success/error responses for Linodes and Domains,
 *  along with dispatch which is passed down so that actions can be dispatched from the handler.
 *
 *  Handles 3 basic cases:
 *  ~ No errors returned (indicating all entities were tagged successfully)
 *  ~ Some entities were updated successfully, but some errors occurred
 *  ~ Every request failed
 *
 *  Higher-level errors (failures in Bluebird.reduce() or Bluebird.join() ) are handled in the
 *  catch block of Bluebird.join()
 *
 */
const handleAccumulatedResponsesAndErrors = (
  linodeResponses: Accumulator<Linode.Linode>,
  domainResponses: Accumulator<Linode.Domain>,
  dispatch: Dispatch<State>
  ) => {
    const totalErrors = [...linodeResponses.errors, ...domainResponses.errors]
    if (!isEmpty(totalErrors)) {
      dispatch(handleError(totalErrors));
    }
    else {
      dispatch(handleSuccess());
    }
    // @todo do we need to update entities in store here? Seems to be currently handled with post-request events
    // in services
}

type ImportGroupsAsTagsThunk = () => ThunkAction<void, ApplicationState, undefined>;
export const addTagsToEntities: ImportGroupsAsTagsThunk = () => (dispatch: Dispatch<State>, getState) => {
  dispatch(handleUpdate());
  const entities = getEntitiesWithGroupsToImport(getState());
  Bluebird.join(
    Bluebird.reduce(entities.linodes as any, linodeAccumulator, { success: [], errors: [] }),
    Bluebird.reduce(entities.domains as any, domainAccumulator, { success: [], errors: [] }),
    dispatch,
    handleAccumulatedResponsesAndErrors,
  )
    .catch(() => dispatch(
      // Errors from individual requests will be accumulated and passed to .then(); hitting
      // this block indicates something went wrong with .reduce() or .join().
      // It's unclear under what circumstances this could ever actually fire.
      handleError([{ entityId: 0, reason: "There was an error importing your display groups." }])
    ));
}

export default tagImportDrawer;
