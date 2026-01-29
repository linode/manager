import {
  Autocomplete,
  BetaChip,
  Box,
  Notice,
  SelectedIcon,
  Stack,
  StyledListItem,
  Typography,
} from '@linode/ui';
import * as React from 'react';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableContentWrapper } from 'src/components/TableContentWrapper/TableContentWrapper';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell/TableSortCell';
import { useFlags } from 'src/hooks/useFlags';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { useAllAlertsByNotificationChannelIdQuery } from 'src/queries/cloudpulse/alerts';
import { useCloudPulseServiceTypes } from 'src/queries/cloudpulse/services';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import {
  alertsFromEnabledServices,
  getServiceTypeLabel,
} from '../../Utils/utils';
import { getAssociatedAlerts, getServicesList } from '../Utils/utils';
import { NotificationChannelAlertsTableRow } from './NotificationChannelAlertsTableRow';

import type { Item } from '../../constants';
import type {
  CloudPulseServiceType,
  NotificationChannelAlerts as NotificationChannelAlertsType,
} from '@linode/api-v4';
import type { Order } from '@linode/utilities';

interface NotificationChannelAlertsProps {
  /**
   * The ID of the notification channel to fetch alerts for.
   */
  channelId: number;
}

const handleSortClick = (
  orderBy: string,
  handleOrderChange: (orderBy: string, order?: Order) => void,
  handlePageChange: (page: number) => void,
  order?: Order
) => {
  if (order) {
    handleOrderChange(orderBy, order);
    handlePageChange(1);
  }
};

export const NotificationChannelAlerts = React.memo(
  (props: NotificationChannelAlertsProps) => {
    const { channelId } = props;

    const { aclpServices } = useFlags();
    const { data: serviceTypeList } = useCloudPulseServiceTypes(true);
    const {
      data: allAlerts,
      error,
      isError,
      isLoading,
    } = useAllAlertsByNotificationChannelIdQuery(channelId);

    const channelAlerts = alertsFromEnabledServices(allAlerts, aclpServices);
    const _error = error
      ? getAPIErrorOrDefault(error, 'Error in fetching the alerts.')
      : undefined;
    const [searchText, setSearchText] = React.useState<string>('');
    const [serviceFilters, setServiceFilters] = React.useState<
      Item<string, CloudPulseServiceType>[]
    >([]);

    const servicesList = React.useMemo(
      () => getServicesList(serviceTypeList, aclpServices),
      [aclpServices, serviceTypeList]
    );

    const associatedAlerts = React.useMemo(
      () => getAssociatedAlerts(channelAlerts, serviceFilters, searchText),
      [channelAlerts, searchText, serviceFilters]
    );

    const associatedAlertsWithServiceLabels = React.useMemo(() => {
      return associatedAlerts.map((alert) => ({
        ...alert,
        service_type_label: alert.service_type
          ? getServiceTypeLabel(alert.service_type, serviceTypeList)
          : undefined,
      }));
    }, [associatedAlerts, serviceTypeList]);

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

    if (!isLoading && !isError && !channelAlerts?.length) {
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
      <Stack spacing={3}>
        <Typography variant="h2">Associated Alerts</Typography>
        <Box
          display="flex"
          flexDirection={{
            lg: 'row',
            md: 'column',
            sm: 'column',
            xs: 'column',
          }}
          gap={2}
        >
          <DebouncedSearchTextField
            data-qa-filter="associated-alerts-search"
            label=""
            noMarginTop
            onSearch={setSearchText}
            placeholder="Search for Alerts"
            sx={{
              width: { lg: '250px', md: '300px', sm: '400px', xs: '300px' },
            }}
            value={searchText}
          />
          <Autocomplete
            autoHighlight
            data-qa-filter="associated-alerts-service-filter"
            data-testid="associated-alerts-service-filter"
            label=""
            limitTags={1}
            multiple
            noMarginTop
            onChange={(_, selected) => {
              setServiceFilters(selected);
            }}
            options={servicesList}
            placeholder={serviceFilters.length > 0 ? '' : 'Select a Service'}
            renderOption={(props, option, { selected }) => {
              const { key, ...rest } = props;
              const ListItem =
                key === 'Select All ' || key === 'Deselect All '
                  ? StyledListItem
                  : 'li';
              return (
                <ListItem {...rest} data-qa-option key={key}>
                  <Box flexGrow={1}>{option.label}</Box>{' '}
                  {aclpServices?.[option.value]?.alerts?.beta && <BetaChip />}
                  <SelectedIcon visible={selected} />
                </ListItem>
              );
            }}
            sx={{
              width: { lg: '250px', md: '300px', sm: '400px', xs: '300px' },
            }}
            value={serviceFilters}
          />
        </Box>
        <Paginate data={sortedData ?? []}>
          {({
            count,
            data: paginatedAndOrderedAlerts,
            handlePageChange,
            handlePageSizeChange,
            page,
            pageSize,
          }) => {
            const handleTableSort = (orderBy: string, order?: Order) =>
              handleSortClick(
                orderBy,
                handleOrderChange,
                handlePageChange,
                order
              );

            return (
              <>
                <Table data-qa="associated-alerts-table">
                  <TableHead>
                    <TableRow>
                      <TableSortCell
                        active={orderBy === 'label'}
                        data-qa-header={'label'}
                        data-qa-sorting={'label'}
                        direction={order}
                        handleClick={handleTableSort}
                        label="label"
                      >
                        Alert Name
                      </TableSortCell>
                      <TableSortCell
                        active={orderBy === 'service_type_label'}
                        data-qa-header={'service_type_label'}
                        data-qa-sorting={'service_type_label'}
                        direction={order}
                        handleClick={handleTableSort}
                        label="service_type_label"
                      >
                        Service
                      </TableSortCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableContentWrapper
                      error={_error}
                      length={paginatedAndOrderedAlerts.length}
                      loading={isLoading}
                      loadingProps={{ columns: 2 }}
                    />
                    {paginatedAndOrderedAlerts.map((alert) => (
                      <NotificationChannelAlertsTableRow
                        alert={alert}
                        key={alert.id}
                        serviceTypeLabel={
                          alert.service_type
                            ? getServiceTypeLabel(
                              alert.service_type,
                              serviceTypeList
                            )
                            : undefined
                        }
                      />
                    ))}
                  </TableBody>
                </Table>
                <PaginationFooter
                  count={count}
                  eventCategory="Notification Channel Alerts Table"
                  handlePageChange={handlePageChange}
                  handleSizeChange={handlePageSizeChange}
                  page={page}
                  pageSize={pageSize}
                  sx={{ border: 0 }}
                />
              </>
            );
          }}
        </Paginate>
      </Stack>
    );
  }
);
