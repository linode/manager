import { Firewall, FirewallDevice } from '@linode/api-v4/lib/firewalls';
import { APIError } from '@linode/api-v4/lib/types';
import clamp from 'clamp-js';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { Hidden } from 'src/components/Hidden';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { useFlags } from 'src/hooks/useFlags';
import { useAllFirewallDevicesQuery } from 'src/queries/firewalls';
import { capitalize } from 'src/utilities/capitalize';

import { ActionHandlers, FirewallActionMenu } from './FirewallActionMenu';
import { StyledDivWrapper, StyledSpan } from './FirewallRow.styles';

type CombinedProps = Firewall & ActionHandlers;

export const FirewallRow = React.memo((props: CombinedProps) => {
  const flags = useFlags();
  const { id, label, rules, status, ...actionHandlers } = props;

  const { data: devices, error, isLoading } = useAllFirewallDevicesQuery(id);

  let featureFlaggedDevices: FirewallDevice[] = devices ?? [];
  if (!flags.firewallNodebalancer) {
    featureFlaggedDevices =
      devices?.filter((thisDevice) => {
        return thisDevice.entity.type === 'linode';
      }) ?? [];
  }

  const count = getCountOfRules(rules);

  const truncateRef = useRef<HTMLDivElement>(null);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const applyClamp = () => {
    if (truncateRef.current) {
      clamp(truncateRef.current, { clamp: 3 });
    }
  };

  useEffect(() => {
    applyClamp();
  });

  useEffect(() => {
    applyClamp();
  }, [windowWidth]);

  return (
    <TableRow
      ariaLabel={`Firewall ${label}`}
      data-testid={`firewall-row-${id}`}
    >
      <TableCell>
        <Link tabIndex={0} to={`/firewalls/${id}`}>
          {label}
        </Link>
      </TableCell>
      <TableCell statusCell>
        <StatusIcon status={status === 'enabled' ? 'active' : 'inactive'} />
        {capitalize(status)}
      </TableCell>
      <Hidden smDown>
        <TableCell>{getRuleString(count)}</TableCell>
        <TableCell>
          {getDevicesCellString(
            featureFlaggedDevices ?? [],
            isLoading,
            truncateRef,
            error ?? undefined
          )}
        </TableCell>
      </Hidden>
      <TableCell sx={{ textAlign: 'end', whiteSpace: 'nowrap' }}>
        <FirewallActionMenu
          firewallID={id}
          firewallLabel={label}
          firewallStatus={status}
          {...actionHandlers}
        />
      </TableCell>
    </TableRow>
  );
});

/**
 *
 * outputs either
 *
 * 1 Inbound / 2 Outbound
 *
 * 1 Inbound
 *
 * 3 Outbound
 */
export const getRuleString = (count: [number, number]): string => {
  const [inbound, outbound] = count;

  let string = '';

  if (inbound !== 0 && outbound !== 0) {
    return `${inbound} Inbound / ${outbound} Outbound`;
  } else if (inbound !== 0) {
    string = `${inbound} Inbound`;
  } else if (outbound !== 0) {
    string += `${outbound} Outbound`;
  }
  return string || 'No rules';
};

export const getCountOfRules = (rules: Firewall['rules']): [number, number] => {
  return [(rules.inbound || []).length, (rules.outbound || []).length];
};

const getDevicesCellString = (
  data: FirewallDevice[],
  loading: boolean,
  ref: React.RefObject<HTMLDivElement>,
  error?: APIError[]
): JSX.Element | string => {
  if (loading) {
    return 'Loading...';
  }

  if (error) {
    return 'Error retrieving Linodes';
  }

  if (data.length === 0) {
    return 'None assigned';
  }

  return getDeviceLinks(data, ref);
};

export const getDeviceLinks = (
  data: FirewallDevice[],
  ref: React.RefObject<HTMLDivElement>
): JSX.Element => {
  return (
    <StyledDivWrapper>
      <div ref={ref}>
        {data.map((thisDevice, idx) => (
          <StyledSpan key={thisDevice.id}>
            <Link
              className="link secondaryLink"
              data-testid="firewall-row-link"
              to={`/${thisDevice.entity.type}s/${thisDevice.entity.id}`}
            >
              {thisDevice.entity.label}
            </Link>
            {idx !== data.length - 1 && ','}
          </StyledSpan>
        ))}
      </div>
    </StyledDivWrapper>
  );
};
