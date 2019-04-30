import { sendEvent } from './analytics';

// LinodeActionMenu.tsx
export const sendLinodeActionEvent = () => {
  sendEvent({
    category: 'Linode Action Menu',
    action: 'Open Action Menu'
  });
};

// LinodeActionMenu.tsx
// LinodeCard.tsx
export const sendLinodeActionMenuItemEvent = (eventAction: string) => {
  sendEvent({
    category: 'Linode Action Menu Item',
    action: eventAction
  });
};

// AdaLink.tsx
export const sendAdaEvent = () => {
  sendEvent({
    category: 'Support Bot',
    action: 'Open',
    label: location.pathname
  });
};

// PaginationControls.tsx
export const sendPaginationEvent = (
  eventCategory: string,
  eventLabel: string
) => {
  sendEvent({
    category: eventCategory,
    action: 'pagination',
    label: eventLabel
  });
};

// src/index.tsx
export const sendCurrentThemeSettingsEvent = (eventAction: string) => {
  sendEvent({
    category: 'Theme Choice',
    action: eventAction,
    label: location.pathname
  });
};

// CreateVolumeForm.tsx
// CreateVolumeForLinodeForm.tsx
export const sendCreateVolumeEvent = (eventLabel: string) => {
  sendEvent({
    category: 'Create Volume',
    action: 'Create Volume',
    label: eventLabel
  });
};

// PanelContent.tsx
// StackScriptBase.tsx
export const sendStackscriptsSearchEvent = (eventLabel: string) => {
  sendEvent({
    category: 'stackscripts',
    action: 'search',
    label: eventLabel
  });
};

// getAll.ts
export const sendFetchAllEvent = (eventLabel: string, eventValue: number) => {
  sendEvent({
    category: 'Search',
    action: 'Data fetch all entities',
    label: eventLabel,
    value: eventValue
  });
};

// TagImportDrawer.tsx
export const sendImportDisplayGroupSubmitEvent = (
  eventLabel: string,
  eventValue: number
) => {
  sendEvent({
    category: 'dashboard',
    action: 'import display groups',
    label: eventLabel,
    value: eventValue
  });
};

// PrimaryNav.tsx
export const sendSpacingToggleEvent = (eventLabel: string) => {
  sendEvent({
    category: 'Theme Choice',
    action: 'Spacing Toggle',
    label: eventLabel
  });
};

// PrimaryNav.tsx
export const sendThemeToggleEvent = (eventLabel: string) => {
  sendEvent({
    category: 'Theme Choice',
    action: 'Theme Toggle',
    label: eventLabel
  });
};

// backupDrawer/index.ts
// LinodeBackup.tsx
export const sendBackupsEnabledEvent = (eventLabel: string) => {
  sendEvent({
    category: 'Backups',
    action: 'Enable All Backups',
    label: eventLabel
  });
};

// LinodeBackup.tsx
export const sendBackupsDisabledEvent = () => {
  sendEvent({
    category: 'Backups',
    action: 'Disable Backups',
    label: 'From Backups tab'
  });
};

// NodeBalancersLanding.tsx
// DomainsLanding.tsx
// LinodesLanding.tsx
// VolumesLanding.tsx
export const sendGroupByTagEnabledEvent = (
  eventCategory: string,
  eventLabel: boolean
) => {
  sendEvent({
    category: eventCategory,
    action: 'group by tag',
    label: String(eventLabel)
  });
};

// LinodesLanding.tsx
export const sendLinodesViewEvent = (
  eventCategory: string,
  eventLabel: string
) => {
  sendEvent({
    category: eventCategory,
    action: 'switch view',
    label: eventLabel
  });
};

// NodeBalancerCreate.tsx
export const sendCreateNodeBalancerEvent = (eventLabel: string) => {
  sendEvent({
    category: 'NodeBalancer',
    action: 'Create NodeBalancer',
    label: eventLabel
  });
};

// LinodeCreateContainer.tsx
export const sendCreateLinodeEvent = (
  eventAction: string,
  eventLabel: string
) => {
  sendEvent({
    category: 'Create Linode',
    action: eventAction,
    label: eventLabel
  });
};
