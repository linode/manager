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
import OrderBy from 'src/components/OrderBy';
import { getIsDistributedRegion } from 'src/components/RegionSelect/RegionSelect.utils';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';
import { useVPCInterface } from 'src/hooks/useVPCInterface';
import { useIsLinodeInterfacesEnabled } from 'src/utilities/linodes';

import { AddIPDrawer } from './AddIPDrawer';
import { DeleteIPDialog } from './DeleteIPDialog';
import { DeleteRangeDialog } from './DeleteRangeDialog';
import { EditIPRDNSDrawer } from './EditIPRDNSDrawer';
import { EditRangeRDNSDrawer } from './EditRangeRDNSDrawer';
import IPSharing from './IPSharing';
import { IPTransfer } from './IPTransfer';
import { LinodeIPAddressRow } from './LinodeIPAddressRow';
import { ViewIPDrawer } from './ViewIPDrawer';
import { ViewRangeDrawer } from './ViewRangeDrawer';
import { ViewRDNSDrawer } from './ViewRDNSDrawer';

import type { IPAddressRowHandlers } from './LinodeIPAddressRow';
import type { IPTypes } from './types';
import type {
  IPAddress,
  IPRange,
  LinodeIPsResponse,
  VPCIP,
} from '@linode/api-v4';

export const ipTableId = 'ips';

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

  const linodeIsInDistributedRegion = getIsDistributedRegion(
    regions ?? [],
    linode?.region ?? ''
  );

  const isLinodesGrantReadOnly = useIsResourceRestricted({
    grantLevel: 'read_only',
    grantType: 'linode',
    id: linodeID,
  });

  const { isVPCOnlyLinode } = useVPCInterface({
    isLinodeInterface: linode?.interface_generation === 'linode',
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

  if (isLoading) {
    return <CircleProgress />;
  }

  if (error) {
    return <ErrorState errorText={error?.[0].reason} />;
  }

  if (!ips) {
    return null;
  }

  const ipDisplay = ipResponseToDisplayRows(ips);

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
              ...(!isLinodeInterfacesEnabled
                ? [
                    {
                      disabled: isLinodesGrantReadOnly,
                      onClick: () => setIsAddDrawerOpen(true),
                      title: 'Add an IP Address',
                    },
                  ]
                : []),
              {
                disabled: isLinodesGrantReadOnly,
                onClick: () => setIsTransferDialogOpen(true),
                title: 'IP Transfer',
              },
              {
                disabled: isLinodesGrantReadOnly,
                onClick: () => setIsShareDialogOpen(true),
                title: 'IP Sharing',
              },
            ]}
            ariaLabel="Linode IP Address Actions"
          />
        ) : (
          <Stack direction="row" spacing={1}>
            <Button
              buttonType="secondary"
              disabled={isLinodesGrantReadOnly}
              onClick={() => setIsTransferDialogOpen(true)}
            >
              IP Transfer
            </Button>
            <Button
              buttonType="secondary"
              disabled={isLinodesGrantReadOnly}
              onClick={() => setIsShareDialogOpen(true)}
            >
              IP Sharing
            </Button>
            {!isLinodeInterfacesEnabled && (
              <Button
                buttonType="primary"
                disabled={isLinodesGrantReadOnly}
                onClick={() => setIsAddDrawerOpen(true)}
              >
                Add an IP Address
              </Button>
            )}
          </Stack>
        )}
      </Paper>
      {/* @todo: It'd be nice if we could always sort by public -> private. */}
      <OrderBy
        data={ipDisplay}
        order="asc"
        orderBy="type"
        preferenceKey={'linode-network-ip-table'}
      >
        {({ data: orderedData, handleOrderChange, order, orderBy }) => {
          return (
            <Table aria-label="Linode IP Addresses" id={ipTableId}>
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
                {orderedData.map((ipDisplay) => (
                  <LinodeIPAddressRow
                    {...ipDisplay}
                    {...handlers}
                    isVPCOnlyLinode={
                      isVPCOnlyLinode && ipDisplay.type === 'Public – IPv4'
                    }
                    key={`${ipDisplay.address}-${ipDisplay.type}`}
                    linodeId={linodeID}
                    readOnly={isLinodesGrantReadOnly}
                  />
                ))}
              </TableBody>
            </Table>
          );
        }}
      </OrderBy>
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
        readOnly={isLinodesGrantReadOnly}
      />
      <IPTransfer
        linodeId={linodeID}
        onClose={() => setIsTransferDialogOpen(false)}
        open={isTransferDialogOpen}
        readOnly={isLinodesGrantReadOnly}
      />
      <IPSharing
        linodeId={linodeID}
        onClose={() => setIsShareDialogOpen(false)}
        open={isShareDialogOpen}
        readOnly={isLinodesGrantReadOnly}
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

