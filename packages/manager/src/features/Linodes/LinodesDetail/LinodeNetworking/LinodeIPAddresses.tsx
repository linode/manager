import {
  useLinodeIPsQuery,
  useLinodeQuery,
  useRegionsQuery,
} from '@linode/queries';
import {
  Box,
  Button,
  CircleProgress,
  ErrorState,
  Paper,
  Stack,
  Typography,
} from '@linode/ui';
import { useMediaQuery, useTheme } from '@mui/material';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { getIsDistributedRegion } from 'src/components/RegionSelect/RegionSelect.utils';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { useDetermineUnreachableIPs } from 'src/hooks/useDetermineUnreachableIPs';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { useIsLinodeInterfacesEnabled } from 'src/utilities/linodes';

import { AddIPDrawer } from './AddIPDrawer';
import { DeleteIPDialog } from './DeleteIPDialog';
import { DeleteRangeDialog } from './DeleteRangeDialog';
import { EditIPRDNSDrawer } from './EditIPRDNSDrawer';
import { EditRangeRDNSDrawer } from './EditRangeRDNSDrawer';
import IPSharing from './IPSharing';
import { IPTransfer } from './IPTransfer';
import { LinodeIPAddressRow } from './LinodeIPAddressRow';
import { ipResponseToDisplayRows, ipTableId } from './utils';
import { ViewIPDrawer } from './ViewIPDrawer';
import { ViewRangeDrawer } from './ViewRangeDrawer';
import { ViewRDNSDrawer } from './ViewRDNSDrawer';

import type { IPAddressRowHandlers } from './LinodeIPAddressRow';
import type { IPTypes } from './types';
import type { IPAddress, IPRange } from '@linode/api-v4';

interface LinodeIPAddressesProps {
  linodeID: number;
}

