import { applyMiddleware, combineReducers, createStore } from 'redux';
import thunk from 'redux-thunk';

import globalErrors, {
  defaultState as defaultGlobalErrorState,
} from 'src/store/globalErrors';
import longview, {
  defaultState as defaultLongviewState,
} from 'src/store/longview/longview.reducer';
import longviewStats, {
  defaultState as defaultLongviewStatsState,
} from 'src/store/longviewStats/longviewStats.reducer';

import mockFeatureFlags, {
  defaultMockFeatureFlagState,
} from './mockFeatureFlags';
import pendingUpload, {
  defaultState as pendingUploadState,
} from './pendingUpload';

import type { MockFeatureFlagState } from './mockFeatureFlags';
import type { State as PendingUploadState } from './pendingUpload';
import type { Store } from 'redux';
import type { State as GlobalErrorState } from 'src/store/globalErrors';
import type { State as LongviewState } from 'src/store/longview/longview.reducer';
import type { State as LongviewStatsState } from 'src/store/longviewStats/longviewStats.reducer';

export interface ApplicationState {
  globalErrors: GlobalErrorState;
  longviewClients: LongviewState;
  longviewStats: LongviewStatsState;
  mockFeatureFlags: MockFeatureFlagState;
  pendingUpload: PendingUploadState;
}

export const defaultState: ApplicationState = {
  globalErrors: defaultGlobalErrorState,
  longviewClients: defaultLongviewState,
  longviewStats: defaultLongviewStatsState,
  mockFeatureFlags: defaultMockFeatureFlagState,
  pendingUpload: pendingUploadState,
};

/**
 * Reducers
 */
const reducers = combineReducers<ApplicationState>({
  globalErrors,
  longviewClients: longview,
  longviewStats,
  mockFeatureFlags,
  pendingUpload,
});

export const storeFactory = () =>
  createStore(reducers, defaultState, applyMiddleware(thunk));

export type ApplicationStore = Store<ApplicationState>;
