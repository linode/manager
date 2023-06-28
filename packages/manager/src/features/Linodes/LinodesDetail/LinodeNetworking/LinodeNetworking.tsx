import { LinodeIPsResponse } from '@linode/api-v4/lib/linodes';
import { IPAddress, IPRange } from '@linode/api-v4/lib/networking';
import { IPv6, parse as parseIP } from 'ipaddr.js';
import * as React from 'react';
import AddNewLink from 'src/components/AddNewLink';
import { Button } from 'src/components/Button/Button';
import { CircleProgress } from 'src/components/CircleProgress';
import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import Hidden from 'src/components/core/Hidden';
import Paper from 'src/components/core/Paper';
import { makeStyles } from 'tss-react/mui';
import { Theme, useTheme } from '@mui/material/styles';
import { TableBody } from 'src/components/TableBody';
import { TableHead } from 'src/components/TableHead';
import { Typography } from 'src/components/Typography';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import OrderBy from 'src/components/OrderBy';
import { Table } from 'src/components/Table';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { LinodePermissionsError } from '../LinodePermissionsError';
import AddIPDrawer from './AddIPDrawer';
import { EditIPRDNSDrawer } from './EditIPRDNSDrawer';
import IPSharing from './IPSharing';
import IPTransfer from './IPTransfer';
import LinodeNetworkingActionMenu from './LinodeNetworkingActionMenu';
import LinodeNetworkingSummaryPanel from './NetworkingSummaryPanel';
import { IPTypes } from './types';
import { ViewIPDrawer } from './ViewIPDrawer';
import { ViewRangeDrawer } from './ViewRangeDrawer';
import ViewRDNSDrawer from './ViewRDNSDrawer';
import Grid from '@mui/material/Unstable_Grid2';
import {
  useAllIPsQuery,
  useLinodeIPsQuery,
} from 'src/queries/linodes/networking';
import { useParams } from 'react-router-dom';
import { EditRangeRDNSDrawer } from './EditRangeRDNSDrawer';
import { DeleteIPDialog } from './DeleteIPDialog';
import { DeleteRangeDialog } from './DeleteRangeDialog';
import { useLinodeQuery } from 'src/queries/linodes/linodes';

const useStyles = makeStyles<void, 'copy'>()(
  (theme: Theme, _params, classes) => ({
    root: {
      backgroundColor: theme.color.white,
      margin: 0,
      width: '100%',
    },
    headline: {
      marginTop: 8,
      marginBottom: 8,
      marginLeft: 15,
      lineHeight: '1.5rem',
    },
    addNewWrapper: {
      [theme.breakpoints.down('sm')]: {
        marginLeft: `-${theme.spacing(1.5)}`,
        marginTop: `-${theme.spacing(1)}`,
      },
      '&.MuiGrid-item': {
        padding: 5,
      },
    },
    action: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: 0,
      '& a': {
        marginRight: theme.spacing(1),
      },
      paddingRight: `0px !important`,
    },
    multipleRDNSButton: {
      ...theme.applyLinkStyles,
    },
    multipleRDNSText: {},
    row: {
      [`&:hover .${classes.copy} > svg, & .${classes.copy}:focus > svg`]: {
        opacity: 1,
      },
    },
    ipAddress: {
      whiteSpace: 'nowrap',
    },
    copy: {
      marginLeft: 4,
      top: 1,
      '& svg': {
        height: `12px`,
        width: `12px`,
        opacity: 0,
      },
    },
  })
);

export const ipv4TableID = 'ips';

