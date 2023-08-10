import { LinodeIPsResponse } from '@linode/api-v4/lib/linodes';
import { IPAddress, IPRange } from '@linode/api-v4/lib/networking';
import Grid from '@mui/material/Unstable_Grid2';
import { useTheme, Theme } from '@mui/material/styles';
import { IPv6, parse as parseIP } from 'ipaddr.js';
import * as React from 'react';
import { useParams } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';

import AddNewLink from 'src/components/AddNewLink';
import { Button } from 'src/components/Button/Button';
import { CircleProgress } from 'src/components/CircleProgress';
import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Hidden } from 'src/components/Hidden';
import OrderBy from 'src/components/OrderBy';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { Typography } from 'src/components/Typography';
import { Paper } from 'src/components/Paper';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import {
  useAllIPsQuery,
  useLinodeIPsQuery,
} from 'src/queries/linodes/networking';
import { useGrants } from 'src/queries/profile';

import { LinodePermissionsError } from '../LinodePermissionsError';
import { AddIPDrawer } from './AddIPDrawer';
import { DeleteIPDialog } from './DeleteIPDialog';
import { DeleteRangeDialog } from './DeleteRangeDialog';
import { EditIPRDNSDrawer } from './EditIPRDNSDrawer';
import { EditRangeRDNSDrawer } from './EditRangeRDNSDrawer';
import IPSharing from './IPSharing';
import IPTransfer from './IPTransfer';
import { LinodeNetworkingActionMenu } from './LinodeNetworkingActionMenu';
import { LinodeNetworkingSummaryPanel } from './NetworkingSummaryPanel/NetworkingSummaryPanel';
import { ViewIPDrawer } from './ViewIPDrawer';
import { ViewRDNSDrawer } from './ViewRDNSDrawer';
import { ViewRangeDrawer } from './ViewRangeDrawer';
import { IPTypes } from './types';
import {
  StyledActionTableCell,
  StyledWrapperGrid,
  StyledTypography,
  StyledRootGrid,
} from './LinodeNetworking.styles';

const useStyles = makeStyles<void, 'copy'>()(
  (theme: Theme, _params, classes) => ({
    copy: {
      '& svg': {
        height: `12px`,
        opacity: 0,
        width: `12px`,
      },
      marginLeft: 4,
      top: 1,
    },
    row: {
      [`&:hover .${classes.copy} > svg, & .${classes.copy}:focus > svg`]: {
        opacity: 1,
      },
    },
  })
);

export const ipv4TableID = 'ips';

