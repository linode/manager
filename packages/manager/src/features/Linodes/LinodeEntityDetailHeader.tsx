import { Box, Button, Stack, TooltipIcon } from '@linode/ui';
import { Typography } from '@linode/ui';
import { Hidden } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { EntityHeader } from 'src/components/EntityHeader/EntityHeader';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { useVMHostMaintenanceEnabled } from 'src/features/Account/utils';
import { LinodeActionMenu } from 'src/features/Linodes/LinodesLanding/LinodeActionMenu/LinodeActionMenu';
import { ProgressDisplay } from 'src/features/Linodes/LinodesLanding/LinodeRow/LinodeRow';
import { lishLaunch } from 'src/features/Lish/lishUtils';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';
import { sendLinodeActionMenuItemEvent } from 'src/utilities/analytics/customEventAnalytics';

import { VPC_REBOOT_MESSAGE } from '../VPCs/constants';
import { StyledLink } from './LinodeEntityDetail.styles';
import { LinodeEntityDetailHeaderMaintenancePolicy } from './LinodeEntityDetailHeaderMaintenancePolicy';
import { getLinodeIconStatus } from './LinodesLanding/utils';

import type { LinodeHandlers } from './LinodesLanding/LinodesLanding';
import type {
  Config,
  LinodeBackups,
  MaintenancePolicySlug,
} from '@linode/api-v4';
import type { Linode, LinodeType } from '@linode/api-v4/lib/linodes/types';
import type { TypographyProps } from '@linode/ui';
import type { LinodeMaintenance } from 'src/utilities/linodes';

interface LinodeEntityDetailProps {
  id: number;
  isSummaryView?: boolean;
  linode: Linode;
  openTagDrawer: (tags: string[]) => void;
  variant?: TypographyProps['variant'];
}

export interface Props extends LinodeEntityDetailProps {
  handlers: LinodeHandlers;
}

// =============================================================================
// Header
// =============================================================================
export interface HeaderProps {
  backups: LinodeBackups;
  configs?: Config[];
  image: string;
  imageVendor: null | string;
  isSummaryView?: boolean;
  linodeId: number;
  linodeLabel: string;
  linodeMaintenancePolicySet: MaintenancePolicySlug | undefined;
  linodeRegionDisplay: string;
  linodeStatus: Linode['status'];
  maintenance: LinodeMaintenance | null;
  openNotificationMenu: () => void;
  progress?: number;
  transitionText?: string;
  type: LinodeType | null;
  variant?: TypographyProps['variant'];
}

interface LinodeEntityDetailHeaderProps extends HeaderProps {
  handlers: LinodeHandlers;
}

