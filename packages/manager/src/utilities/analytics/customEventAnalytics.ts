import { sendEvent } from './utils';

import type { CustomAnalyticsData } from './types';

/**
 * Custom Events
 */

// LinodeActionMenu.tsx
export const sendLinodeActionEvent = (): void => {
  sendEvent({
    action: 'Open Action Menu',
    category: 'Linode Action Menu',
  });
};

// LinodeActionMenu.tsx
// LinodeEntityDetail.tsx
export const sendLinodeActionMenuItemEvent = (eventAction: string): void => {
  sendEvent({
    action: eventAction,
    category: 'Linode Action Menu Item',
  });
};

// PaginationControls.tsx
export const sendPaginationEvent = (
  eventCategory: string,
  eventLabel: string
): void => {
  sendEvent({
    action: 'pagination',
    category: eventCategory,
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
    action: eventAction || 'Create Volume',
    category: 'Create Volume',
    label: eventLabel,
  });
};

// CreateDomain.tsx
export const sendCreateDomainEvent = (
  eventLabel: string,
  eventAction?: string
): void => {
  sendEvent({
    action: eventAction || 'Create Domain',
    category: 'Create Domain',
    label: eventLabel,
  });
};

// backupDrawer/index.ts
export const sendBackupsEnabledEvent = (eventLabel: string): void => {
  sendEvent({
    action: 'Enable All Backups',
    category: 'Backups',
    label: eventLabel,
  });
};

// LinodeBackup.tsx
export const sendBackupsDisabledEvent = (): void => {
  sendEvent({
    action: 'Disable Backups',
    category: 'Backups',
    label: 'From Backups tab',
  });
};

// LinodesLanding.tsx
export const sendGroupByTagEnabledEvent = (
  eventCategory: string,
  eventLabel: boolean
): void => {
  sendEvent({
    action: 'group by tag',
    category: eventCategory,
    label: String(eventLabel),
  });
};

// LinodesLanding.tsx
export const sendLinodesViewEvent = (
  eventCategory: string,
  eventLabel: string
): void => {
  sendEvent({
    action: 'switch view',
    category: eventCategory,
    label: eventLabel,
  });
};

// NodeBalancerCreate.tsx
export const sendCreateNodeBalancerEvent = (eventLabel: string): void => {
  sendEvent({
    action: 'Create NodeBalancer',
    category: 'NodeBalancer',
    label: eventLabel,
  });
};

// LinodeCreateContainer.tsx
export const sendCreateLinodeEvent = (
  eventAction: string,
  eventLabel: string | undefined,
  eventData?: CustomAnalyticsData
): void => {
  sendEvent({
    action: eventAction,
    category: 'Create Linode',
    data: eventData,
    label: eventLabel,
  });
};

// CreateBucketDrawer.tsx
export const sendCreateBucketEvent = (eventLabel: string): void => {
  sendEvent({
    action: 'Create Bucket',
    category: 'Object Storage',
    label: eventLabel,
  });
};

// BucketsLanding.tsx
export const sendDeleteBucketEvent = (eventLabel: string): void => {
  sendEvent({
    action: 'Delete Bucket',
    category: 'Object Storage',
    label: eventLabel,
  });
};

// BucketsLanding.tsx
export const sendDeleteBucketFailedEvent = (eventLabel: string): void => {
  sendEvent({
    action: 'Delete Bucket Failed',
    category: 'Object Storage',
    label: eventLabel,
  });
};

// AccessKeyLanding.tsx
export const sendCreateAccessKeyEvent = (): void => {
  sendEvent({
    action: 'Create Access Key',
    category: 'Object Storage',
  });
};

// AccessKeyLanding.tsx
export const sendEditAccessKeyEvent = (): void => {
  sendEvent({
    action: 'Edit Access Key',
    category: 'Object Storage',
  });
};

