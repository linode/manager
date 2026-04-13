import { useReservedIPsQuery } from '@linode/queries';
import { CircleProgress, ErrorState } from '@linode/ui';
import * as React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { RESERVED_IPS_DOCS_LINK } from '../constants';
import { ReserveIPDrawer } from '../ReserveIPDrawer';
import { ReservedIpsLandingEmptyState } from './ReservedIpsLandingEmptyState';
import { ReservedIpsLandingTable } from './ReservedIpsLandingTable';

import type { ReserveIPDrawerMode } from '../ReserveIPDrawer';
import type { ReservedIpsActionHandlers } from './ReservedIpsActionMenu';
import type { IPAddress } from '@linode/api-v4';

const preferenceKey = 'reserved-ips';

export const ReservedIpsLanding = () => {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [drawerMode, setDrawerMode] =
    React.useState<ReserveIPDrawerMode>('create');
  const [selectedIP, setSelectedIP] = React.useState<IPAddress | undefined>();

  // TODO: Integrate Unreserve dialog
  // const [isUnreserveDialogOpen, setIsUnreserveDialogOpen] = React.useState(false);

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

  const openDrawer = (mode: ReserveIPDrawerMode, ip?: IPAddress) => {
    setSelectedIP(ip);
    setDrawerMode(mode);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedIP(undefined);
  };

  const handlers: ReservedIpsActionHandlers = {
    onEdit: (ip) => openDrawer('edit', ip),
    onUnreserve: (_ip) => {
      // TODO: Integrate Unreserve dialog
      // setSelectedIP(ip);
      // setIsUnreserveDialogOpen(true);
    },
  };

  if (isLoading) {
    return <CircleProgress />;
  }

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

  if (reservedIps?.results === 0) {
    return (
      <>
        <ReservedIpsLandingEmptyState
          openReserveIPDrawer={() => openDrawer('create')}
        />
        <ReserveIPDrawer
          ipAddress={selectedIP}
          mode={drawerMode}
          onClose={closeDrawer}
          open={isDrawerOpen}
        />
      </>
    );
  }

  return (
    <>
      <LandingHeader
        createButtonText="Reserve an IP Address"
        docsLink={RESERVED_IPS_DOCS_LINK}
        onButtonClick={() => openDrawer('create')}
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
      <ReserveIPDrawer
        ipAddress={selectedIP}
        mode={drawerMode}
        onClose={closeDrawer}
        open={isDrawerOpen}
      />
    </>
  );
};
