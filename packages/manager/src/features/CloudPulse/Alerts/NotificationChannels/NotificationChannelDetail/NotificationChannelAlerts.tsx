import { CircleProgress, Notice, Typography } from '@linode/ui';
import * as React from 'react';

import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableSortCell } from 'src/components/TableSortCell/TableSortCell';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { useAllAlertsByNotificationChannelIdQuery } from 'src/queries/cloudpulse/alerts';
import { useCloudPulseServiceTypes } from 'src/queries/cloudpulse/services';

import { getServiceTypeLabel } from '../../Utils/utils';
import { NotificationChannelAlertsTableRow } from './NotificationChannelAlertsTableRow';

import type { NotificationChannelAlerts as NotificationChannelAlertsType } from '@linode/api-v4';

interface NotificationChannelAlertsProps {
  /**
   * The ID of the notification channel to fetch alerts for.
   */
  channelId: number;
}

export const NotificationChannelAlerts = React.memo(
  (props: NotificationChannelAlertsProps) => {
    const { channelId } = props;

    const { data: serviceTypeList, isFetching } =
      useCloudPulseServiceTypes(true);
    const {
      data: channelAlerts,
      isError: isChannelAlertsError,
      isLoading: isChannelAlertsLoading,
    } = useAllAlertsByNotificationChannelIdQuery(channelId);

    const associatedAlertsWithServiceLabels = React.useMemo(() => {
      return channelAlerts?.map((alert) => ({
        ...alert,
        service_type_label: alert.service_type
          ? getServiceTypeLabel(alert.service_type, serviceTypeList)
          : undefined,
      }));
    }, [channelAlerts, serviceTypeList]);

    const { handleOrderChange, order, orderBy, sortedData } =
      useOrderV2<NotificationChannelAlertsType>({
        data: associatedAlertsWithServiceLabels,
        initialRoute: {
          defaultOrder: {
            order: 'asc',
            orderBy: 'label',
          },
          from: '/alerts/notification-channels/detail/$channelId',
        },
        preferenceKey: 'notification-channel-alerts',
      });

    if (isChannelAlertsLoading || isFetching) {
      return (
        <>
          <Typography marginBottom={2} variant="h2">
            Associated Alerts
          </Typography>
          <CircleProgress size="sm" />
        </>
      );
    }

    if (isChannelAlertsError) {
      return (
        <>
          <Typography marginBottom={2} variant="h2">
            Associated Alerts
          </Typography>
          <Typography color="error">
            Unable to load alerts for this channel.
          </Typography>
        </>
      );
    }

    if (!channelAlerts?.length) {
      return (
        <>
          <Typography marginBottom={2} variant="h2">
            Associated Alerts
          </Typography>
          <Notice variant="info">
            No alerts are associated with this notification channel.
            <br />
            Add or assign alerts to start receiving notifications through this
            channel.
          </Notice>
        </>
      );
    }

    return (
      <>
        <Typography marginBottom={2} variant="h2">
          Associated Alerts
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableSortCell
                active={orderBy === 'label'}
                direction={order}
                handleClick={handleOrderChange}
                label="label"
              >
                Alert Name
              </TableSortCell>
              <TableSortCell
                active={orderBy === 'service_type_label'}
                direction={order}
                handleClick={handleOrderChange}
                label="service_type_label"
              >
                Service
              </TableSortCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData && sortedData.length > 0 ? (
              sortedData.map((alert) => (
                <NotificationChannelAlertsTableRow
                  alert={alert}
                  key={alert.id}
                  serviceTypeLabel={
                    alert.service_type
                      ? getServiceTypeLabel(alert.service_type, serviceTypeList)
                      : undefined
                  }
                />
              ))
            ) : (
              <TableRowEmpty colSpan={2} />
            )}
          </TableBody>
        </Table>
      </>
    );
  }
);
