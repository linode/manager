import { pathOr } from 'ramda';
import { event } from 'react-ga';
import { dcDisplayNames, GA_ID } from 'src/constants';

interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
}

/*
 * Will throw error unless analytics is initialized
 */
export const sendEvent = (eventPayload: AnalyticsEvent): void => {
  /** only send events if we have a GA ID */
  return !!GA_ID ? event(eventPayload) : undefined;
};

// LinodeActionMenu.tsx
export const sendLinodeActionEvent = (): void => {
  // AC 8/26/2020: disabling this event to reduce hits on GA as this seems to not be used
  // sendEvent({
  //   category: 'Linode Action Menu',
  //   action: 'Open Action Menu'
  // });
};

// LinodeActionMenu.tsx
// LinodeCard.tsx
export const sendLinodeActionMenuItemEvent = (eventAction: string): void => {
  sendEvent({
    category: 'Linode Action Menu Item',
    action: eventAction,
  });
};

// AdaLink.tsx
export const sendAdaEvent = (): void => {
  sendEvent({
    category: 'Support Bot',
    action: 'Open',
    label: location.pathname,
  });
};

// PaginationControls.tsx
export const sendPaginationEvent = (
  eventCategory: string,
  eventLabel: string
): void => {
  sendEvent({
    category: eventCategory,
    action: 'pagination',
    label: eventLabel,
  });
};

// CreateVolumeForm.tsx
// CreateVolumeForLinodeForm.tsx
export const sendCreateVolumeEvent = (
  eventLabel: string,
  eventAction?: string
): void => {
  sendEvent({
    category: 'Create Volume',
    action: eventAction || 'Create Volume',
    label: eventLabel,
  });
};

// For DOMAINS
export const sendCreateDomainEvent = (
  eventLabel: string,
  eventAction?: string
): void => {
  sendEvent({
    category: 'Create Domain',
    action: eventAction || 'Create Domain',
    label: eventLabel,
  });
};

// PanelContent.tsx
// StackScriptBase.tsx
export const sendStackscriptsSearchEvent = (eventLabel: string): void => {
  sendEvent({
    category: 'stackscripts',
    action: 'search',
    label: eventLabel,
  });
};

// getAll.ts
export const sendFetchAllEvent = (
  eventLabel: string,
  eventValue: number
): void => {
  sendEvent({
    category: 'Search',
    action: 'Data fetch all entities',
    label: eventLabel,
    value: eventValue,
  });
};

// TagImportDrawer.tsx
export const sendImportDisplayGroupSubmitEvent = (
  eventLabel: string,
  eventValue: number
): void => {
  sendEvent({
    category: 'dashboard',
    action: 'import display groups',
    label: eventLabel,
    value: eventValue,
  });
};

// LinodeThemeWrapper.tsx
export const sendSpacingToggleEvent = (eventLabel: string): void => {
  // AC 8/24/2020: disabling this event to reduce hits on GA as this seems to not be used
  // sendEvent({
  //   category: 'Theme Choice',
  //   action: 'Spacing Toggle',
  //   label: eventLabel
  // });
};

// LinodeThemeWrapper.tsx
export const sendThemeToggleEvent = (): void => {
  // AC 9/24/2020: disabling this event to reduce hits on GA as this seems to not be used
  // sendEvent({
  //   category: 'Theme Choice',
  //   action: 'Theme Toggle',
  //   label: eventLabel
  // });
};

// backupDrawer/index.ts
// LinodeBackup.tsx
export const sendBackupsEnabledEvent = (eventLabel: string): void => {
  sendEvent({
    category: 'Backups',
    action: 'Enable All Backups',
    label: eventLabel,
  });
};

// LinodeBackup.tsx
export const sendBackupsDisabledEvent = (): void => {
  sendEvent({
    category: 'Backups',
    action: 'Disable Backups',
    label: 'From Backups tab',
  });
};

// NodeBalancersLanding.tsx
// DomainsLanding.tsx
// LinodesLanding.tsx
// VolumesLanding.tsx
export const sendGroupByTagEnabledEvent = (
  eventCategory: string,
  eventLabel: boolean
): void => {
  sendEvent({
    category: eventCategory,
    action: 'group by tag',
    label: String(eventLabel),
  });
};

// LinodesLanding.tsx
export const sendLinodesViewEvent = (
  eventCategory: string,
  eventLabel: string
): void => {
  sendEvent({
    category: eventCategory,
    action: 'switch view',
    label: eventLabel,
  });
};

// NodeBalancerCreate.tsx
export const sendCreateNodeBalancerEvent = (eventLabel: string): void => {
  sendEvent({
    category: 'NodeBalancer',
    action: 'Create NodeBalancer',
    label: eventLabel,
  });
};

// LinodeCreateContainer.tsx
export const sendCreateLinodeEvent = (
  eventAction: string,
  eventLabel: string
): void => {
  sendEvent({
    category: 'Create Linode',
    action: eventAction,
    label: eventLabel,
  });
};

