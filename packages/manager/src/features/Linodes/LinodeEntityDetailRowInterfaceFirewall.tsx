import { useLinodeInterfacesQuery } from '@linode/queries';
import { useTheme } from '@linode/ui';
import Grid from '@mui/material/Grid2';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { useIsLinodeInterfacesEnabled } from 'src/utilities/linodes';

import { StyledLabelBox, StyledListItem } from './LinodeEntityDetail.styles';

import type { KubernetesCluster } from '@linode/api-v4';

interface Props {
  cluster: KubernetesCluster | undefined;
  linodeId: number;
  linodeLkeClusterId: null | number;
}

export const LinodeEntityDetailRowConfigFirewall = (props: Props) => {
  const { cluster, linodeId, linodeLkeClusterId } = props;

  const theme = useTheme();

  const { isLinodeInterfacesEnabled } = useIsLinodeInterfacesEnabled();

  const { data: linodeInterfaces } = useLinodeInterfacesQuery(linodeId);

  const nonVlanInterfaces =
    linodeInterfaces?.interfaces.filter((iface) => !iface.vlan) ?? [];

  const attachedFirewall = {
    label: 'will delete soon',
    id: 1,
  };

  if (!isLinodeInterfacesEnabled && !linodeLkeClusterId && !attachedFirewall) {
    return null;
  }

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
            ...(!attachedFirewall && !isLinodeInterfacesEnabled
              ? { borderRight: 'unset' }
              : {}),
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
      {attachedFirewall && (
        <>
          <StyledListItem
            sx={{
              ...(!isLinodeInterfacesEnabled ? { borderRight: 'unset' } : {}),
              ...(!linodeLkeClusterId ? { paddingLeft: 0 } : {}),
            }}
          >
            <StyledLabelBox component="span">
              Public Interface Firewall:
            </StyledLabelBox>{' '}
            <Link
              data-testid="assigned-firewall"
              to={`/firewalls/${attachedFirewall.id}`}
            >
              {attachedFirewall.label ?? `${attachedFirewall.id}`}
            </Link>
            &nbsp;
            {attachedFirewall && `(ID: ${attachedFirewall.id})`}
          </StyledListItem>
          <StyledListItem
            sx={{
              ...(!isLinodeInterfacesEnabled ? { borderRight: 'unset' } : {}),
              ...(!linodeLkeClusterId ? { paddingLeft: 0 } : {}),
            }}
          >
            <StyledLabelBox component="span">
              VPC Interface Firewall:
            </StyledLabelBox>{' '}
            <Link
              data-testid="assigned-firewall"
              to={`/firewalls/${attachedFirewall.id}`}
            >
              {attachedFirewall.label ?? `${attachedFirewall.id}`}
            </Link>
            &nbsp;
            {attachedFirewall && `(ID: ${attachedFirewall.id})`}
          </StyledListItem>
        </>
      )}
      {isLinodeInterfacesEnabled && (
        <StyledListItem
          sx={{
            ...(!linodeLkeClusterId && !attachedFirewall
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
