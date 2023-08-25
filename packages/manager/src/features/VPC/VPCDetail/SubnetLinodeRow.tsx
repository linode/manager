import { APIError, Firewall } from '@linode/api-v4';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { CircleProgress } from 'src/components/CircleProgress';
import { Link } from 'src/components/Link';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';
import { IPAddress } from 'src/features/Linodes/LinodesLanding/IPAddress';
import { useLinodeFirewallsQuery } from 'src/queries/linodes/firewalls';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import { capitalizeAllWords } from 'src/utilities/capitalize';

interface Props {
  linodeId: number;
}

export const SubnetLinodeRow = ({ linodeId }: Props) => {
  const {
    data: linode,
    error: linodeError,
    isLoading: linodeLoading,
  } = useLinodeQuery(linodeId);

  const {
    data: attachedFirewalls,
    error: firewallsError,
    isLoading: firewallsLoading,
  } = useLinodeFirewallsQuery(linodeId);

  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseEnter = React.useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = React.useCallback(() => {
    setIsHovered(false);
  }, []);

  if (linodeLoading || !linode) {
    return (
      <Box sx={{ marginLeft: 6 }}>
        <CircleProgress mini />
      </Box>
    );
  }

  if (linodeError) {
    return (
      <TableRow data-testid="subnet-linode-row-error">
        <TableCell colSpan={5} style={{ paddingLeft: 48 }}>
          <Box alignItems="center" display="flex">
            <ErrorOutline
              data-qa-error-icon
              sx={(theme) => ({ color: theme.color.red, marginRight: 1 })}
            />
            <Typography>
              There was an error loading{' '}
              <Link to={`/linodes/${linodeId}`}>Linode {linodeId}</Link>
            </Typography>
          </Box>
        </TableCell>
      </TableRow>
    );
  }

  const iconStatus =
    linode.status === 'running'
      ? 'active'
      : ['offline', 'stopped'].includes(status)
      ? 'inactive'
      : 'other';

  return (
    <StyledTableRow
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <StyledTableCell component="th" scope="row" sx={{ paddingLeft: 6 }}>
        <Link to={`/linodes/${linode.id}`}>{linode.label}</Link>
      </StyledTableCell>
      <StyledTableCell statusCell>
        <StatusIcon status={iconStatus} />
        {capitalizeAllWords(linode.status.replace('_', ' '))}
      </StyledTableCell>
      <StyledTableCell>{linode.id}</StyledTableCell>
      <StyledTableCell>
        <IPAddress ips={linode.ipv4} isHovered={isHovered} />
      </StyledTableCell>
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