export const LinodeIPAddresses = (props: LinodeIPAddressesProps) => {
  const { linodeID } = props;

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const { data: ips, error, isLoading } = useLinodeIPsQuery(linodeID);
  const { data: linode } = useLinodeQuery(linodeID);
  const { data: regions } = useRegionsQuery();
  const { isLinodeInterfacesEnabled } = useIsLinodeInterfacesEnabled();
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const linodeIsInDistributedRegion = getIsDistributedRegion(
    regions ?? [],
    linode?.region ?? ''
  );

  // TODO: Update to check share_ips, assign_ips, update_ip_rdns, and allocate_linode_ip_address permissions once available
  const { data: permissions, isLoading: isPermissionsLoading } = usePermissions(
    'linode',
    ['update_linode'],
    linodeID,
    isOpen
  );
  const isLinodeInterface = linode?.interface_generation === 'linode';

  const { isUnreachablePublicIPv4, isUnreachablePublicIPv6, interfaceWithVPC } =
    useDetermineUnreachableIPs({
      isLinodeInterface,
      linodeId: linodeID,
    });

  const [selectedIP, setSelectedIP] = React.useState<IPAddress>();
  const [selectedRange, setSelectedRange] = React.useState<IPRange>();

  const [isDeleteIPDialogOpen, setIsDeleteIPDialogOpen] = React.useState(false);
  const [isDeleteRangeDialogOpen, setIsDeleteRangeDialogOpen] =
    React.useState(false);
  const [isRangeDrawerOpen, setIsRangeDrawerOpen] = React.useState(false);
  const [isIPDrawerOpen, setIsIPDrawerOpen] = React.useState(false);
  const [isIpRdnsDrawerOpen, setIsIpRdnsDrawerOpen] = React.useState(false);
  const [isRangeRdnsDrawerOpen, setIsRangeRdnsDrawerOpen] =
    React.useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = React.useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = React.useState(false);

  const [isViewRDNSDialogOpen, setIsViewRDNSDialogOpen] = React.useState(false);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = React.useState(false);

  const ipAddressesTableRef = React.useRef<HTMLTableElement>(null);

  React.useEffect(() => {
    if (ipAddressesTableRef.current && location.hash === `#${ipTableId}`) {
      ipAddressesTableRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash]);

  const openRemoveIPDialog = (ip: IPAddress) => {
    setSelectedIP(ip);
    setIsDeleteIPDialogOpen(true);
  };

  const openRemoveIPRangeDialog = (range: IPRange) => {
    setIsDeleteRangeDialogOpen(true);
    setSelectedRange(range);
  };

  const handleOpenEditRDNS = (ip: IPAddress) => {
    setSelectedIP(ip);
    setIsIpRdnsDrawerOpen(true);
  };

  const handleOpenEditRDNSForRange = (range: IPRange) => {
    setSelectedRange(range);
    setIsRangeRdnsDrawerOpen(true);
  };

  const handleOpenIPV6Details = (range: IPRange) => {
    setSelectedRange(range);
    setIsViewRDNSDialogOpen(true);
  };

  const handlers: IPAddressRowHandlers = {
    handleOpenEditRDNS,
    handleOpenEditRDNSForRange,
    handleOpenIPV6Details,
    openRemoveIPDialog,
    openRemoveIPRangeDialog,
  };

  const ipDisplay = ipResponseToDisplayRows({
    isLinodeInterface,
    interfaceWithVPC,
    ipResponse: ips,
  });

  const { sortedData, order, orderBy, handleOrderChange } = useOrderV2({
    data: ipDisplay,
    initialRoute: {
      defaultOrder: {
        order: 'asc',
        orderBy: 'type',
      },
      from: '/linodes/$linodeId/networking',
    },
    preferenceKey: 'linode-ip-addresses',
    prefix: 'linode-ip-addresses',
  });

  if (isLoading) {
    return <CircleProgress />;
  }

  if (error) {
    return <ErrorState errorText={error?.[0].reason} />;
  }

  if (!ips) {
    return null;
  }

  const showAddIPButton =
    !isLinodeInterfacesEnabled || linode?.interface_generation !== 'linode';

  return (
    <Box>
      <Paper
        sx={{
          alignItems: 'center',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          pl: 2,
          pr: 0.5,
          py: 0.5,
        }}
      >
        <Typography variant="h3">IP Addresses</Typography>
        {isSmallScreen ? (
          <ActionMenu
            actionsList={[
              ...(showAddIPButton
                ? [
                    {
                      // TODO: change to allocate_linode_ip_address permission
                      disabled: !permissions.update_linode,
                      onClick: () => setIsAddDrawerOpen(true),
                      title: 'Add an IP Address',
                    },
                  ]
                : []),
              {
                // TODO: change to assign_ips permission
                disabled: !permissions.update_linode,
                onClick: () => setIsTransferDialogOpen(true),
                title: 'IP Transfer',
              },
              {
                // TODO: change to share_ips permission
                disabled: !permissions.update_linode,
                onClick: () => setIsShareDialogOpen(true),
                title: 'IP Sharing',
              },
            ]}
            ariaLabel="Linode IP Address Actions"
            loading={isPermissionsLoading}
            onOpen={() => setIsOpen(true)}
          />
        ) : (
          <Stack direction="row" spacing={1}>
            <Button
              buttonType="secondary"
              // TODO: change to assign_ips permission
              disabled={!permissions.update_linode}
              onClick={() => setIsTransferDialogOpen(true)}
            >
              IP Transfer
            </Button>
            <Button
              buttonType="secondary"
              // TODO: change to share_ips permission
              disabled={!permissions.update_linode}
              onClick={() => setIsShareDialogOpen(true)}
            >
              IP Sharing
            </Button>
            {showAddIPButton && (
              <Button
                buttonType="primary"
                // TODO: change to allocate_linode_ip_address permission
                disabled={!permissions.update_linode}
                onClick={() => setIsAddDrawerOpen(true)}
              >
                Add an IP Address
              </Button>
            )}
          </Stack>
        )}
      </Paper>
      {/* @todo: It'd be nice if we could always sort by public -> private. */}
      <Table
        aria-label="Linode IP Addresses"
        id={ipTableId}
        ref={ipAddressesTableRef}
      >
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: '15%' }}>Address</TableCell>
            <TableSortCell
              active={orderBy === 'type'}
              direction={order}
              handleClick={handleOrderChange}
              label="type"
              sx={{ width: '10%' }}
            >
              Type
            </TableSortCell>
            <TableCell sx={{ width: '10%' }}>Default Gateway</TableCell>
            <TableCell sx={{ width: '10%' }}>Subnet Mask</TableCell>
            <TableCell sx={{ width: '20%' }}>Reverse DNS</TableCell>
            <TableCell sx={{ width: '20%' }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {(sortedData ?? []).map((ipDisplay) => (
            <LinodeIPAddressRow
              {...ipDisplay}
              {...handlers}
              isLinodeInterface={isLinodeInterface}
              isUnreachablePublicIPv4={isUnreachablePublicIPv4}
              isUnreachablePublicIPv6={isUnreachablePublicIPv6}
              key={`${ipDisplay.address}-${ipDisplay.type}`}
              linodeId={linodeID}
              // TODO: change to update_ip_rdns permission
              readOnly={!permissions.update_linode}
            />
          ))}
        </TableBody>
      </Table>
      <ViewIPDrawer
        ip={selectedIP}
        onClose={() => setIsIPDrawerOpen(false)}
        open={isIPDrawerOpen}
      />
      <ViewRangeDrawer
        onClose={() => setIsRangeDrawerOpen(false)}
        open={isRangeDrawerOpen}
        range={selectedRange}
      />
      <EditIPRDNSDrawer
        ip={selectedIP}
        onClose={() => setIsIpRdnsDrawerOpen(false)}
        open={isIpRdnsDrawerOpen}
      />
      <EditRangeRDNSDrawer
        linodeId={linodeID}
        onClose={() => setIsRangeRdnsDrawerOpen(false)}
        open={isRangeRdnsDrawerOpen}
        range={selectedRange}
      />
      <ViewRDNSDrawer
        linodeId={linodeID}
        onClose={() => setIsViewRDNSDialogOpen(false)}
        open={isViewRDNSDialogOpen}
        selectedRange={selectedRange}
      />
      <AddIPDrawer
        linodeId={linodeID}
        linodeIsInDistributedRegion={linodeIsInDistributedRegion}
        onClose={() => setIsAddDrawerOpen(false)}
        open={isAddDrawerOpen}
        // TODO: change to allocate_linode_ip_address permission
        readOnly={!permissions.update_linode}
      />
      <IPTransfer
        linodeId={linodeID}
        onClose={() => setIsTransferDialogOpen(false)}
        open={isTransferDialogOpen}
        // TODO: change to assign_ips permission
        readOnly={!permissions.update_linode}
      />
      <IPSharing
        linodeId={linodeID}
        onClose={() => setIsShareDialogOpen(false)}
        open={isShareDialogOpen}
        readOnly={!permissions.update_linode}
        // TODO: change to share_ips permission
      />
      {selectedIP && (
        <DeleteIPDialog
          address={selectedIP.address}
          linodeId={linodeID}
          onClose={() => setIsDeleteIPDialogOpen(false)}
          open={isDeleteIPDialogOpen}
        />
      )}
      {selectedRange && (
        <DeleteRangeDialog
          onClose={() => setIsDeleteRangeDialogOpen(false)}
          open={isDeleteRangeDialogOpen}
          range={selectedRange}
        />
      )}
    </Box>
  );
};

// Higher-level IP address display for the IP Table.
export interface IPDisplay {
  // Not for display, but useful for lower-level components.
  _ip?: IPAddress;
  _range?: IPRange;
  address: string;
  gateway: string;
  rdns: string;
  subnetMask: string;
  type: IPTypes;
}
