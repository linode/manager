import { applyMiddleware, combineReducers, createStore } from 'redux';
import thunk from 'redux-thunk';

import longview, {
  defaultState as defaultLongviewState,
} from 'src/features/Longview/store/longview/longview.reducer';
import longviewStats, {
  defaultState as defaultLongviewStatsState,
} from 'src/features/Longview/store/longviewStats/longviewStats.reducer';

import type { Store } from 'redux';
import type { State as LongviewState } from 'src/features/Longview/store/longview/longview.reducer';
import type { State as LongviewStatsState } from 'src/features/Longview/store/longviewStats/longviewStats.reducer';

export interface ApplicationState {
  longviewClients: LongviewState;
  longviewStats: LongviewStatsState;
}

export const defaultState: ApplicationState = {
  longviewClients: defaultLongviewState,
  longviewStats: defaultLongviewStatsState,
};

const reducers = combineReducers<ApplicationState>({
  longviewClients: longview,
  longviewStats,
});

export const storeFactory = () =>
  createStore(reducers, defaultState, applyMiddleware(thunk));

export type ApplicationStore = Store<ApplicationState>;
