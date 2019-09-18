import {
  getAccountSettings,
  updateAccountSettings as _update
} from 'linode-js-sdk/lib/account';
import { createRequestThunk } from '../store.helpers';

import {
  requestAccountSettingsActions,
  updateAccountSettingsActions
} from './accountSettings.actions';

export const requestAccountSettings = createRequestThunk(
  requestAccountSettingsActions,
  getAccountSettings
);

export const updateAccountSettings = createRequestThunk(
  updateAccountSettingsActions,
  _update
);