const LinodeNetworking = () => {
  const { data: grants } = useGrants();
  const { classes } = useStyles();
  const { linodeId } = useParams<{ linodeId: string }>();
  const id = Number(linodeId);
  const { data: ips, error, isLoading } = useLinodeIPsQuery(id);

  const readOnly =
    grants !== undefined &&
    grants.linode.some((g) => g.id === id && g.permissions === 'read_only');

  const [selectedIP, setSelectedIP] = React.useState<IPAddress>();
  const [selectedRange, setSelectedRange] = React.useState<IPRange>();

  const [isDeleteIPDialogOpen, setIsDeleteIPDialogOpen] = React.useState(false);
  const [isDeleteRangeDialogOpen, setIsDeleteRangeDialogOpen] = React.useState(
    false
  );
  const [isRangeDrawerOpen, setIsRangeDrawerOpen] = React.useState(false);
  const [isIPDrawerOpen, setIsIPDrawerOpen] = React.useState(false);
  const [isIpRdnsDrawerOpen, setIsIpRdnsDrawerOpen] = React.useState(false);
  const [isRangeRdnsDrawerOpen, setIsRangeRdnsDrawerOpen] = React.useState(
    false
  );
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

  const renderIPRow = (ipDisplay: IPDisplay) => {
    // TODO: in order to fully get rid of makeStyles for this file, may need to convert this to a functional component
    // rather than function inside this component >> will look into during part 2 of this ticket
    const { _ip, _range, address, gateway, rdns, subnetMask, type } = ipDisplay;
    const isOnlyPublicIP =
      ips?.ipv4.public.length === 1 && type === 'IPv4 – Public';

    return (
      <TableRow
        className={classes.row}
        data-qa-ip={address}
        key={`${address}-${type}`}
      >
        <TableCell
          sx={{ whiteSpace: 'nowrap' }}
          data-qa-ip-address
          parentColumn="Address"
        >
          <CopyTooltip copyableText text={address} />
          <CopyTooltip className={classes.copy} text={address} />
        </TableCell>
        <TableCell data-qa-ip-address parentColumn="Type">
          {type}
        </TableCell>
        <TableCell parentColumn="Default Gateway">{gateway}</TableCell>
        <TableCell parentColumn="Subnet Mask">{subnetMask}</TableCell>
        <TableCell data-qa-rdns parentColumn="Reverse DNS">
          {/* Ranges have special handling for RDNS. */}
          {_range ? (
            <RangeRDNSCell
              linodeId={id}
              onViewDetails={() => handleOpenIPV6Details(_range)}
              range={_range}
            />
          ) : (
            rdns
          )}
        </TableCell>
        <StyledActionTableCell data-qa-action>
          {_ip ? (
            <LinodeNetworkingActionMenu
              ipAddress={_ip}
              ipType={type}
              isOnlyPublicIP={isOnlyPublicIP}
              onEdit={handleOpenEditRDNS}
              onRemove={openRemoveIPDialog}
              readOnly={readOnly}
            />
          ) : _range ? (
            <LinodeNetworkingActionMenu
              ipAddress={_range}
              ipType={type}
              isOnlyPublicIP={isOnlyPublicIP}
              onEdit={() => handleOpenEditRDNSForRange(_range)}
              onRemove={openRemoveIPRangeDialog}
              readOnly={readOnly}
            />
          ) : null}
        </StyledActionTableCell>
      </TableRow>
    );
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

  const renderIPTable = () => {
    const ipDisplay = ipResponseToDisplayRows(ips);

    return (
      <div style={{ marginTop: 20 }}>
        <StyledRootGrid
          alignItems="flex-end"
          container
          justifyContent="space-between"
          spacing={1}
        >
          <Grid className="p0">
            <StyledTypography variant="h3">IP Addresses</StyledTypography>
          </Grid>
          <StyledWrapperGrid>
            <Hidden smDown>
              <Button
                buttonType="secondary"
                onClick={() => setIsTransferDialogOpen(true)}
              >
                IP Transfer
              </Button>
              <Button
                buttonType="secondary"
                onClick={() => setIsShareDialogOpen(true)}
                style={{ marginRight: 16 }}
              >
                IP Sharing
              </Button>
            </Hidden>
            <AddNewLink
              label="Add an IP Address"
              onClick={() => setIsAddDrawerOpen(true)}
            />
          </StyledWrapperGrid>
        </StyledRootGrid>
        <Paper style={{ padding: 0 }}>
          {/* @todo: It'd be nice if we could always sort by public -> private. */}
          <OrderBy data={ipDisplay} order="asc" orderBy="type">
            {({ data: orderedData, handleOrderChange, order, orderBy }) => {
              return (
                <Table aria-label="IPv4 Addresses" id={ipv4TableID}>
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ width: '15%' }}>Address</TableCell>
                      <TableSortCell
                        active={orderBy === 'type'}
                        direction={order}
                        handleClick={handleOrderChange}
                        label="type"
                        style={{ width: '10%' }}
                      >
                        Type
                      </TableSortCell>
                      <TableCell style={{ width: '10%' }}>
                        Default Gateway
                      </TableCell>
                      <TableCell style={{ width: '10%' }}>
                        Subnet Mask
                      </TableCell>
                      <TableCell style={{ borderRight: 'none', width: '20%' }}>
                        Reverse DNS
                      </TableCell>
                      <TableCell style={{ borderLeft: 'none', width: '20%' }} />
                    </TableRow>
                  </TableHead>
                  <TableBody>{orderedData.map(renderIPRow)}</TableBody>
                </Table>
              );
            }}
          </OrderBy>
        </Paper>
      </div>
    );
  };

  return (
    <div>
      {readOnly && <LinodePermissionsError />}
      <LinodeNetworkingSummaryPanel linodeID={id} />
      {renderIPTable()}
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
        linodeId={id}
        onClose={() => setIsRangeRdnsDrawerOpen(false)}
        open={isRangeRdnsDrawerOpen}
        range={selectedRange}
      />
      <ViewRDNSDrawer
        linodeId={id}
        onClose={() => setIsViewRDNSDialogOpen(false)}
        open={isViewRDNSDialogOpen}
        selectedRange={selectedRange}
      />
      <AddIPDrawer
        linodeId={id}
        onClose={() => setIsAddDrawerOpen(false)}
        open={isAddDrawerOpen}
        readOnly={readOnly}
      />
      <IPTransfer
        linodeId={id}
        onClose={() => setIsTransferDialogOpen(false)}
        open={isTransferDialogOpen}
        readOnly={readOnly}
      />
      <IPSharing
        linodeId={id}
        onClose={() => setIsShareDialogOpen(false)}
        open={isShareDialogOpen}
        readOnly={readOnly}
      />
      {selectedIP && (
        <DeleteIPDialog
          address={selectedIP.address}
          linodeId={id}
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
    </div>
  );
};

export default LinodeNetworking;

const RangeRDNSCell = (props: {
  linodeId: number;
  onViewDetails: () => void;
  range: IPRange;
}) => {
  const { linodeId, onViewDetails, range } = props;
  const theme = useTheme();

  const { data: linode } = useLinodeQuery(linodeId);

  const { data: ipsInRegion, isLoading: ipv6Loading } = useAllIPsQuery(
    {},
    {
      region: linode?.region,
    },
    linode !== undefined
  );

  const ipsWithRDNS = listIPv6InRange(range.range, range.prefix, ipsInRegion);

  if (ipv6Loading) {
    return <CircleProgress mini noPadding />;
  }

  // We don't show anything if there are no addresses.
  if (ipsWithRDNS.length === 0) {
    return null;
  }

  if (ipsWithRDNS.length === 1) {
    return (
      <span>
        <Typography>{ipsWithRDNS[0].address}</Typography>
        <Typography>{ipsWithRDNS[0].rdns}</Typography>
      </span>
    );
  }

  return (
    <button
      aria-label={`View the ${ipsWithRDNS.length} RDNS Addresses`}
      onClick={onViewDetails}
      style={theme.applyLinkStyles}
    >
      <Typography
        sx={{
          '&:hover': {
            color: theme.palette.primary.light,
          },
          color: theme.palette.primary.main,
        }}
      >
        {ipsWithRDNS.length} Addresses
      </Typography>
    </button>
  );
};

// =============================================================================
// Utilities
// =============================================================================

// Given a range, prefix, and a list of IPs, filter out the IPs that do not fall within the IPv6 range.
export const listIPv6InRange = (
  range: string,
  prefix: number,
  ips: IPAddress[] = []
) => {
  return ips.filter((thisIP) => {
    // Only keep addresses that:
    // 1. are part of an IPv6 range or pool
    // 2. have RDNS set
    if (
      !['ipv6/pool', 'ipv6/range'].includes(thisIP.type) ||
      thisIP.rdns === null
    ) {
      // eslint-disable-next-line array-callback-return
      return;
    }

    // The ipaddr.js library throws an if it can't parse an IP address.
    // We'll wrap this in a try/catch block just in case something is malformed.
    try {
      // We need to typecast here so that the overloaded `match()` is typed correctly.
      const addr = parseIP(thisIP.address) as IPv6;
      const parsedRange = parseIP(range) as IPv6;

      return addr.match(parsedRange, prefix);
    } catch {
      return false;
    }
  });
};

// Higher-level IP address display for the IP Table.
interface IPDisplay {
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
        type: 'IPv6 – Range' as IPDisplay['type'],
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
  | 'SLAAC'
  | 'Shared';

const mapIPv4Display = (ips: IPAddress[], key: ipKey): IPDisplay[] => {
  return ips.map((ip) => ipToDisplay(ip, key));
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
  let type = '';
  type += ip.type === 'ipv4' ? 'IPv4' : 'IPv6';

  type += ' – ';

  if (key === 'Reserved') {
    type += ip.public ? 'Reserved (public)' : 'Reserved (private)';
  } else {
    type += key;
  }

  return type;
};
