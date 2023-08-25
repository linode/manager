import { APIError, Firewall } from '@linode/api-v4';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { useLinodeFirewallsQuery } from 'src/queries/linodes/firewalls';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import { capitalizeAllWords } from 'src/utilities/capitalize';
interface Props {
  linodeId: number;
}

export const SubnetLinodeRow = (props: Props) => {
  const { linodeId } = props;
  const { data: linode } = useLinodeQuery(linodeId);
  const {
    data: attachedFirewalls,
    error: firewallsError,
    isLoading: firewallsLoading,
  } = useLinodeFirewallsQuery(linodeId);

  if (!linode) {
    return null;
  }

  const iconStatus =
    linode.status === 'running'
      ? 'active'
      : ['offline', 'stopped'].includes(status)
      ? 'inactive'
      : 'other';

  return (
    <StyledTableRow>
      <StyledTableCell component="th" scope="row" sx={{ paddingLeft: 6 }}>
        <Link to={`/linodes/${linode.id}`}>{linode.label}</Link>
      </StyledTableCell>
      <StyledTableCell statusCell>
        <StatusIcon status={iconStatus} />
        {capitalizeAllWords(linode.status.replace('_', ' '))}
      </StyledTableCell>
      <StyledTableCell>{linode.id}</StyledTableCell>
      <StyledTableCell>{linode.ipv4}</StyledTableCell>
      <StyledTableCell>
        {getFirewallsCellString(
          attachedFirewalls?.data ?? [],
          firewallsLoading,
          firewallsError ?? undefined
        )}
      </StyledTableCell>
    </StyledTableRow>
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

export const getFirewallLinks = (data: Firewall[]): JSX.Element => {
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

const StyledTableRow = styled(TableRow, {
  label: 'StyledTableRow',
})(({ theme }) => ({
  '&:last-of-type': {
    '& th, td': {
      borderBottom: `1px solid ${theme.borderColors.borderTable}`,
    },
  },
}));

const StyledTableCell = styled(TableCell, {
  label: 'StyledTableCell',
})(() => ({
  '&:last-of-type': {
    paddingRight: 16,
  },
  border: 'none',
}));

const StyledTableHeadCell = styled(TableCell, {
  label: 'StyledTableCell',
})(({ theme }) => ({
  '&:first-of-type': {
    paddingLeft: 48,
  },
  borderBottom: `1px solid ${theme.borderColors.borderTable} !important`,
  borderTop: 'none !important',
}));

export const SubnetLinodeTableRowHead = (
  <TableRow>
    <StyledTableHeadCell sx={{ width: '24%' }}>
      Linode Label
    </StyledTableHeadCell>
    <StyledTableHeadCell sx={{ width: '14%' }}>Status</StyledTableHeadCell>
    <StyledTableHeadCell sx={{ width: '10%' }}>Linode ID</StyledTableHeadCell>
    <StyledTableHeadCell sx={{ width: '20%' }}>
      Private IP Address
    </StyledTableHeadCell>
    <StyledTableHeadCell>Firewalls</StyledTableHeadCell>
  </TableRow>
);
