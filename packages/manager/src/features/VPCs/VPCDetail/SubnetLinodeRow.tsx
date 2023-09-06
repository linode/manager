import { APIError, Firewall } from '@linode/api-v4';
import { Config, Interface } from '@linode/api-v4/lib/linodes/types';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { CircleProgress } from 'src/components/CircleProgress';
import { Hidden } from 'src/components/Hidden';
import { Link } from 'src/components/Link';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';
import { getLinodeIconStatus } from 'src/features/Linodes/LinodesLanding/utils';
import { useAllLinodeConfigsQuery } from 'src/queries/linodes/configs';
import { useLinodeFirewallsQuery } from 'src/queries/linodes/firewalls';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import { capitalizeAllWords } from 'src/utilities/capitalize';

import {
  StyledTableCell,
  StyledTableHeadCell,
  StyledTableRow,
} from './SubnetLinodeRow.styles';

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

  const {
    data: configs,
    error: configsError,
    isLoading: configsLoading,
  } = useAllLinodeConfigsQuery(linodeId);

  if (linodeLoading || !linode) {
    return (
      <TableRow>
        <TableCell sx={{ marginLeft: 6 }}>
          <CircleProgress mini />
        </TableCell>
      </TableRow>
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

  const iconStatus = getLinodeIconStatus(linode.status);

  return (
    <StyledTableRow>
      <StyledTableCell component="th" scope="row" sx={{ paddingLeft: 6 }}>
        <Link to={`/linodes/${linode.id}`}>{linode.label}</Link>
      </StyledTableCell>
      <StyledTableCell statusCell>
        <StatusIcon status={iconStatus} />
        {capitalizeAllWords(linode.status.replace('_', ' '))}
      </StyledTableCell>
      <Hidden lgDown>
        <StyledTableCell>{linode.id}</StyledTableCell>
      </Hidden>
      <Hidden smDown>
        <StyledTableCell>
          {getIPv4sCellString(
            configs ?? [],
            configsLoading,
            configsError ?? undefined
          )}
        </StyledTableCell>
      </Hidden>
      <Hidden smDown>
        <StyledTableCell>
          {getFirewallsCellString(
            attachedFirewalls?.data ?? [],
            firewallsLoading,
            firewallsError ?? undefined
          )}
        </StyledTableCell>
      </Hidden>
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

const getIPv4sCellString = (
  configs: Config[],
  loading: boolean,
  error?: APIError[]
): JSX.Element | string => {
  if (loading) {
    return 'Loading...';
  }

  if (error) {
    return 'Error retrieving VPC IPv4s';
  }

  if (configs.length === 0) {
    return 'None';
  }

  const interfaces = configs
    .map((config) =>
      config.interfaces.filter((configInterface) => configInterface.ipv4?.vpc)
    )
    .flat();
  return getIPv4Links(interfaces);
};

const getIPv4Links = (data: Interface[]): JSX.Element => {
  const firstThreeInterfaces = data.slice(0, 3);
  return (
    <>
      {firstThreeInterfaces.map((configInterface, idx) => (
        <span key={configInterface.id}>
          {idx > 0 && `, `}
          {configInterface.ipv4?.vpc}
        </span>
      ))}
      {data.length > 3 && (
        <span>
          {`, `}plus {data.length - 3} more.
        </span>
      )}
    </>
  );
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

export const SubnetLinodeTableRowHead = (
  <TableRow>
    <StyledTableHeadCell sx={{ width: '24%' }}>
      Linode Label
    </StyledTableHeadCell>
    <StyledTableHeadCell sx={{ width: '14%' }}>Status</StyledTableHeadCell>
    <Hidden lgDown>
      <StyledTableHeadCell sx={{ width: '10%' }}>Linode ID</StyledTableHeadCell>
    </Hidden>
    <Hidden smDown>
      <StyledTableHeadCell sx={{ width: '20%' }}>VPC IPv4</StyledTableHeadCell>
    </Hidden>
    <Hidden smDown>
      <StyledTableHeadCell>Firewalls</StyledTableHeadCell>
    </Hidden>
  </TableRow>
);
