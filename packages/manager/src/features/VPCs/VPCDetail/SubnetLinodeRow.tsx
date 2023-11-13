import { APIError, Firewall } from '@linode/api-v4';
import { Config, Interface } from '@linode/api-v4/lib/linodes/types';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { CircleProgress } from 'src/components/CircleProgress';
import { Hidden } from 'src/components/Hidden';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
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

import { getSubnetInterfaceFromConfigs } from '../utils';
import {
  StyledActionTableCell,
  StyledTableCell,
  StyledTableHeadCell,
  StyledTableRow,
} from './SubnetLinodeRow.styles';

import type { Subnet } from '@linode/api-v4/lib/vpcs/types';

interface Props {
  handleUnassignLinode: any;
  linodeId: number;
  subnet?: Subnet;
  subnetId: number;
}

export const SubnetLinodeRow = (props: Props) => {
  const { handleUnassignLinode, linodeId, subnet, subnetId } = props;

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
        <TableCell colSpan={6}>
          <CircleProgress mini />
        </TableCell>
      </TableRow>
    );
  }

  if (linodeError) {
    return (
      <TableRow data-testid="subnet-linode-row-error">
        <TableCell colSpan={5} style={{ paddingLeft: 24 }}>
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
          {getSubnetLinodeIPv4CellString(
            configs ?? [],
            configsLoading,
            subnetId,
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
      <StyledActionTableCell actionCell>
        <InlineMenuAction
          actionText="Unassign Linode"
          onClick={() => handleUnassignLinode(subnet, linode)}
        />
      </StyledActionTableCell>
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

const getSubnetLinodeIPv4CellString = (
  configs: Config[],
  loading: boolean,
  subnetId: number,
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

  const configInterface = getSubnetInterfaceFromConfigs(configs, subnetId);
  return getIPv4Link(configInterface);
};

const getIPv4Link = (configInterface: Interface | undefined): JSX.Element => {
  return (
    <>
      {configInterface && (
        <span key={configInterface.id}>{configInterface.ipv4?.vpc}</span>
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
    <StyledTableHeadCell>Linode Label</StyledTableHeadCell>
    <StyledTableHeadCell sx={{ width: '14%' }}>Status</StyledTableHeadCell>
    <Hidden lgDown>
      <StyledTableHeadCell sx={{ width: '10%' }}>Linode ID</StyledTableHeadCell>
    </Hidden>
    <Hidden smDown>
      <StyledTableHeadCell>VPC IPv4</StyledTableHeadCell>
    </Hidden>
    <Hidden smDown>
      <StyledTableHeadCell>Firewalls</StyledTableHeadCell>
    </Hidden>
    <StyledTableHeadCell></StyledTableHeadCell>
  </TableRow>
);
