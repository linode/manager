import { Box, Stack } from '@linode/ui';
import { Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Button } from 'src/components/Button/Button';
import { EntityHeader } from 'src/components/EntityHeader/EntityHeader';
import { Hidden } from 'src/components/Hidden';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { LinodeActionMenu } from 'src/features/Linodes/LinodesLanding/LinodeActionMenu/LinodeActionMenu';
import { ProgressDisplay } from 'src/features/Linodes/LinodesLanding/LinodeRow/LinodeRow';
import { lishLaunch } from 'src/features/Lish/lishUtils';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';
import { sendLinodeActionMenuItemEvent } from 'src/utilities/analytics/customEventAnalytics';

import { VPC_REBOOT_MESSAGE } from '../VPCs/constants';
import { StyledLink } from './LinodeEntityDetail.styles';
import { getLinodeIconStatus } from './LinodesLanding/utils';

import type { LinodeHandlers } from './LinodesLanding/LinodesLanding';
import type { Config, LinodeBackups } from '@linode/api-v4';
import type { Linode, LinodeType } from '@linode/api-v4/lib/linodes/types';
import type { TypographyProps } from 'src/components/Typography';

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
  linodeRegionDisplay: string;
  linodeStatus: Linode['status'];
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
    openNotificationMenu,
    progress,
    transitionText,
    type,
    variant,
  } = props;

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

  const isRebootNeeded =
    isRunning &&
    configs?.some((config) =>
      config.interfaces.some(
        (linodeInterface) =>
          linodeInterface.purpose === 'vpc' && !linodeInterface.active
      )
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
    fontFamily: theme.font.normal,
    fontSize: '0.875rem',
    height: theme.spacing(5),
    minWidth: 'auto',
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
      <Box sx={sxBoxFlex}>
        <Stack
          alignItems="center"
          aria-label={`Linode status ${linodeStatus}`}
          data-qa-linode-status
          direction="row"
          spacing={1.5}
          sx={{ paddingX: 2 }}
        >
          <StatusIcon status={getLinodeIconStatus(linodeStatus)} />
          <Typography sx={(theme) => ({ fontFamily: theme.font.bold })}>
            {formattedStatus}
          </Typography>
        </Stack>
        {isRebootNeeded && (
          <TooltipIcon
            status="help"
            sxTooltipIcon={{ padding: 0 }}
            text={VPC_REBOOT_MESSAGE}
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
              sx={{ color: 'primary.main', fontFamily: theme.font.bold }}
              text={formattedTransitionText}
            />
          </Button>
        )}
      </Box>
      <Box sx={sxBoxFlex}>
        <Hidden mdDown>
          <Button
            onClick={() =>
              handlers.onOpenPowerDialog(isRunning ? 'Power Off' : 'Power On')
            }
            buttonType="primary"
            disabled={!(isRunning || isOffline) || isLinodesGrantReadOnly}
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
            onClick={() => {
              handleConsoleButtonClick(linodeId);
            }}
            buttonType="primary"
            disabled={isLinodesGrantReadOnly}
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