// CreateBucketForm.tsx
export const sendCreateBucketEvent = (eventLabel: string): void => {
  sendEvent({
    category: 'Object Storage',
    action: 'Create Bucket',
    label: eventLabel,
  });
};

// BucketsLanding.tsx
export const sendDeleteBucketEvent = (eventLabel: string): void => {
  sendEvent({
    category: 'Object Storage',
    action: 'Delete Bucket',
    label: eventLabel,
  });
};

export const sendDeleteBucketFailedEvent = (eventLabel: string): void => {
  sendEvent({
    category: 'Object Storage',
    action: 'Delete Bucket Failed',
    label: eventLabel,
  });
};

// AccessKeyLanding.tsx
export const sendCreateAccessKeyEvent = (): void => {
  sendEvent({
    category: 'Object Storage',
    action: 'Create Access Key',
  });
};

// AccessKeyLanding.tsx
export const sendEditAccessKeyEvent = (): void => {
  sendEvent({
    category: 'Object Storage',
    action: 'Edit Access Key',
  });
};

// AccessKeyLanding.tsx
export const sendRevokeAccessKeyEvent = (): void => {
  sendEvent({
    category: 'Object Storage',
    action: 'Revoke Access Key',
  });
};

/**
 * meant to be sent to GA upon navigating to `/linodes/${linodeID}/migrate`
 */
export const sendMigrationNavigationEvent = (
  pathNavigatedFrom: string
): void => {
  sendEvent({
    category: 'Migration Navigation',
    action: `From ${pathNavigatedFrom}`,
  });
};

export const sendMigrationInitiatedEvent = (
  sourceRegion: string,
  destRegion: string,
  usersCurrentHour: number
): void => {
  const safeSourceRegion = pathOr(sourceRegion, [sourceRegion], dcDisplayNames);
  const safeDestRegion = pathOr(destRegion, [destRegion], dcDisplayNames);

  sendEvent({
    category: 'Inter-DC Migration Requested',
    action: `Initiation Time: ${generateTimeOfDay(usersCurrentHour)}`,
    label: `${safeSourceRegion} to ${safeDestRegion}`,
  });
};

export const generateTimeOfDay = (currentHour: number): string => {
  let currentTimeOfDay = 'Other';

  if (currentHour >= 0 && currentHour < 5) {
    currentTimeOfDay = 'Early Morning';
  } else if (currentHour >= 5 && currentHour < 12) {
    currentTimeOfDay = 'Morning';
  } else if (currentHour >= 12 && currentHour < 17) {
    currentTimeOfDay = 'Midday';
  } else if (currentHour >= 17 && currentHour < 20) {
    currentTimeOfDay = 'Evening';
  } else if (currentHour >= 20 && currentHour <= 24) {
    currentTimeOfDay = 'Night';
  }

  return currentTimeOfDay;
};

export const sendDomainStatusChangeEvent = (
  action: 'Enable' | 'Disable'
): void => {
  return sendEvent({
    category: 'Domain Status Change',
    action,
  });
};

export const sendDownloadObjectEvent = (): void => {
  sendEvent({
    category: 'Object Storage',
    action: 'Download Object',
  });
};

export const sendObjectsQueuedForUploadEvent = (numObjects: number): void => {
  sendEvent({
    category: 'Object Storage',
    action: 'Objects queued for upload',
    label: `${numObjects} objects`,
  });
};

export const sendSearchBarUsedEvent = (): void => {
  sendEvent({
    category: 'Search',
    action: 'Search Select',
    label: window.location.pathname,
  });
};

export const sendEntityTransferCreateEvent = (label: string): void => {
  sendEvent({
    // eslint-disable-next-line
    category: 'Service Transfer',
    action: 'Create',
    label,
  });
};

export const sendEntityTransferReceiveEvent = (label: string): void => {
  sendEvent({
    category: 'Service Transfer',
    action: 'Receive',
    label,
  });
};

export const sendEntityTransferCancelEvent = (): void => {
  sendEvent({
    category: 'Service Transfer',
    action: 'Cancel',
  });
};

export const sendEntityTransferCopyTokenEvent = (): void => {
  sendEvent({
    category: 'Entity Transfer',
    action: 'Copy Transfer Token',
  });
};

export const sendEntityTransferCopyDraftEmailEvent = (): void => {
  sendEvent({
    category: 'Entity Transfer',
    action: 'Copy Draft Email',
  });
};

export const sendHelpButtonClickEvent = (buttonLabel: string) => {
  sendEvent({
    category: 'Help Button',
    action: buttonLabel,
  });
};

export const sendCLIClickEvent = (action: string) => {
  sendEvent({
    category: 'Linode CLI Prompt',
    action,
  });
};

export const sendImageUploadEvent = (action: string, imageSize: string) => {
  sendEvent({
    category: 'Image Upload',
    action,
    label: imageSize,
  });
};
