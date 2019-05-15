import { StateHandlerMap, StateUpdaters, withStateHandlers } from 'recompose';
import { storage, Storage } from 'src/utilities/storage';

const localStorageContainer = <
  TState,
  TUpdaters extends StateHandlerMap<TState>,
  TOuter
>(
  mapState: (s: Storage) => TState,
  mapHandlers: (s: Storage) => StateUpdaters<TOuter, TState, TUpdaters>
) => {
  const state = mapState(storage);
  const handlers = mapHandlers(storage);
  return withStateHandlers<TState, TUpdaters, TOuter>(state, handlers);
};

export default localStorageContainer;
