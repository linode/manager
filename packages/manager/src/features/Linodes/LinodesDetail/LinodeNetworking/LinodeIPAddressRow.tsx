import {
  useAllIPsQuery,
  useLinodeIPsQuery,
  useLinodeQuery,
  usePreferences,
} from '@linode/queries';
import { CircleProgress, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import { parse as parseIP } from 'ipaddr.js';
import * as React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { LinkButton } from 'src/components/LinkButton';
import { TableCell } from 'src/components/TableCell';
import { StyledTableRow } from 'src/features/Linodes/LinodeEntityDetail.styles';

import { LinodeNetworkingActionMenu } from './LinodeNetworkingActionMenu';

import type { IPAddress, IPRange } from '@linode/api-v4';
import type { IPv6 } from 'ipaddr.js';
import type { IPDisplay } from 'src/features/Linodes/LinodesDetail/LinodeNetworking/LinodeIPAddresses';

export interface IPAddressRowHandlers {
  handleOpenEditRDNS: (ip: IPAddress) => void;
  handleOpenEditRDNSForRange: (range: IPRange) => void;
  handleOpenIPV6Details: (range: IPRange) => void;
  openRemoveIPDialog: (ip: IPAddress) => void;
  openRemoveIPRangeDialog: (range: IPRange) => void;
}

interface LinodeIPAddressRowProps extends IPAddressRowHandlers, IPDisplay {
  isVPCOnlyLinode: boolean;
  linodeId: number;
  readOnly: boolean;
}

export const LinodeIPAddressRow = (props: LinodeIPAddressRowProps) => {
  const {
    _ip,
    _range,
    address,
    gateway,
    handleOpenEditRDNS,
    handleOpenEditRDNSForRange,
    handleOpenIPV6Details,
    isVPCOnlyLinode,
    linodeId,
    openRemoveIPDialog,
    openRemoveIPRangeDialog,
    rdns,
    readOnly,
    subnetMask,
    type,
  } = props;

  const { data: ips } = useLinodeIPsQuery(linodeId);
  const { data: maskSensitiveDataPreference } = usePreferences(
    (preferences) => preferences?.maskSensitiveData
  );

  const isOnlyPublicIP =
    ips?.ipv4.public.length === 1 && type === 'Public – IPv4';

  return (
    <StyledTableRow
      data-qa-ip={address}
      disabled={isVPCOnlyLinode}
      key={`${address}-${type}`}
    >
      <TableCell data-qa-ip-address sx={{ whiteSpace: 'nowrap' }}>
        <CopyTooltip
          copyableText
          disabled={isVPCOnlyLinode}
          masked={Boolean(maskSensitiveDataPreference)}
          maskedTextLength={type.includes('IPv6') ? 'ipv6' : 'ipv4'}
          text={address}
        />
        {!isVPCOnlyLinode && <StyledCopyToolTip text={address} />}
      </TableCell>
      <TableCell data-qa-ip-address sx={{ whiteSpace: 'nowrap' }}>
        {type}
      </TableCell>
      <TableCell>{gateway}</TableCell>
      <TableCell>{subnetMask}</TableCell>
      <TableCell data-qa-rdns>
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
      <TableCell actionCell data-qa-action>
        {_ip ? (
          <LinodeNetworkingActionMenu
            ipAddress={_ip}
            ipType={type}
            isOnlyPublicIP={isOnlyPublicIP}
            isVPCOnlyLinode={isVPCOnlyLinode}
            onEdit={handleOpenEditRDNS}
            onRemove={openRemoveIPDialog}
            readOnly={readOnly}
          />
        ) : _range ? (
          <LinodeNetworkingActionMenu
            ipAddress={_range}
            ipType={type}
            isOnlyPublicIP={isOnlyPublicIP}
            isVPCOnlyLinode={isVPCOnlyLinode}
            onEdit={() => handleOpenEditRDNSForRange(_range)}
            onRemove={openRemoveIPRangeDialog}
            readOnly={readOnly}
          />
        ) : null}
      </TableCell>
    </StyledTableRow>
  );
};

const StyledCopyToolTip = styled(CopyTooltip, {
  label: 'StyledCopyToolTip',
})(() => ({
  '& svg': {
    height: `12px`,
    opacity: 0,
    width: `12px`,
  },
  marginLeft: 4,
  top: 1,
}));

const RangeRDNSCell = (props: {
  linodeId: number;
  onViewDetails: () => void;
  range: IPRange;
}) => {
  const { linodeId, onViewDetails, range } = props;

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
    return <CircleProgress size="sm" />;
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
    <LinkButton
      aria-label={`View the ${ipsWithRDNS.length} RDNS Addresses`}
      onClick={onViewDetails}
    >
      {ipsWithRDNS.length} Addresses
    </LinkButton>
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