// AccessKeyLanding.tsx
export const sendRevokeAccessKeyEvent = (): void => {
  sendEvent({
    action: 'Revoke Access Key',
    category: 'Object Storage',
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
    action: `From ${pathNavigatedFrom}`,
    category: 'Migration Navigation',
  });
};
// MigrateLinode.tsx
export const sendMigrationInitiatedEvent = (
  sourceRegionLabel: string,
  destRegionLabel: string,
  usersCurrentHour: number
): void => {
  sendEvent({
    action: `Initiation Time: ${generateTimeOfDay(usersCurrentHour)}`,
    category: 'Inter-DC Migration Requested',
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
  action: 'Disable' | 'Enable'
): void => {
  return sendEvent({
    action,
    category: 'Domain Status Change',
  });
};

// BucketDetail.tsx
export const sendDownloadObjectEvent = (): void => {
  sendEvent({
    action: 'Download Object',
    category: 'Object Storage',
  });
};

// ObjectUploader.tsx
export const sendObjectsQueuedForUploadEvent = (numObjects: number): void => {
  sendEvent({
    action: 'Objects queued for upload',
    category: 'Object Storage',
    label: `${numObjects} objects`,
  });
};

// EntityTransferCreate.tsx
export const sendEntityTransferCreateEvent = (label: string): void => {
  sendEvent({
    action: 'Create',
    // eslint-disable-next-line
    category: 'Service Transfer',
    label,
  });
};

// ConfirmTransferDialog.tsx
export const sendEntityTransferReceiveEvent = (label: string): void => {
  sendEvent({
    action: 'Receive',
    category: 'Service Transfer',
    label,
  });
};

// ConfirmTransferCancelDialog.tsx
export const sendEntityTransferCancelEvent = (): void => {
  sendEvent({
    action: 'Cancel',
    category: 'Service Transfer',
  });
};

// ConfirmTransferSuccessDialog.tsx
export const sendEntityTransferCopyTokenEvent = (): void => {
  sendEvent({
    action: 'Copy Transfer Token',
    category: 'Entity Transfer',
  });
};

// CreateTransferSuccessDialog.tsx
export const sendEntityTransferCopyDraftEmailEvent = (): void => {
  sendEvent({
    action: 'Copy Draft Email',
    category: 'Entity Transfer',
  });
};

// DocsLink.tsx
export const sendHelpButtonClickEvent = (url: string, from?: string) => {
  if (from === 'Object Storage Landing') {
    sendObjectStorageDocsEvent('Docs');
  }

  sendEvent({
    action: url,
    category: 'Help Button',
    label: from,
  });
};

// LinodeCLIModal.tsx
export const sendCLIClickEvent = (action: string) => {
  sendEvent({
    action,
    category: 'Linode CLI Prompt',
  });
};

// FileUploader.tsx
export const sendImageUploadEvent = (action: string, imageSize: string) => {
  sendEvent({
    action,
    category: 'Image Upload',
    label: imageSize,
  });
};

// SelectRegionPanel.tsx
// SMTPRestrictionHelperText.tsx
// InterfaceSelect.tsx
export const sendLinodeCreateDocsEvent = (action: string) => {
  sendEvent({
    action,
    category: 'Linode Create Contextual Help',
  });
};

// LinodeCreate.tsx
// LinodeCreateContainer.tsx
// LinodeDetailHeader.tsx
export const sendLinodeCreateFlowDocsClickEvent = (label: string) => {
  sendEvent({
    action: 'Click:link',
    category: 'Linode Create Flow',
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
    action,
    category: `Disk ${diskActionTitle} Flow`,
    label,
  });
};

// BucketLanding.tsx
export const sendObjectStorageDocsEvent = (action: string) => {
  sendEvent({
    action,
    category: 'Object Storage Landing Contextual Help',
  });
};

type TypeOfSearch = 'Category Dropdown' | 'Search Field';

// FromAppsContent.tsx
export const sendMarketplaceSearchEvent = (
  typeOfSearch: TypeOfSearch,
  appCategory?: string
) => {
  sendEvent({
    action: `Click: ${typeOfSearch}`,
    category: 'Marketplace Create Flow',
    label: appCategory ?? 'Apps Search',
  });
};

// LinodeCreate.tsx
// LinodesCreate/CodeBlock/CodeBlock.tsx
// LinodesCreate/ApiAwareness/ApiAwareness.tsx
export const sendApiAwarenessClickEvent = (
  clickType: string,
  label: string
) => {
  sendEvent({
    action: `Click:${clickType}`,
    category: 'Linode Create API CLI Awareness Modal',
    label,
  });
};

// LinodeConfigs.tsx
export const sendLinodeConfigurationDocsEvent = (label: string) => {
  sendEvent({
    action: 'Click:link',
    category: 'Linode Configuration Contextual Help',
    label,
  });
};

// AccountLanding.tsx
// UserMenu.tsx
export const sendSwitchAccountEvent = (
  label: 'Account Landing' | 'User Menu'
) => {
  sendEvent({
    action: 'Click:button',
    category: 'Switch Accounts Flow',
    label,
  });
};

// SwitchAccountDrawer.tsx
export const sendSwitchToParentAccountEvent = () => {
  sendEvent({
    action: 'Click:link button',
    category: 'Switch Accounts Flow - To Parent Account',
  });
};

// SwitchAccountSessionDialog.tsx
export const sendSwitchAccountSessionExpiryEvent = (
  label: 'Close' | 'Log In'
) => {
  sendEvent({
    action: 'Click:button',
    category: 'Switch Accounts Flow - Session Expiration',
    label,
  });
};

// LinodeDetailHeader.tsx
export const sendEditBreadcrumbEvent = () => {
  sendEvent({
    action: 'Click:pencil icon',
    category: 'Breadcrumb',
    label: 'Edit Breadcrumb',
  });
};

// LinodeDetailHeader.tsx
// LinodeSettingsLabelPanel.tsx
export const sendUpdateLinodeLabelEvent = (
  label: 'Breadcrumb' | 'Settings'
) => {
  sendEvent({
    action: 'Click:button',
    category: 'Linode Label',
    label: `Update linode label from ${label}`,
  });
};

// SelectLinodePanel.tsx
// LinodeSelectTable.tsx
export const sendLinodePowerOffEvent = (category: string) => {
  sendEvent({
    action: 'Click:button',
    category,
    label: 'Power Off',
  });
};

// SupportTicketDialog.tsx
export const sendSupportTicketExitEvent = (label: 'Cancel' | 'Close') => {
  sendEvent({
    action: 'Open a Support Ticket',
    category: 'Support Ticket',
    label: `Click:${label}`,
  });
};
