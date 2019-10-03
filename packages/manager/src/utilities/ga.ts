import { pathOr } from 'ramda';
import { event } from 'react-ga';
import { dcDisplayNames, GA_ID, GA_ID_2 } from 'src/constants';

interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
}

/*
 * Will throw error unless analytics is initialized
 */
export const sendEvent = (eventPayload: AnalyticsEvent) => {
  /**
   * this is assuming your second GA_ID is going to be the linode.com
   * property, which seems bad, but there's no real way to enforce that with env vars
   */
  const additionalNames = GA_ID_2 ? ['linodecom'] : undefined;

  /** only send events if we have at least 1 GA ID */
  return [GA_ID, GA_ID_2].some(eachID => !!eachID)
    ? event(eventPayload, additionalNames)
    : undefined;
};

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

// LinodeThemeWrapper.tsx
export const sendCurrentThemeSettingsEvent = (eventAction: string) => {
  sendEvent({
    category: 'Theme Choice',
    action: eventAction,
    label: location.pathname
  });
};

// CreateVolumeForm.tsx
// CreateVolumeForLinodeForm.tsx
export const sendCreateVolumeEvent = (
  eventLabel: string,
  eventAction?: string
) => {
  sendEvent({
    category: 'Create Volume',
    action: eventAction || 'Create Volume',
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

// LinodeThemeWrapper.tsx
export const sendSpacingToggleEvent = (eventLabel: string) => {
  sendEvent({
    category: 'Theme Choice',
    action: 'Spacing Toggle',
    label: eventLabel
  });
};

// LinodeThemeWrapper.tsx
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

// CreateBucketForm.tsx
export const sendCreateBucketEvent = (eventLabel: string) => {
  sendEvent({
    category: 'Object Storage',
    action: 'Create Bucket',
    label: eventLabel
  });
};

// BucketsLanding.tsx
export const sendDeleteBucketEvent = (eventLabel: string) => {
  sendEvent({
    category: 'Object Storage',
    action: 'Delete Bucket',
    label: eventLabel
  });
};

export const sendDeleteBucketFailedEvent = (eventLabel: string) => {
  sendEvent({
    category: 'Object Storage',
    action: 'Delete Bucket Failed',
    label: eventLabel
  });
};

// AccessKeyLanding.tsx
export const sendCreateAccessKeyEvent = () => {
  sendEvent({
    category: 'Object Storage',
    action: 'Create Access Key'
  });
};

// AccessKeyLanding.tsx
export const sendEditAccessKeyEvent = () => {
  sendEvent({
    category: 'Object Storage',
    action: 'Edit Access Key'
  });
};

// AccessKeyLanding.tsx
export const sendRevokeAccessKeyEvent = () => {
  sendEvent({
    category: 'Object Storage',
    action: 'Revoke Access Key'
  });
};

/**
 * meant to be sent to GA upon navigating to `/linodes/${linodeID}/migrate`
 */
export const sendMigrationNavigationEvent = (pathNavigatedFrom: string) => {
  sendEvent({
    category: 'Migration Navigation',
    action: `From ${pathNavigatedFrom}`
  });
};

export const sendMigrationInitiatedEvent = (
  sourceRegion: string,
  destRegion: string,
  usersCurrentHour: number
) => {
  const safeSourceRegion = pathOr(sourceRegion, [sourceRegion], dcDisplayNames);
  const safeDestRegion = pathOr(destRegion, [destRegion], dcDisplayNames);

  sendEvent({
    category: 'Inter-DC Migration Requested',
    action: `Initiation Time: ${generateTimeOfDay(usersCurrentHour)}`,
    label: `${safeSourceRegion} to ${safeDestRegion}`
  });
};

export const generateTimeOfDay = (currentHour: number) => {
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

export const sendOneClickNavigationEvent = (
  whichButton: 'Add New Menu' | 'Primary Nav'
) => {
  return sendEvent({
    category: 'One Click App Navigation',
    action: `From ${whichButton}`
  });
};
