import { ADOBE_ANALYTICS_URL } from 'src/constants';

interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
}

export const sendEvent = (eventPayload: AnalyticsEvent): void => {
  if (!ADOBE_ANALYTICS_URL) {
    return;
  }

  // Send a Direct Call Rule if our environment is configured with an Adobe Launch script
  if ((window as any)._satellite) {
    (window as any)._satellite.track('custom event', {
      category: eventPayload.category,
      action: eventPayload.action,
      label: eventPayload.label,
      value: eventPayload.value,
    });
  }
};

// LinodeActionMenu.tsx
export const sendLinodeActionEvent = (): void => {
  sendEvent({
    category: 'Linode Action Menu',
    action: 'Open Action Menu',
  });
};

// LinodeActionMenu.tsx
// LinodeEntityDetail.tsx
export const sendLinodeActionMenuItemEvent = (eventAction: string): void => {
  sendEvent({
    category: 'Linode Action Menu Item',
    action: eventAction,
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

// CreateDomain.tsx
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

// backupDrawer/index.ts
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

// LinodesLanding.tsx
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

// CreateBucketDrawer.tsx
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

// BucketsLanding.tsx
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
 * meant to be sent to AA upon navigating to `/linodes/${linodeID}/migrate`
 */
// LinodeActionMenu.tsx
export const sendMigrationNavigationEvent = (
  pathNavigatedFrom: string
): void => {
  sendEvent({
    category: 'Migration Navigation',
    action: `From ${pathNavigatedFrom}`,
  });
};
// MigrateLinode.tsx
export const sendMigrationInitiatedEvent = (
  sourceRegionLabel: string,
  destRegionLabel: string,
  usersCurrentHour: number
): void => {
  sendEvent({
    category: 'Inter-DC Migration Requested',
    action: `Initiation Time: ${generateTimeOfDay(usersCurrentHour)}`,
    label: `${sourceRegionLabel} to ${destRegionLabel}`,
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

// DisableDomainDialog.tsx
export const sendDomainStatusChangeEvent = (
  action: 'Enable' | 'Disable'
): void => {
  return sendEvent({
    category: 'Domain Status Change',
    action,
  });
};

// BucketDetail.tsx
export const sendDownloadObjectEvent = (): void => {
  sendEvent({
    category: 'Object Storage',
    action: 'Download Object',
  });
};

// ObjectUploader.tsx
export const sendObjectsQueuedForUploadEvent = (numObjects: number): void => {
  sendEvent({
    category: 'Object Storage',
    action: 'Objects queued for upload',
    label: `${numObjects} objects`,
  });
};

// EntityTransferCreate.tsx
export const sendEntityTransferCreateEvent = (label: string): void => {
  sendEvent({
    // eslint-disable-next-line
    category: 'Service Transfer',
    action: 'Create',
    label,
  });
};

// ConfirmTransferDialog.tsx
export const sendEntityTransferReceiveEvent = (label: string): void => {
  sendEvent({
    category: 'Service Transfer',
    action: 'Receive',
    label,
  });
};

// ConfirmTransferCancelDialog.tsx
export const sendEntityTransferCancelEvent = (): void => {
  sendEvent({
    category: 'Service Transfer',
    action: 'Cancel',
  });
};

// ConfirmTransferSuccessDialog.tsx
export const sendEntityTransferCopyTokenEvent = (): void => {
  sendEvent({
    category: 'Entity Transfer',
    action: 'Copy Transfer Token',
  });
};

// CreateTransferSuccessDialog.tsx
export const sendEntityTransferCopyDraftEmailEvent = (): void => {
  sendEvent({
    category: 'Entity Transfer',
    action: 'Copy Draft Email',
  });
};

// DocsLink.tsx
export const sendHelpButtonClickEvent = (url: string, from?: string) => {
  if (from === 'Object Storage Landing') {
    sendObjectStorageDocsEvent('Docs');
  }

  sendEvent({
    category: 'Help Button',
    action: url,
    label: from,
  });
};

// LinodeCLIModal.tsx
export const sendCLIClickEvent = (action: string) => {
  sendEvent({
    category: 'Linode CLI Prompt',
    action,
  });
};

// FileUploader.tsx
export const sendImageUploadEvent = (action: string, imageSize: string) => {
  sendEvent({
    category: 'Image Upload',
    action,
    label: imageSize,
  });
};

// SelectRegionPanel.tsx
// SMTPRestrictionHelperText.tsx
// InterfaceSelect.tsx
export const sendLinodeCreateDocsEvent = (action: string) => {
  sendEvent({
    category: 'Linode Create Contextual Help',
    action,
  });
};

// LinodeCreate.tsx
// LinodeCreateContainer.tsx
// LinodeDetailHeader.tsx
export const sendLinodeCreateFlowDocsClickEvent = (label: string) => {
  sendEvent({
    category: 'Linode Create Flow',
    action: 'Click:link',
    label,
  });
};

// LinodeDiskActionMenu.tsx
// LinodeDiskDrawer.tsx
// LinodeDisks.tsx
// ToastNotifications.tsx
export const sendLinodeDiskEvent = (
  diskActionTitle: string,
  action: string,
  label: string
) => {
  sendEvent({
    category: `Disk ${diskActionTitle} Flow`,
    action,
    label,
  });
};

// BucketLanding.tsx
export const sendObjectStorageDocsEvent = (action: string) => {
  sendEvent({
    category: 'Object Storage Landing Contextual Help',
    action,
  });
};

type TypeOfSearch = 'Search Field' | 'Category Dropdown';

// FromAppsContent.tsx
export const sendMarketplaceSearchEvent = (
  typeOfSearch: TypeOfSearch,
  appCategory?: string
) => {
  sendEvent({
    category: 'Marketplace Create Flow',
    action: `Click: ${typeOfSearch}`,
    label: appCategory ?? 'Apps Search',
  });
};

// LinodeCreate.tsx
// LinodesCreate/CodeBlock/index.tsx
// LinodesCreate/ApiAwareness/index.tsx
export const sendApiAwarenessClickEvent = (
  clickType: string,
  label: string
) => {
  sendEvent({
    category: 'Linode Create API CLI Awareness Modal',
    action: `Click:${clickType}`,
    label,
  });
};
