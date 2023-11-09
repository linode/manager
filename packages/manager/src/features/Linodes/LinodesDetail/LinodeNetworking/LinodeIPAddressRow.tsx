import { IPAddress, IPRange } from '@linode/api-v4/lib/networking';
import { Theme, useTheme } from '@mui/material/styles';
import { IPv6, parse as parseIP } from 'ipaddr.js';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { CircleProgress } from 'src/components/CircleProgress';
import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';
import { IPDisplay } from 'src/features/Linodes/LinodesDetail/LinodeNetworking/LinodeIPAddresses';
import { useVPCConfigInterface } from 'src/hooks/useVPCConfigInterface';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import {
  useAllIPsQuery,
  useLinodeIPsQuery,
} from 'src/queries/linodes/networking';

import { StyledActionTableCell } from './LinodeIPAddresses.styles';
import { LinodeNetworkingActionMenu } from './LinodeNetworkingActionMenu';

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

export interface IPAddressRowHandlers {
  handleOpenEditRDNS: (ip: IPAddress) => void;
  handleOpenEditRDNSForRange: (range: IPRange) => void;
  handleOpenIPV6Details: (range: IPRange) => void;
  openRemoveIPDialog: (ip: IPAddress) => void;
  openRemoveIPRangeDialog: (range: IPRange) => void;
}

interface Props {
  linodeId: number;
  readOnly: boolean;
}

type CombinedProps = IPDisplay & IPAddressRowHandlers & Props;

export const LinodeIPAddressRow = (props: CombinedProps) => {
  const {
    _ip,
    _range,
    address,
    gateway,
    handleOpenEditRDNS,
    handleOpenEditRDNSForRange,
    handleOpenIPV6Details,
    linodeId,
    openRemoveIPDialog,
    openRemoveIPRangeDialog,
    rdns,
    readOnly,
    subnetMask,
    type,
  } = props;

  const { classes } = useStyles();
  const { isVPCOnlyLinode } = useVPCConfigInterface(linodeId);
  const { data: ips } = useLinodeIPsQuery(linodeId);

  // TODO: in order to fully get rid of makeStyles for this file, may need to convert this to a functional component
  // rather than function inside this component >> will look into during part 2 of this ticket
  const isOnlyPublicIP =
    ips?.ipv4.public.length === 1 && type === 'IPv4 – Public';

  const disabled = isVPCOnlyLinode && type === 'IPv4 – Public';

  return (
    <TableRow
      className={classes.row}
      data-qa-ip={address}
      disabled={disabled}
      key={`${address}-${type}`}
    >
      <TableCell
        data-qa-ip-address
        parentColumn="Address"
        sx={{ whiteSpace: 'nowrap' }}
      >
        <CopyTooltip copyableText disabled={disabled} text={address} />
        {!isVPCOnlyLinode ||
          (type !== 'IPv4 – Public' && (
            <CopyTooltip className={classes.copy} text={address} />
          ))}
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
            linodeId={linodeId}
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
            disabled={disabled}
            ipAddress={_ip}
            ipType={type}
            isOnlyPublicIP={isOnlyPublicIP}
            onEdit={handleOpenEditRDNS}
            onRemove={openRemoveIPDialog}
            readOnly={readOnly}
          />
        ) : _range ? (
          <LinodeNetworkingActionMenu
            disabled={disabled}
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
