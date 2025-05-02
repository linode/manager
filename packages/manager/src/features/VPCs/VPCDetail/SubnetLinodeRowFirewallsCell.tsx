import {
  useLinodeFirewallsQuery,
  useLinodeInterfaceFirewallsQuery,
} from '@linode/queries';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { TableCell } from 'src/components/TableCell';

import type { APIError, Firewall } from '@linode/api-v4';

export const ConfigInterfaceFirewallCell = (props: { linodeId: number }) => {
  const { linodeId } = props;
  const {
    data: attachedFirewalls,
    error,
    isLoading,
  } = useLinodeFirewallsQuery(linodeId);

  return (
    <TableCell>
      {getFirewallsCellString(
        attachedFirewalls?.data ?? [],
        isLoading,
        error ?? undefined
      )}
    </TableCell>
  );
};

export const LinodeInterfaceFirewallCell = (props: {
  interfaceId: number;
  linodeId: number;
}) => {
  const { linodeId, interfaceId } = props;
  // query to fetch firewalls for a Linode Interface (firewalls are attached at the interface level)
  const {
    data: attachedFirewalls,
    error,
    isLoading,
  } = useLinodeInterfaceFirewallsQuery(linodeId, interfaceId);

  return (
    <TableCell>
      {getFirewallsCellString(
        attachedFirewalls?.data ?? [],
        isLoading,
        error ?? undefined
      )}
    </TableCell>
  );
};

const getFirewallsCellString = (
  data: Firewall[],
  loading: boolean,
  error?: APIError[]
): JSX.Element | string => {
  if (loading) {
    return 'Loading...';
  }

  if (error) {
    return 'Error retrieving Firewalls';
  }

  if (data.length === 0) {
    return 'None';
  }

  return getFirewallLinks(data);
};

const getFirewallLinks = (data: Firewall[]): JSX.Element => {
  const firstThreeFirewalls = data.slice(0, 3);
  return (
    <>
      {firstThreeFirewalls.map((firewall, idx) => (
        <Link
          className="link secondaryLink"
          data-testid="firewall-row-link"
          key={firewall.id}
          to={`/firewalls/${firewall.id}`}
        >
          {idx > 0 && `, `}
          {firewall.label}
        </Link>
      ))}
      {data.length > 3 && (
        <span>
          {`, `}plus {data.length - 3} more.
        </span>
      )}
    </>
  );
};
