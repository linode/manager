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

export const requestActionCreatorFactory = <Request, Response, Error>(
  type: string,
  action: string,
  options: Omit<MetaConfig<Request>, 'actions'>
) => {
  const actionCreator = actionCreatorFactory(`@@manager/${type}`);
  const actions = actionCreator.async<Request, Response, Error>(action);
  const meta = createMeta<Request>(actions, options);

  return {
    failed: actions.failed,
    done: actions.done,
    started: actions.started,
    request: actionCreator<Request>(`${action}`, meta),
  }
}
