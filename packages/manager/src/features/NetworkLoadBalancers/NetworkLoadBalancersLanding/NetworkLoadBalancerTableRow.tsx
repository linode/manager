import { Hidden, Stack } from '@linode/ui';
import { capitalize } from '@linode/utilities';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';
import { useMemo } from 'react';

import { Link } from 'src/components/Link';
import { ShowMore } from 'src/components/ShowMore/ShowMore';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { IPAddress } from 'src/features/Linodes/LinodesLanding/IPAddress';
import { RegionIndicator } from 'src/features/Linodes/LinodesLanding/RegionIndicator';

import type { NetworkLoadBalancer } from '@linode/api-v4/lib/netloadbalancers';

export const NetworkLoadBalancerTableRow = (props: NetworkLoadBalancer) => {
  const {
    id,
    address_v4,
    address_v6,
    label,
    region,
    status,
    listeners,
    lke_cluster,
  } = props;

  // Memoize port strings to avoid recalculation
  const portStrings = useMemo(() => {
    return listeners?.map((listener) => listener.port.toString()) ?? [];
  }, [listeners]);

  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseEnter = React.useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = React.useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <TableRow
      data-qa-nlb={label}
      key={id}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <TableCell noWrap>
        <Link
          accessibleAriaLabel={label}
          to={`/netloadbalancers/${id}/listeners`}
        >
          {label}
        </Link>
      </TableCell>
      <Hidden lgDown>
        <TableCell data-qa-status statusCell>
          <StatusIcon status={status === 'active' ? 'active' : 'inactive'} />
          {capitalize(status)}
        </TableCell>
      </Hidden>
      <Hidden data-qa-id lgDown>
        <TableCell>{id}</TableCell>
      </Hidden>
      <TableCell data-qa-ports>
        <PortsDisplay ports={portStrings} />
      </TableCell>
      <TableCell data-qa-ipv4>
        <IPAddress ips={[address_v4]} isHovered={isHovered} />
      </TableCell>
      <Hidden mdDown>
        <TableCell data-qa-ipv6>
          {address_v6 ? (
            <IPAddress ips={[address_v6]} isHovered={isHovered} />
          ) : (
            'None'
          )}
        </TableCell>
      </Hidden>
      <TableCell data-qa-lke-cluster>
        {lke_cluster ? (
          <Link accessibleAriaLabel={lke_cluster.label} to={lke_cluster.url}>
            {lke_cluster.label}
          </Link>
        ) : (
          'None'
        )}
      </TableCell>
      <Hidden mdDown>
        <TableCell data-qa-region>
          <RegionIndicator region={region} />
        </TableCell>
      </Hidden>
    </TableRow>
  );
};

/**
 * Formats and displays ports with truncation when exceeding character limit.
 * Uses memoization to avoid recalculation on every render.
 * Hidden ports are accessible via ShowMore popover.
 */
const PortsDisplay = React.memo(({ ports }: { ports: string[] }) => {
  const theme = useTheme();

  const { displayText, hiddenPorts } = useMemo(() => {
    if (ports.length === 0) {
      return { displayText: 'None', hiddenPorts: [] };
    }

    const MAX_PORT_DISPLAY_CHARS = 12;
    let accumulatedLength = 0;
    let visibleCount = 0;

    // Calculate how many ports fit within the character limit
    for (let i = 0; i < ports.length; i++) {
      const portLength = ports[i].length;
      const separatorLength = i < ports.length - 1 ? 2 : 0; // ', ' = 2 chars
      const totalLength = accumulatedLength + portLength + separatorLength;

      if (totalLength > MAX_PORT_DISPLAY_CHARS && accumulatedLength > 0) {
        break;
      }

      accumulatedLength = totalLength;
      visibleCount = i + 1;
    }

    const visiblePorts = ports.slice(0, visibleCount);
    const displayText = visiblePorts.join(', ');
    const hiddenPorts = ports.slice(visibleCount);

    return { displayText, hiddenPorts };
  }, [ports]);

  if (displayText === 'None') {
    return <span>None</span>;
  }

  return (
    <Stack alignItems="center" direction="row" spacing={1}>
      <span>{displayText}</span>
      {hiddenPorts.length > 0 && (
        <ShowMore
          ariaItemType="ports"
          chipProps={{
            sx: {
              backgroundColor: theme.tokens.alias.Background.Neutralsubtle,
              color: theme.tokens.alias.Content.Text.Primary.Default,
              '&:hover, &:focus': {
                backgroundColor: theme.tokens.alias.Background.Neutralsubtle,
                color: theme.tokens.alias.Content.Text.Primary.Default,
              },
            },
          }}
          items={hiddenPorts}
          render={(hiddenPortsList) => (
            <Stack>
              {hiddenPortsList.map((port) => (
                <span key={port}>{port}</span>
              ))}
            </Stack>
          )}
        />
      )}
    </Stack>
  );
});

PortsDisplay.displayName = 'PortsDisplay';
