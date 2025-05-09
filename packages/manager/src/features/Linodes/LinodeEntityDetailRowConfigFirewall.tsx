import { useLinodeFirewallsQuery } from '@linode/queries';
import { Box, Chip, Tooltip, TooltipIcon, useTheme } from '@linode/ui';
import Grid from '@mui/material/Grid2';
import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { useCanUpgradeInterfaces } from 'src/hooks/useCanUpgradeInterfaces';
import { useIsLinodeInterfacesEnabled } from 'src/utilities/linodes';

import {
  StyledBox,
  StyledLabelBox,
  StyledListItem,
} from './LinodeEntityDetail.styles';
import {
  FirewallCell,
  LKEClusterCell,
} from './LinodeEntityDetailRowInterfaceFirewall';
import { DEFAULT_UPGRADE_BUTTON_HELPER_TEXT } from './LinodesDetail/LinodeConfigs/LinodeConfigs';
import { getUnableToUpgradeTooltipText } from './LinodesDetail/LinodeConfigs/UpgradeInterfaces/utils';

import type {
  InterfaceGenerationType,
  KubernetesCluster,
} from '@linode/api-v4';

interface Props {
  cluster: KubernetesCluster | undefined;
  interfaceGeneration: InterfaceGenerationType | undefined;
  linodeId: number;
  linodeLkeClusterId: null | number;
  region: string;
}

export const LinodeEntityDetailRowConfigFirewall = (props: Props) => {
  const { cluster, linodeId, linodeLkeClusterId, interfaceGeneration, region } =
    props;

  const location = useLocation();
  const history = useHistory();
  const theme = useTheme();

  const { isLinodeInterfacesEnabled } = useIsLinodeInterfacesEnabled();

  const { data: attachedFirewallData } = useLinodeFirewallsQuery(
    linodeId,
    interfaceGeneration !== 'linode'
  );
  const attachedFirewalls = attachedFirewallData?.data ?? [];
  const attachedFirewall =
    attachedFirewalls.find((firewall) => firewall.status === 'enabled') ??
    (attachedFirewalls.length > 0 ? attachedFirewalls[0] : undefined);

  const { canUpgradeInterfaces, unableToUpgradeReasons } =
    useCanUpgradeInterfaces(linodeLkeClusterId, region, interfaceGeneration);

  const unableToUpgradeTooltipText = getUnableToUpgradeTooltipText(
    unableToUpgradeReasons
  );

  const openUpgradeInterfacesDialog = () => {
    history.replace(`${location.pathname}/upgrade-interfaces`);
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
          display: 'grid',
          gridTemplateColumns: '50% 2fr',
        },
        [theme.breakpoints.down('sm')]: {
          paddingLeft: 2,
          display: 'flex',
        },
      }}
    >
      {(linodeLkeClusterId || attachedFirewall) && (
        <StyledBox>
          {linodeLkeClusterId && (
            <LKEClusterCell
              cluster={cluster}
              hideLKECellRightBorder={
                !attachedFirewall && !isLinodeInterfacesEnabled
              }
              linodeLkeClusterId={linodeLkeClusterId ?? 1}
            />
          )}
          {attachedFirewall && (
            <FirewallCell
              additionalSx={
                !isLinodeInterfacesEnabled ? { borderRight: 'unset' } : {}
              }
              cellLabel="Firewall:"
              firewall={attachedFirewall}
              hidePaddingLeft={!linodeLkeClusterId}
            />
          )}
        </StyledBox>
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
          <StyledLabelBox component="span">Interfaces:</StyledLabelBox>{' '}
          <Box component="span" sx={{ alignItems: 'center', display: 'flex' }}>
            Configuration Profile
            <span>
              <Tooltip
                slotProps={{
                  tooltip: {
                    sx: {
                      maxWidth: '260px',
                    },
                  },
                }}
                sx={{ width: '500px' }}
                title={DEFAULT_UPGRADE_BUTTON_HELPER_TEXT}
              >
                <Chip
                  aria-label="Upgrade Configuration Profile Interfaces to Linode Interfaces"
                  component="span"
                  disabled={!canUpgradeInterfaces}
                  label="UPGRADE"
                  onClick={openUpgradeInterfacesDialog}
                  size="small"
                  sx={(theme) => ({
                    backgroundColor: theme.color.tagButtonBg,
                    color: theme.tokens.color.Neutrals[80],
                    marginLeft: theme.spacingFunction(12),
                  })}
                />
              </Tooltip>
              {!canUpgradeInterfaces && unableToUpgradeTooltipText && (
                <TooltipIcon
                  status="help"
                  sxTooltipIcon={{ padding: 0 }}
                  text={unableToUpgradeTooltipText}
                />
              )}
            </span>
          </Box>
        </StyledListItem>
      )}
    </Grid>
  );
};
