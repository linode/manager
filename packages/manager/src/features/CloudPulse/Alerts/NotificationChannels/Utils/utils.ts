import { DELETE_CHANNEL_TOOLTIP_TEXT } from '../../constants';

import type { Item } from '../../constants';
import type { NotificationChannelActionHandlers } from '../NotificationsChannelsListing/NotificationChannelActionMenu';
import type {
  AlertNotificationType,
  CloudPulseServiceType,
  NotificationChannelAlerts,
  ServiceTypesList,
} from '@linode/api-v4';
import type { Action } from 'src/components/ActionMenu/ActionMenu';
import type { AclpServices } from 'src/featureFlags';

interface NotificationChannelActionsListProps {
  /**
   * Number of alerts associated with the notification channel
   */
  alertsCount: number;
  /**
   * Handlers for actions like edit, delete, show details, etc.,
   */
  handlers: NotificationChannelActionHandlers;
}
export const getNotificationChannelActionsList = (
  props: NotificationChannelActionsListProps
): Record<AlertNotificationType, Action[]> => {
  const { handlers, alertsCount } = props;
  const { handleDetails, handleDelete, handleEdit } = handlers;
  return {
    system: [
      {
        onClick: handleDetails,
        title: 'Show Details',
      },
    ],
    user: [
      {
        onClick: handleDetails,
        title: 'Show Details',
      },
      {
        onClick: handleEdit,
        title: 'Edit',
      },
      {
        onClick: handleDelete,
        title: 'Delete',
        disabled: alertsCount > 0,
        tooltip: alertsCount > 0 ? DELETE_CHANNEL_TOOLTIP_TEXT : undefined,
      },
    ],
  };
};

/**
 * Returns a filtered and mapped list of service types for use in the Autocomplete.
 * @param serviceTypeList List of available service types from the API
 * @param aclpServices Feature flag configuration for service types
 * @returns Filtered list of service items that have alerts enabled
 */
export const getServicesList = (
  serviceTypeList: ServiceTypesList | undefined,
  aclpServices: Partial<AclpServices> | undefined
): Item<string, CloudPulseServiceType>[] => {
  if (!serviceTypeList || !serviceTypeList.data.length) {
    return [];
  }
  return serviceTypeList.data
    .filter(
      (service) =>
        aclpServices?.[service.service_type]?.alerts?.enabled ?? false
    )
    .map((service) => ({
      label: service.label,
      value: service.service_type,
    }));
};

/**
 * Returns a filtered list of alerts based on service filters and search text.
 * @param channelAlerts List of alerts associated with the notification channel
 * @param serviceFilters Selected service type filters
 * @param searchText Search text to filter alerts by label
 * @returns Filtered list of alerts
 */
export const getAssociatedAlerts = (
  channelAlerts: NotificationChannelAlerts[] | undefined,
  serviceFilters: Item<string, CloudPulseServiceType>[],
  searchText: string
): NotificationChannelAlerts[] => {
  if (!channelAlerts) {
    return [];
  }
  let filteredAlerts = channelAlerts;

  if (serviceFilters && serviceFilters.length > 0) {
    filteredAlerts = filteredAlerts.filter((alert) =>
      serviceFilters.some(
        (serviceFilter) => serviceFilter.value === alert.service_type
      )
    );
  }

  if (searchText) {
    filteredAlerts = filteredAlerts.filter(({ label }) =>
      label.toLowerCase().includes(searchText.toLowerCase())
    );
  }
  return filteredAlerts;
};
