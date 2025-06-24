import { Box, Button, Stack, TooltipIcon } from '@linode/ui';
import { Typography } from '@linode/ui';
import { Hidden } from '@linode/ui';
import {
  LoadFailureIcon as MaintenanceActiveIcon,
  CalendarIcon as MaintenancePendingIcon,
  CalendarScheduledIcon as MaintenanceScheduledIcon,
} from '@linode/ui';
import { capitalize } from '@linode/utilities';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { EntityHeader } from 'src/components/EntityHeader/EntityHeader';
import { Link } from 'src/components/Link';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { useVMHostMaintenanceEnabled } from 'src/features/Account/utils';
import { LinodeActionMenu } from 'src/features/Linodes/LinodesLanding/LinodeActionMenu/LinodeActionMenu';
import { ProgressDisplay } from 'src/features/Linodes/LinodesLanding/LinodeRow/LinodeRow';
import { lishLaunch } from 'src/features/Lish/lishUtils';
import { StyledAutorenewIcon } from 'src/features/TopMenu/NotificationMenu/NotificationMenu';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';
import { useInProgressEvents } from 'src/queries/events/events';
import { sendLinodeActionMenuItemEvent } from 'src/utilities/analytics/customEventAnalytics';

import { VPC_REBOOT_MESSAGE } from '../VPCs/constants';
import { StyledLink } from './LinodeEntityDetail.styles';
import {
  getLinodeIconStatus,
  parseMaintenanceStartTime,
} from './LinodesLanding/utils';
import { linodeInTransition } from './transitions';

import type { LinodeHandlers } from './LinodesLanding/LinodesLanding';
import type { Config, LinodeBackups } from '@linode/api-v4';
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
  linodeMaintenancePolicy: number | undefined;
  linodeRegionDisplay: string;
  linodeStatus: Linode['status'];
  maintenance?: LinodeMaintenance | null;
  openNotificationMenu: () => void;
  progress?: number;
  transitionText?: string;
  type: LinodeType | null;
  variant?: TypographyProps['variant'];
}

interface LinodeEntityDetailHeaderProps extends HeaderProps {
  handlers: LinodeHandlers;
}

const statusTooltipIcons = {
  scheduled: <MaintenanceScheduledIcon />,
  active: <MaintenanceActiveIcon />,
  pending: <MaintenancePendingIcon />,
};

interface MaintenanceTextProps {
  isOpened?: boolean;
  maintenanceStartTime: string;
}

const MaintenanceText = ({
  isOpened = false,
  maintenanceStartTime,
}: MaintenanceTextProps) => {
  return (
    <>
      This Linode&rsquo;s maintenance window {isOpened ? 'opened' : 'opens'} at{' '}
      {maintenanceStartTime}
      {!isOpened && (
        <>
          . For more information, see your{' '}
          <Link to="/support/tickets/open">open support tickets.</Link>
        </>
      )}
      .
    </>
  );
};

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
    linodeMaintenancePolicy,
    maintenance,
    openNotificationMenu,
    progress,
    transitionText,
    type,
    variant,
  } = props;

  const { data: events } = useInProgressEvents();

  const { isVMHostMaintenanceEnabled } = useVMHostMaintenanceEnabled();

  const recentEvent = events?.find(
    (e) => e.entity?.type === 'linode' && e.entity.id === linodeId
  );

  const isTransitioning = linodeInTransition(linodeStatus, recentEvent);
  const isPendingOrScheduled =
    maintenance?.status === 'pending' || maintenance?.status === 'scheduled';

  const isInProgress =
    maintenance?.status === 'started' || maintenance?.status === 'in-progress';

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

  const parsedMaintenanceStartTime = parseMaintenanceStartTime(
    maintenance?.start_time || maintenance?.when
  );

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
          sx={{ paddingLeft: 2 }}
        >
          <StatusIcon status={getLinodeIconStatus(linodeStatus)} />
          <Typography sx={(theme) => ({ font: theme.font.bold })}>
            {formattedStatus}
          </Typography>
        </Stack>
        {isRebootNeeded && (
          <TooltipIcon
            status="help"
            sxTooltipIcon={(theme) => ({
              paddingLeft: theme.spacingFunction(6),
            })}
            text={VPC_REBOOT_MESSAGE}
          />
        )}
        {isVMHostMaintenanceEnabled && (
          <>
            <Box
              sx={(theme) => ({
                display: 'flex',
                alignItems: 'center',
                borderLeft: `1px solid ${theme.tokens.alias.Border.Normal}`,
                paddingLeft: theme.spacingFunction(16),
                gap: theme.spacingFunction(4),
              })}
            >
              <Typography
                component="span"
                sx={(theme) => ({
                  font: theme.tokens.alias.Typography.Label.Bold.S,
                })}
              >
                Maintenance Policy:
              </Typography>
              {isInProgress && (
                <StyledAutorenewIcon
                  sx={(theme) => ({
                    height: '20px',
                    width: '20px',
                    fill: theme.tokens.alias.Content.Icon.Informative,
                  })}
                />
              )}
              <Typography
                component="span"
                sx={(theme) => ({
                  color: theme.tokens.alias.Content.Text.Secondary.Default,
                })}
              >
                {linodeMaintenancePolicy ?? 'Unassigned'}
              </Typography>
              {!linodeMaintenancePolicy && (
                <TooltipIcon
                  className="ui-TooltipIcon"
                  status="info"
                  sx={{ tooltip: { maxWidth: 300 }, marginLeft: 0 }}
                  text={`This Linode's maintenance policy is not assigned. Update the default policy in the Linode settings.`}
                  tooltipPosition="top"
                />
              )}
              {isPendingOrScheduled && (
                <Typography
                  component="span"
                  sx={(theme) => ({
                    color: theme.tokens.alias.Content.Text.Secondary.Default,
                  })}
                >
                  - {capitalize(maintenance?.status ?? '')}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {isPendingOrScheduled && (
                <TooltipIcon
                  className="ui-TooltipIcon"
                  icon={
                    maintenance.status === 'pending'
                      ? statusTooltipIcons.pending
                      : statusTooltipIcons.scheduled
                  }
                  status="other"
                  sx={{ tooltip: { maxWidth: 300 }, marginLeft: 0 }}
                  text={
                    <MaintenanceText
                      isOpened
                      maintenanceStartTime={parsedMaintenanceStartTime}
                    />
                  }
                  tooltipPosition="top"
                />
              )}
              {isTransitioning && (
                <TooltipIcon
                  className="ui-TooltipIcon ui-TooltipIcon-isActive"
                  icon={statusTooltipIcons.active}
                  status="other"
                  sx={{ tooltip: { maxWidth: 300 }, marginLeft: 0 }}
                  text={
                    <MaintenanceText
                      isOpened={false}
                      maintenanceStartTime={parsedMaintenanceStartTime}
                    />
                  }
                  tooltipPosition="top"
                />
              )}
            </Box>
          </>
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
