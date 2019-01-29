import { StateHandlerMap, StateUpdaters, withStateHandlers } from 'recompose';
import { storage, Storage } from 'src/utilities/storage';

const localStorageContainer = <
  TState,
  TUpdaters extends StateHandlerMap<TState>,
  TOutter
>(
  mapState: (s: Storage) => TState,
  mapHandlers: (s: Storage) => StateUpdaters<TOutter, TState, TUpdaters>
) => {
  const state = mapState(storage);
  const handlers = mapHandlers(storage);
  return withStateHandlers<TState, TUpdaters, TOutter>(state, handlers);
};

export default localStorageContainer;