const LinodeNetworking = () => {
  const readOnly = false;
  const { classes } = useStyles();
  const { linodeId } = useParams<{ linodeId: string }>();
  const id = Number(linodeId);
  const { data: ips, isLoading, error } = useLinodeIPsQuery(id);

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
    const { address, type, gateway, subnetMask, rdns, _ip, _range } = ipDisplay;

    return (
      <TableRow
        key={`${address}-${type}`}
        className={classes.row}
        data-qa-ip={address}
      >
        <TableCell
          parentColumn="Address"
          className={classes.ipAddress}
          data-qa-ip-address
        >
          <CopyTooltip text={address} copyableText />
          <CopyTooltip className={classes.copy} text={address} />
        </TableCell>
        <TableCell parentColumn="Type" data-qa-ip-address>
          {type}
        </TableCell>
        <TableCell parentColumn="Default Gateway">{gateway}</TableCell>
        <TableCell parentColumn="Subnet Mask">{subnetMask}</TableCell>
        <TableCell parentColumn="Reverse DNS" data-qa-rdns>
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
        <TableCell className={classes.action} data-qa-action>
          {_ip ? (
            <LinodeNetworkingActionMenu
              onEdit={handleOpenEditRDNS}
              ipType={type}
              ipAddress={_ip}
              onRemove={openRemoveIPDialog}
              readOnly={readOnly}
            />
          ) : _range ? (
            <LinodeNetworkingActionMenu
              ipType={type}
              ipAddress={_range}
              onEdit={() => handleOpenEditRDNSForRange(_range)}
              onRemove={openRemoveIPRangeDialog}
              readOnly={readOnly}
            />
          ) : null}
        </TableCell>
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
        <Grid
          container
          justifyContent="space-between"
          alignItems="flex-end"
          className={classes.root}
          spacing={1}
        >
          <Grid className="p0">
            <Typography variant="h3" className={classes.headline}>
              IP Addresses
            </Typography>
          </Grid>
          <Grid className={classes.addNewWrapper}>
            <Hidden smDown>
              <Button
                onClick={() => setIsTransferDialogOpen(true)}
                buttonType="secondary"
              >
                IP Transfer
              </Button>
              <Button
                style={{ marginRight: 16 }}
                onClick={() => setIsShareDialogOpen(true)}
                buttonType="secondary"
              >
                IP Sharing
              </Button>
            </Hidden>
            <AddNewLink
              label="Add an IP Address"
              onClick={() => setIsAddDrawerOpen(true)}
            />
          </Grid>
        </Grid>
        <Paper style={{ padding: 0 }}>
          {/* @todo: It'd be nice if we could always sort by public -> private. */}
          <OrderBy data={ipDisplay} orderBy="type" order="asc">
            {({ data: orderedData, handleOrderChange, order, orderBy }) => {
              return (
                <Table aria-label="IPv4 Addresses" id={ipv4TableID}>
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ width: '15%' }}>Address</TableCell>
                      <TableSortCell
                        style={{ width: '10%' }}
                        label="type"
                        direction={order}
                        active={orderBy === 'type'}
                        handleClick={handleOrderChange}
                      >
                        Type
                      </TableSortCell>
                      <TableCell style={{ width: '10%' }}>
                        Default Gateway
                      </TableCell>
                      <TableCell style={{ width: '10%' }}>
                        Subnet Mask
                      </TableCell>
                      <TableCell style={{ width: '20%', borderRight: 'none' }}>
                        Reverse DNS
                      </TableCell>
                      <TableCell style={{ width: '20%', borderLeft: 'none' }} />
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
        open={isIPDrawerOpen}
        onClose={() => setIsIPDrawerOpen(false)}
        ip={selectedIP}
      />
      <ViewRangeDrawer
        open={isRangeDrawerOpen}
        onClose={() => setIsRangeDrawerOpen(false)}
        range={selectedRange}
      />
      <EditIPRDNSDrawer
        open={isIpRdnsDrawerOpen}
        onClose={() => setIsIpRdnsDrawerOpen(false)}
        ip={selectedIP}
      />
      <EditRangeRDNSDrawer
        open={isRangeRdnsDrawerOpen}
        onClose={() => setIsRangeRdnsDrawerOpen(false)}
        range={selectedRange}
        linodeId={id}
      />
      <ViewRDNSDrawer
        open={isViewRDNSDialogOpen}
        onClose={() => setIsViewRDNSDialogOpen(false)}
        linodeId={id}
        selectedRange={selectedRange}
      />
      <AddIPDrawer
        open={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
        linodeId={id}
        readOnly={readOnly}
      />
      <IPTransfer
        open={isTransferDialogOpen}
        onClose={() => setIsTransferDialogOpen(false)}
        linodeId={id}
        readOnly={readOnly}
      />
      <IPSharing
        open={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        linodeId={id}
        readOnly={readOnly}
      />
      {selectedIP && (
        <DeleteIPDialog
          onClose={() => setIsDeleteIPDialogOpen(false)}
          address={selectedIP.address}
          open={isDeleteIPDialogOpen}
          linodeId={id}
        />
      )}
      {selectedRange && (
        <DeleteRangeDialog
          onClose={() => setIsDeleteRangeDialogOpen(false)}
          range={selectedRange}
          open={isDeleteRangeDialogOpen}
        />
      )}
    </div>
  );
};

export default LinodeNetworking;

const RangeRDNSCell = (props: {
  range: IPRange;
  linodeId: number;
  onViewDetails: () => void;
}) => {
  const { range, linodeId, onViewDetails } = props;
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
    return <CircleProgress noPadding mini />;
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
      style={theme.applyLinkStyles}
      onClick={onViewDetails}
      aria-label={`View the ${ipsWithRDNS.length} RDNS Addresses`}
    >
      <Typography
        sx={{
          color: theme.palette.primary.main,
          '&:hover': {
            color: theme.palette.primary.light,
          },
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
      !['ipv6/range', 'ipv6/pool'].includes(thisIP.type) ||
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
  address: string;
  type: IPTypes;
  gateway: string;
  subnetMask: string;
  rdns: string;
  // Not for display, but useful for lower-level components.
  _ip?: IPAddress;
  _range?: IPRange;
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
        type: 'IPv6 – Range' as IPDisplay['type'],
        address: `${thisIP.range}/${thisIP.prefix}`,
        gateway: '',
        subnetMask: '',
        rdns: '',
        _range: thisIP,
      };
    })
  );

  return ipDisplay;
};

type ipKey =
  | 'Public'
  | 'Private'
  | 'Reserved'
  | 'Shared'
  | 'SLAAC'
  | 'Link Local';

const mapIPv4Display = (ips: IPAddress[], key: ipKey): IPDisplay[] => {
  return ips.map((ip) => ipToDisplay(ip, key));
};

const ipToDisplay = (ip: IPAddress, key: ipKey): IPDisplay => {
  return {
    address: ip.address,
    gateway: ip.gateway ?? '',
    subnetMask: ip.subnet_mask ?? '',
    rdns: ip.rdns ?? '',
    type: createType(ip, key) as IPTypes,
    _ip: ip,
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
