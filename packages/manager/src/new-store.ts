import { Store } from '@tanstack/react-store';

export const store = new Store({
  isMaintenanceModeEnabled: false,
  isImageUploadInProgress: false,
  isAccountUnactivated: false,
  isNotificationMenuOpen: false,
  isComplianceModalOpen: false,
  isParentSessionExpiredModalOpen: false,
});

export const openNotificationMenu = () => {
  store.setState((state) => ({ ...state, isNotificationMenuOpen: true }))
};