export const LinodeEntityDetailHeader = (
  props: LinodeEntityDetailHeaderProps
) => {
  const theme = useTheme();

  const {
    backups,
    configs,
    handlers,
    isSummaryView,
    linodeId,
    linodeLabel,
    linodeRegionDisplay,
    linodeStatus,
    linodeMaintenancePolicySet,
    maintenance,
    openNotificationMenu,
    progress,
    transitionText,
    type,
    variant,
  } = props;

  const { isVMHostMaintenanceEnabled } = useVMHostMaintenanceEnabled();

  const isLinodesGrantReadOnly = useIsResourceRestricted({
    grantLevel: 'read_only',
    grantType: 'linode',
    id: linodeId,
  });

  const isRunning = linodeStatus === 'running';
  const isOffline = linodeStatus === 'stopped' || linodeStatus === 'offline';

  const handleConsoleButtonClick = (id: number) => {
    sendLinodeActionMenuItemEvent('Launch Console');
    lishLaunch(id);
  };

  const isRebootNeeded = React.useMemo(
    () =>
      isRunning &&
      configs?.some((config) =>
        config.interfaces?.some(
          (linodeInterface) =>
            linodeInterface.purpose === 'vpc' && !linodeInterface.active
        )
      ),
    [configs, isRunning]
  );

  const formattedStatus = isRebootNeeded
    ? 'REBOOT NEEDED'
    : linodeStatus.replace('_', ' ').toUpperCase();
  const formattedTransitionText = (transitionText ?? '').toUpperCase();

  const hasSecondaryStatus =
    typeof progress !== 'undefined' &&
    typeof transitionText !== 'undefined' &&
    // Kind of a hacky way to avoid "CLONING | CLONING (50%)" until we add logic
    // to display "Cloning to 'destination-linode'.
    formattedTransitionText !== formattedStatus;

  const sxActionItem = {
    '&:focus': {
      color: theme.color.white,
    },
    '&:hover': {
      '&[aria-disabled="true"]': {
        color: theme.color.disabledText,
      },

      color: theme.color.white,
    },
    '&[aria-disabled="true"]': {
      background: 'transparent',
      color: theme.color.disabledText,
    },
    background: 'transparent',
    color: theme.textColors.linkActiveLight,
    font: theme.font.normal,
    fontSize: '0.875rem',
    height: theme.spacing(5),
    minWidth: 'auto',
    padding: '2px 10px',
  };

  const sxBoxFlex = {
    alignItems: 'center',
    display: 'flex',
  };

  return (
    <EntityHeader
      isSummaryView={isSummaryView}
      title={<StyledLink to={`linodes/${linodeId}`}>{linodeLabel}</StyledLink>}
      variant={variant}
    >
      <Box
        sx={(theme) => ({
          ...sxBoxFlex,
          gap: theme.spacingFunction(8),
          flexWrap: 'wrap',
          padding: `${theme.spacingFunction(6)} 0 ${theme.spacingFunction(6)} ${theme.spacingFunction(16)}`,
        })}
      >
        <Stack
          alignItems="center"
          aria-label={`Linode status ${linodeStatus}`}
          data-qa-linode-status
          direction="row"
          spacing={1.25}
        >
          <StatusIcon status={getLinodeIconStatus(linodeStatus)} />
          <Typography sx={(theme) => ({ font: theme.font.bold })}>
            {formattedStatus}
          </Typography>
        </Stack>
        {isRebootNeeded && (
          <TooltipIcon
            status="info"
            sxTooltipIcon={{
              padding: `0 ${theme.spacingFunction(4)} 0 0`,
            }}
            text={VPC_REBOOT_MESSAGE}
          />
        )}
        {isVMHostMaintenanceEnabled && (
          <LinodeEntityDetailHeaderMaintenancePolicy
            linodeMaintenancePolicySet={linodeMaintenancePolicySet}
            maintenance={maintenance}
          />
        )}
        {hasSecondaryStatus && (
          <Button
            buttonType="secondary"
            onClick={openNotificationMenu}
            sx={{ minWidth: '64px' }}
          >
            <ProgressDisplay
              progress={progress ?? 0}
              sx={{ color: 'primary.main', font: theme.font.bold }}
              text={formattedTransitionText}
            />
          </Button>
        )}
      </Box>
      <Box sx={sxBoxFlex}>
        <Hidden mdDown>
          <Button
            buttonType="primary"
            disabled={!(isRunning || isOffline) || isLinodesGrantReadOnly}
            onClick={() =>
              handlers.onOpenPowerDialog(isRunning ? 'Power Off' : 'Power On')
            }
            sx={sxActionItem}
          >
            {isRunning ? 'Power Off' : 'Power On'}
          </Button>
          <Button
            buttonType="primary"
            disabled={isOffline || isLinodesGrantReadOnly}
            onClick={() => handlers.onOpenPowerDialog('Reboot')}
            sx={sxActionItem}
          >
            Reboot
          </Button>
          <Button
            buttonType="primary"
            disabled={isLinodesGrantReadOnly}
            onClick={() => {
              handleConsoleButtonClick(linodeId);
            }}
            sx={sxActionItem}
          >
            Launch LISH Console
          </Button>
        </Hidden>
        <LinodeActionMenu
          linodeBackups={backups}
          linodeId={linodeId}
          linodeLabel={linodeLabel}
          linodeRegion={linodeRegionDisplay}
          linodeStatus={linodeStatus}
          linodeType={type ?? undefined}
          {...handlers}
        />
      </Box>
    </EntityHeader>
  );
};
