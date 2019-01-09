import { adjust } from 'ramda';
import updateOrAdd from "src/utilities/updateOrAdd";
import { actionCreatorFactory } from 'typescript-fsa';
import { ObjectSchema } from 'yup';

interface MetaConfig<Params, T = {}> {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  actions: any[];
  endpoint: string | ((v: Params) => string);
  validationSchema?: ObjectSchema<T>;
}

interface Meta<P> {
  __request: MetaConfig<P>;
}

interface State<T extends { id: number }> {
  entities: T[];
  error?: Linode.ApiFieldError[];
  lastUpdated: number;
  loading: boolean;
  results: number[];
}

export const createMeta = <P>(actions: { started: any; done: any; failed: any }, obj: Omit<MetaConfig<P>, 'actions'>): Meta<P> => ({
  __request: {
    ...obj,
    actions: [actions.started, actions.done, actions.failed],
  }
});

export const onStart = <S>(state: S) => Object.assign({}, state, { loading: true });

export const onGetAllSuccess = <T extends { id: number }, S>(items: T[], state: S) =>
  Object.assign({}, state, {
    loading: false,
    lastUpdated: Date.now(),
    entities: items,
    results: items.map(e => e.id),
  });

export const onError = <S = {}>(error: Linode.ApiFieldError[], state: S) => Object.assign({}, state, { error });

export const createDefaultState = <E extends { id: number }>(): State<E> => ({
  results: [],
  entities: [],
  loading: true,
  lastUpdated: 0,
  error: undefined,
})

export const onDeleteSuccess = <E extends { id: number }>(id: number, state: State<E>): State<E> => {
  const { entities } = state;
  const updated = entities.filter(e => e.id !== id);

  return {
    ...state,
    entities: updated,
    results: updated.map(e => e.id),
  }
};

export const onCreateSuccess = <E extends { id: number }>(entity: E, state: State<E>): State<E> => {
  const updated = [...state.entities, entity];

  return {
    ...state,
    entities: updated,
    results: updated.map((e) => e.id),
  };
}

export const onUpdateSuccess = <E extends { id: number }>(entity: E, state: State<E>): State<E> => {
  const updated = updateOrAdd(entity, state.entities);

  return {
    ...state,
    entities: updated,
    results: updated.map((e) => e.id),
  }
};

export const updateInPlace = <E extends { id: number }>(id: number, update: (v: E) => E, state: State<E>): State<E> => {
  const { entities, results } = state;
  if (results.length === 0) {
    return state;
  }

  const foundId = results.findIndex(i => i === id);
  if (foundId < 0) {
    return state;
  }

  const updated = adjust(update, foundId, entities);
  return {
    ...state,
    entities: updated,
    results: updated.map((e) => e.id),
  }
};
import { ActionCreator, AsyncActionCreators } from 'typescript-fsa';

interface RequestActionCreators<Req, Res, Err> extends AsyncActionCreators<Req, Res, Err> {
  request: ActionCreator<Req>;
}

export const requestActionCreatorFactory = <Req, Res, Err>(

  /**
   * The entity serves no special purpose other than generating the action types.
   */
  entity: string,

  /**
   * The action serves no special purpose other than generating the request action type.
   */
  action: string,

  /**
   * The options, in combination with the payload from the dispatched request action, are used to
   * generate the config AxiosRequestConfig object.
   */
  options: Omit<MetaConfig<Req>, 'actions'>
): RequestActionCreators<Req, Res, Err> => {
  const type = `@@manager/${entity}`;
  const actionCreator = actionCreatorFactory(type);
  const actions = actionCreator.async<Req, Res, Err>(action);
  const meta = createMeta<Req>(actions, options);

  return {
    type,
    failed: actions.failed,
    done: actions.done,
    started: actions.started,
    request: actionCreator<Req>(`${action}`, meta),
  }
}
