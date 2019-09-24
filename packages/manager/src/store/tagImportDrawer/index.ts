import * as Bluebird from 'bluebird';
import produce from 'immer';
import { Domain } from 'linode-js-sdk/lib/domains';
import { Linode } from 'linode-js-sdk/lib/linodes';
import { isEmpty } from 'ramda';
import { Action, Reducer } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { ApplicationState } from 'src/store';
import { updateDomain } from 'src/store/domains/domains.requests';
import { updateLinode } from 'src/store/linodes/linode.requests';
import getEntitiesWithGroupsToImport, {
  GroupImportProps
} from 'src/store/selectors/getEntitiesWithGroupsToImport';
import { ThunkActionCreator } from 'src/store/types';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import { storage } from 'src/utilities/storage';
import actionCreatorFactory from 'typescript-fsa';

import { isType } from 'typescript-fsa';

const actionCreator = actionCreatorFactory(`@@manager/tagImportDrawer`);

export interface TagError {
  entityId: string | number;
  entityLabel?: string;
  reason: string;
}

export interface State {
  open: boolean;
  loading: boolean;
  errors: TagError[];
  success: boolean;
}

interface Accumulator<T> {
  success: T[];
  errors: TagError[];
}

export const importTagsActions = actionCreator.async<void, void, TagError[]>(
  'import'
);

export const openDrawer = actionCreator<void>('openDrawer');
export const closeDrawer = actionCreator<void>('closeDrawer');
export const handleReset = actionCreator<void>('reset');

export const defaultState: State = {
  open: false,
  errors: [],
  loading: false,
  success: false
};

export const tagImportDrawer: Reducer<State> = (
  state = defaultState,
  action
) => {
  return produce(state, draft => {
    if (isType(action, importTagsActions.started)) {
      draft.loading = true;
      draft.success = false;
      draft.errors = [];
    }

    if (isType(action, importTagsActions.done)) {
      draft.loading = false;
      draft.success = true;
      draft.errors = [];
    }

    if (isType(action, importTagsActions.failed)) {
      draft.loading = false;
      draft.errors = action.payload.error;
    }

    if (isType(action, openDrawer)) {
      draft.open = true;
      draft.errors = [];
    }

    if (isType(action, closeDrawer)) {
      draft.open = false;
    }

    if (isType(action, handleReset)) {
      Object.assign(draft, defaultState);
    }
  });
};

// Async

/**
 * createAccumulator
 *
 * This function returns an accumulator that gathers responses and errors,
 * injecting an entity type and dispatch so that we can dispatch appropriate actions
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
const createAccumulator = <T extends Linode | Domain>(
  entityType: 'linode' | 'domain',
  dispatch: ThunkDispatch<ApplicationState, undefined, Action>
) => (accumulator: Accumulator<T>, entity: GroupImportProps) => {
  // @todo if the API decides to enforce lowercase tags, remove this lower-casing.
  const tags = [...entity.tags, entity.group!.toLowerCase()];

  const action: ThunkAction<
    Promise<Linode | Domain>,
    ApplicationState,
    undefined,
    Action
  > =
    entityType === 'linode'
      ? updateLinode({ linodeId: entity.id, tags })
      : updateDomain({ domainId: entity.id, tags });

  return dispatch(action)
    .then((updatedEntity: T) => ({
      ...accumulator,
      success: [...accumulator.success, updatedEntity]
    }))
    .catch(error => {
      const reason = getErrorStringOrDefault(error, 'Error adding tag.');
      return {
        ...accumulator,
        errors: [
          ...accumulator.errors,
          { entityId: entity.id, reason, entityLabel: entity.label }
        ]
      };
    });
};

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
  linodeResponses: Accumulator<Linode>,
  domainResponses: Accumulator<Domain>,
  dispatch: ThunkDispatch<ApplicationState, undefined, Action>
) => {
  const totalErrors = [...linodeResponses.errors, ...domainResponses.errors];
  if (!isEmpty(totalErrors)) {
    dispatch(importTagsActions.failed({ error: totalErrors }));
  } else {
    dispatch(importTagsActions.done({}));
  }
  return totalErrors;
  // @todo do we need to update entities in store here? Seems to be currently handled with post-request events
  // in services
};

type ImportGroupsAsTagsThunk = ThunkActionCreator<void>;
export const addTagsToEntities: ImportGroupsAsTagsThunk = () => (
  dispatch,
  getState
) => {
  dispatch(importTagsActions.started());
  const entities = getEntitiesWithGroupsToImport(getState());

  const linodeAccumulator = createAccumulator<Linode>('linode', dispatch);
  const domainAccumulator = createAccumulator<Domain>('domain', dispatch);

  Bluebird.join(
    Bluebird.reduce(entities.linodes, linodeAccumulator, {
      success: [],
      errors: []
    }),
    Bluebird.reduce(entities.domains, domainAccumulator, {
      success: [],
      errors: []
    }),
    dispatch,
    handleAccumulatedResponsesAndErrors
  )
    .then((totalErrors: TagError[]) => {
      if (isEmpty(totalErrors)) {
        storage.hasImportedGroups.set();
      }
    })
    .catch(() =>
      dispatch(
        // Errors from individual requests will be accumulated and passed to .then(); hitting
        // this block indicates something went wrong with .reduce() or .join().
        // It's unclear under what circumstances this could ever actually fire.
        importTagsActions.failed({
          error: [
            {
              entityId: 0,
              reason: 'There was an error importing your display groups.'
            }
          ]
        })
      )
    );
};

export default tagImportDrawer;
