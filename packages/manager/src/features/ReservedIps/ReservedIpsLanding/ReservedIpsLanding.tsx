import { useReservedIPsQuery } from '@linode/queries';
import { CircleProgress, ErrorState } from '@linode/ui';
import * as React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { ReservedIpsLandingEmptyState } from './ReservedIpsLandingEmptyState';
import { ReservedIpsLandingTable } from './ReservedIpsLandingTable';

import type { ReservedIpsActionHandlers } from './ReservedIpsActionMenu';

const preferenceKey = 'reserved-ips';

export const ReservedIpsLanding = () => {
  // TODO: These will be used by the Edit drawer and Unreserve dialog component
  // const [_selectedIP, setSelectedIP] = React.useState<IPAddress>();
  // const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  // const [_isEditDrawerOpen, setIsEditDrawerOpen] = React.useState(false);

  // const [_isUnreserveDialogOpen, setIsUnreserveDialogOpen] = React.useState(false);

  const handlers: ReservedIpsActionHandlers = {
    onEdit: (ip) => {
      // setSelectedIP(ip);
      // setIsEditDrawerOpen(true);
    },
    onUnreserve: (ip) => {
      // setSelectedIP(ip);
      // setIsUnreserveDialogOpen(true);
    },
  };

  const pagination = usePaginationV2({
    currentRoute: '/reserved-ips',
    preferenceKey,
  });

  const { handleOrderChange, order, orderBy } = useOrderV2({
    initialRoute: {
      defaultOrder: {
        order: 'asc',
        orderBy: 'address',
      },
      from: '/reserved-ips',
    },
    preferenceKey: `${preferenceKey}-order`,
  });

  const filter = {
    ['+order']: order,
    ['+order_by']: orderBy,
  };

  const {
    data: reservedIps,
    error,
    isLoading,
  } = useReservedIPsQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filter
  );

  if (error) {
    return (
      <ErrorState
        errorText={
          getAPIErrorOrDefault(
            error,
            'Error loading your Reserved IP addresses.'
          )[0].reason
        }
      />
    );
  }

  if (isLoading) {
    return <CircleProgress />;
  }

  if (!reservedIps?.data.length) {
    return <ReservedIpsLandingEmptyState />;
  }

  return (
    <>
      <LandingHeader
        createButtonText="Reserve an IP Address"
        onButtonClick={() => {
          /*To be updated
          setIsDrawerOpen(true) */
        }}
        spacingBottom={16}
        title="Reserved IP Addresses"
      />
      <ReservedIpsLandingTable
        data={reservedIps?.data}
        handleOrderChange={handleOrderChange}
        handlers={handlers}
        order={order}
        orderBy={orderBy}
        pagination={pagination}
        results={reservedIps?.results}
      />
    </>
  );
};
