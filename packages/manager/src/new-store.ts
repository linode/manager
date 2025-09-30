import { Store } from '@tanstack/react-store';

import type { FlagSet } from './featureFlags';

export const store = new Store({
  isMaintenanceModeEnabled: false,
  isImageUploadInProgress: false,
  isAccountUnactivated: false,
  isNotificationMenuOpen: false,
  isComplianceModalOpen: false,
  isParentSessionExpiredModalOpen: false,
  featureFlagOverrides: {} as FlagSet
});

export const openNotificationMenu = () => {
  store.setState((state) => ({ ...state, isNotificationMenuOpen: true }))
};
