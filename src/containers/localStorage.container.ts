import { StateHandlerMap, StateUpdaters, withStateHandlers } from 'recompose';
import { storage, Storage } from 'src/utilities/storage';

const localStorageContainer = <TState, TUpdaters, TOuter>(
  mapState: (s: Storage) => TState,
  mapHandlers: (
    s: Storage
  ) => StateUpdaters<TOuter, TState, StateHandlerMap<TState> & TUpdaters>
) => {
  const handlers = mapHandlers(storage);
  return withStateHandlers<TState, StateHandlerMap<TState> & TUpdaters, TOuter>(
    () => mapState(storage),
    handlers
  );
};

export default localStorageContainer;