// Takes an IP Response object and returns high-level IP display rows.
export const ipResponseToDisplayRows = (
  ipResponse?: LinodeIPsResponse
): IPDisplay[] => {
  if (!ipResponse) {
    return [];
  }

  const { ipv4, ipv6 } = ipResponse;

  const ipDisplay = [
    ...mapIPv4Display(ipv4.public, 'Public'),
    ...mapIPv4Display(ipv4.private, 'Private'),
    ...mapIPv4Display(ipv4.reserved, 'Reserved'),
    ...mapIPv4Display(ipv4.shared, 'Shared'),
  ];

  if (ipv6?.slaac) {
    ipDisplay.push(ipToDisplay(ipv6.slaac, 'SLAAC'));
  }

  if (ipv6?.link_local) {
    ipDisplay.push(ipToDisplay(ipv6?.link_local, 'Link Local'));
  }

  // If there is a VPC interface with 1:1 NAT, hide the Public IPv4 IP address row
  if (ipv4.vpc.find((vpcIp) => vpcIp.nat_1_1)) {
    ipDisplay.shift();
  }
  ipDisplay.push(...createVPCIPv4Display(ipv4.vpc));

  // IPv6 ranges and pools to display in the networking table
  ipDisplay.push(
    ...[...(ipv6 ? ipv6.global : [])].map((thisIP) => {
      /* If you want to surface rdns info in the future you have two options:
        1. Use the info we already have:
          We get info on our routed ranges from /networking/ipv6/ranges and /networking/ipv6/ranges/<id>, because the API
          only surfaces is_bgp in /networking/ipv6/ranges/<id> we need to use both, this should change in the API
          Similarly, the API only surfaces rdns info in /networking/ips/<ip>. To correlate a range and
          it's rdns info, you'll need to make an extra request to /netowrking/ips/<ip> or loop through the
          result of the request to /networking/ips and find the range info you want

        - OR -

        2. API change
          API could include RDNS info in /networking/ipv6/ranges and /networking/ipv6/ranges/<id> and
          while you're at it please ask them to add in is_bgp to /networking/ipv6/ranges as it would save a bunch of
          extra requests on Linodes with many ranges
      */
      return {
        _range: thisIP,
        address: `${thisIP.range}/${thisIP.prefix}`,
        gateway: '',
        rdns: '',
        subnetMask: '',
        type: 'Range – IPv6' as IPDisplay['type'],
      };
    })
  );

  return ipDisplay;
};

type ipKey =
  | 'Link Local'
  | 'Private'
  | 'Public'
  | 'Reserved'
  | 'Shared'
  | 'SLAAC';

const mapIPv4Display = (ips: IPAddress[], key: ipKey): IPDisplay[] => {
  return ips.map((ip) => ipToDisplay(ip, key));
};

export const createVPCIPv4Display = (ips: VPCIP[]): IPDisplay[] => {
  const emptyProps = {
    gateway: '',
    rdns: '',
    subnetMask: '',
  };

  const vpcIPDisplay: IPDisplay[] = [];
  for (const ip of ips) {
    if (ip.address_range) {
      vpcIPDisplay.push({
        address: ip.address_range,
        type: 'VPC – Range – IPv4',
        ...emptyProps,
      });
    }
    if (ip.address) {
      vpcIPDisplay.push({
        address: ip.address,
        type: 'VPC – IPv4',
        ...emptyProps,
      });
    }
    if (ip.nat_1_1) {
      vpcIPDisplay.push({
        address: ip.nat_1_1,
        type: 'VPC NAT – IPv4',
        ...emptyProps,
      });
    }
  }
  return vpcIPDisplay;
};

const ipToDisplay = (ip: IPAddress, key: ipKey): IPDisplay => {
  return {
    _ip: ip,
    address: ip.address,
    gateway: ip.gateway ?? '',
    rdns: ip.rdns ?? '',
    subnetMask: ip.subnet_mask ?? '',
    type: createType(ip, key) as IPTypes,
  };
};

export const createType = (ip: IPAddress, key: ipKey) => {
  if (key === 'Reserved' && ip.type === 'ipv4') {
    return ip.public ? 'Reserved IPv4 (public)' : 'Reserved IPv4 (private)';
  }

  if (key === 'SLAAC') {
    return 'Public – IPv6 – SLAAC';
  }

  return `${key} – ${ip.type === 'ipv4' ? 'IPv4' : 'IPv6'}`;
};
