import {
  linodeQueries,
  useLinodeInterfacesQuery,
  useQueries,
} from '@linode/queries';
import { useTheme } from '@linode/ui';
import Grid from '@mui/material/Grid2';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { useIsLinodeInterfacesEnabled } from 'src/utilities/linodes';

import { StyledLabelBox, StyledListItem } from './LinodeEntityDetail.styles';
import { getLinodeInterfaceType } from './LinodesDetail/LinodeNetworking/LinodeInterfaces/utilities';

import type { LinodeInterfaceType } from './LinodesDetail/LinodeNetworking/LinodeInterfaces/utilities';
import type { Firewall, KubernetesCluster } from '@linode/api-v4';

interface Props {
  cluster: KubernetesCluster | undefined;
  linodeId: number;
  linodeLkeClusterId: null | number;
}

export const LinodeEntityDetailRowInterfaceFirewall = (props: Props) => {
  const { cluster, linodeId, linodeLkeClusterId } = props;

  const theme = useTheme();

  const { isLinodeInterfacesEnabled } = useIsLinodeInterfacesEnabled();

  const { data: linodeInterfaces } = useLinodeInterfacesQuery(linodeId);

  const nonVlanInterfaces =
    linodeInterfaces?.interfaces.filter((iface) => !iface.vlan) ?? [];

  const interfaceFirewalls = useQueries({
    queries: nonVlanInterfaces.map(
      (iface) =>
        linodeQueries.linode(linodeId)._ctx.interfaces._ctx.interface(iface.id)
          ._ctx.firewalls
    ),
    combine(result) {
      return result.reduce<Record<LinodeInterfaceType, Firewall | undefined>>(
        (acc, res, index) => {
          if (res.data) {
            const firewalls = res.data.data;
            const shownFirewall =
              (firewalls.find((firewall) => firewall.status === 'enabled') ??
              firewalls.length > 0)
                ? firewalls[0]
                : undefined;
            const iface = nonVlanInterfaces[index];
            acc[getLinodeInterfaceType(iface)] = shownFirewall;
          }
          return acc;
        },
        { VPC: undefined, Public: undefined, VLAN: undefined }
      );
    },
  });

  const publicInterfaceFirewall = interfaceFirewalls.Public;
  const vpcInterfaceFirewall = interfaceFirewalls.VPC;

  if (
    !isLinodeInterfacesEnabled &&
    !linodeLkeClusterId &&
    !publicInterfaceFirewall &&
    !vpcInterfaceFirewall
  ) {
    return null;
  }

  const hideLKECellRightBorder =
    !publicInterfaceFirewall &&
    !vpcInterfaceFirewall &&
    !isLinodeInterfacesEnabled;

  return (
    <Grid
      container
      direction="row"
      sx={{
        borderTop: `1px solid ${theme.borderColors.borderTable}`,
        padding: `${theme.spacingFunction(16)} ${theme.spacingFunction(
          16
        )} ${theme.spacingFunction(8)} ${theme.spacingFunction(16)}`,
        [theme.breakpoints.down('md')]: {
          paddingLeft: 2,
        },
      }}
    >
      {linodeLkeClusterId && (
        <StyledListItem
          sx={{
            ...(hideLKECellRightBorder ? { borderRight: 'unset' } : {}),
            paddingLeft: 0,
          }}
        >
          <StyledLabelBox component="span">LKE Cluster:</StyledLabelBox>{' '}
          <Link
            data-testid="assigned-lke-cluster-label"
            to={`/kubernetes/clusters/${linodeLkeClusterId}`}
          >
            {cluster?.label ?? `${linodeLkeClusterId}`}
          </Link>
          &nbsp;
          {cluster ? `(ID: ${linodeLkeClusterId})` : undefined}
        </StyledListItem>
      )}
      {publicInterfaceFirewall && (
        <StyledListItem
          sx={{
            ...(!linodeLkeClusterId ? { paddingLeft: 0 } : {}),
          }}
        >
          <StyledLabelBox component="span">
            Public Interface Firewall:
          </StyledLabelBox>{' '}
          <Link
            data-testid="assigned-public-firewall"
            to={`/firewalls/${publicInterfaceFirewall.id}`}
          >
            {publicInterfaceFirewall.label ?? `${publicInterfaceFirewall.id}`}
          </Link>
          &nbsp;
          {publicInterfaceFirewall && `(ID: ${publicInterfaceFirewall.id})`}
        </StyledListItem>
      )}
      {vpcInterfaceFirewall && (
        <StyledListItem
          sx={{
            ...(!linodeLkeClusterId && !publicInterfaceFirewall
              ? { paddingLeft: 0 }
              : {}),
          }}
        >
          <StyledLabelBox component="span">
            VPC Interface Firewall:
          </StyledLabelBox>{' '}
          <Link
            data-testid="assigned-vpc-firewall"
            to={`/firewalls/${vpcInterfaceFirewall.id}`}
          >
            {vpcInterfaceFirewall.label ?? `${vpcInterfaceFirewall.id}`}
          </Link>
          &nbsp;
          {vpcInterfaceFirewall && `(ID: ${vpcInterfaceFirewall.id})`}
        </StyledListItem>
      )}
      {isLinodeInterfacesEnabled && (
        <StyledListItem
          sx={{
            ...(!linodeLkeClusterId &&
            !vpcInterfaceFirewall &&
            !publicInterfaceFirewall
              ? { paddingLeft: 0 }
              : {}),
            borderRight: 'unset',
          }}
        >
          <StyledLabelBox component="span">Interfaces:</StyledLabelBox> Linode
        </StyledListItem>
      )}
    </Grid>
  );
};
