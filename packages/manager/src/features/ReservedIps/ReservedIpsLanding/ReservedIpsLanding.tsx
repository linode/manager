import { getAPIErrorOrDefault } from '@akamai/compute-ui-core/api';
import { useReservedIPsQuery } from '@linode/queries';
import { CircleProgress, ErrorState } from '@linode/ui';
import * as React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';

import { RESERVED_IPS_DOCS_LINK } from '../constants';
import { ReserveIPDrawer } from '../ReserveIPDrawer';
import { ReservedIpsLandingEmptyState } from './ReservedIpsLandingEmptyState';
import { ReservedIpsLandingTable } from './ReservedIpsLandingTable';

import type { ReserveIPDrawerMode } from '../ReserveIPDrawer';
import type { ReservedIpsActionHandlers } from './ReservedIpsActionMenu';
import type { IPAddress } from '@linode/api-v4';

const preferenceKey = 'reserved-ips';
import { UnreserveIPDialog } from './UnreserveIPDialog';

export const ReservedIpsLanding = () => {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [drawerMode, setDrawerMode] =
    React.useState<ReserveIPDrawerMode>('create');
  const [selectedIP, setSelectedIP] = React.useState<IPAddress | undefined>();

  const [isUnreserveDialogOpen, setIsUnreserveDialogOpen] =
    React.useState(false);

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
    onUnreserve: (ip) => {
      setSelectedIP(ip);
      setIsUnreserveDialogOpen(true);
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
          pendoIds={{
            cancel: 'Reserved IPs Reserve IP-Cancel',
            close: 'Reserved IPs Reserve IP-Close',
            submit: 'Reserved IPs Reserve IP-Reserve IP Address End Flow',
          }}
        />
      </>
    );
  }

  return (
    <>
      <LandingHeader
        buttonDataAttrs={{
          'data-pendo-id': 'Reserved IPs Landing-Reserve IP Address Start Flow',
        }}
        createButtonText="Reserve an IP Address"
        docsLink={RESERVED_IPS_DOCS_LINK}
        docsPendoId="Reserved IPs Landing-Docs"
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
        pendoIds={
          drawerMode !== 'edit'
            ? {
                cancel: 'Reserved IPs Reserve IP-Cancel',
                close: 'Reserved IPs Reserve IP-Close',
                submit: 'Reserved IPs Reserve IP-Reserve IP Address End Flow',
              }
            : undefined
        }
      />
      {selectedIP && (
        <UnreserveIPDialog
          ipAddress={selectedIP}
          onClose={() => {
            setIsUnreserveDialogOpen(false);
            setSelectedIP(undefined);
          }}
          open={isUnreserveDialogOpen}
        />
      )}
    </>
  );
};
