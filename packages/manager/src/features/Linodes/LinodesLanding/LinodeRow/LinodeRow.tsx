import { useTypeQuery } from '@linode/queries';
import { Tooltip, TooltipIcon, Typography } from '@linode/ui';
import { Hidden } from '@linode/ui';
import { formatStorageUnits, getFormattedStatus } from '@linode/utilities';
import * as React from 'react';

import MaintenanceScheduled from 'src/assets/icons/calendar-schedule.svg';
import MaintenancePending from 'src/assets/icons/calendar.svg';
import Flag from 'src/assets/icons/flag.svg';
import MaintenanceActive from 'src/assets/icons/load-failure.svg';
import { BackupStatus } from 'src/components/BackupStatus/BackupStatus';
import { Link } from 'src/components/Link';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { LinodeActionMenu } from 'src/features/Linodes/LinodesLanding/LinodeActionMenu/LinodeActionMenu';
import {
  getProgressOrDefault,
  linodeInTransition,
  transitionText,
} from 'src/features/Linodes/transitions';
import { notificationCenterContext as _notificationContext } from 'src/features/NotificationCenter/NotificationCenterContext';
import { useInProgressEvents } from 'src/queries/events/events';

import { IPAddress } from '../IPAddress';
import { RegionIndicator } from '../RegionIndicator';
import { getLinodeIconStatus, parseMaintenanceStartTime } from '../utils';
import {
  StyledButton,
  StyledIpTableCell,
  StyledMaintenanceTableCell,
} from './LinodeRow.styles';

import type { LinodeHandlers } from '../LinodesLanding';
import type { SxProps, Theme } from '@mui/material/styles';
import type { LinodeWithMaintenance } from 'src/utilities/linodes';

const statusTooltipIcons = {
  scheduled: <MaintenanceScheduled />,
  active: <MaintenanceActive />,
  pending: <MaintenancePending />,
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

interface Props extends LinodeWithMaintenance {
  handlers: LinodeHandlers;
}

export const LinodeRow = (props: Props) => {
  const {
    backups,
    handlers,
    id,
    ipv4,
    label,
    maintenance,
    region,
    status,
    type,
  } = props;

  const notificationContext = React.useContext(_notificationContext);

  const { data: linodeType } = useTypeQuery(type ?? '', type !== null);

  const { data: events } = useInProgressEvents();

  const recentEvent = events?.find(
    (e) => e.entity?.type === 'linode' && e.entity.id === id
  );

  const isBareMetalInstance = linodeType?.class === 'metal';

  const loading = linodeInTransition(status, recentEvent);

  const parsedMaintenanceStartTime = parseMaintenanceStartTime(
    maintenance?.start_time || maintenance?.when
  );

  const iconStatus = getLinodeIconStatus(status);

  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseEnter = React.useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = React.useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <TableRow
      data-qa-linode={label}
      data-qa-loading
      key={id}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <TableCell noWrap>
        <Link tabIndex={0} to={`/linodes/${id}`}>
          {label}
        </Link>
      </TableCell>
      <StyledMaintenanceTableCell
        data-qa-status
        maintenance={Boolean(maintenance)}
        noWrap
        statusCell
      >
        {!maintenance ? (
          loading ? (
            <>
              <StatusIcon status={iconStatus} />
              <StyledButton onClick={notificationContext.openMenu}>
                <ProgressDisplay
                  progress={getProgressOrDefault(recentEvent)}
                  sx={{ display: 'inline-block' }}
                  text={transitionText(status, id, recentEvent)}
                />
              </StyledButton>
              <TooltipIcon
                className="ui-TooltipIcon ui-TooltipIcon-isActive"
                icon={statusTooltipIcons.active}
                status="other"
                sx={{ tooltip: { maxWidth: 300 } }}
                text={
                  <MaintenanceText
                    isOpened={false}
                    maintenanceStartTime={parsedMaintenanceStartTime}
                  />
                }
                tooltipPosition="top"
              />
            </>
          ) : (
            <>
              <StatusIcon status={iconStatus} />
              {getFormattedStatus(status)}
            </>
          )
        ) : (
          <>
            <StatusIcon status={iconStatus} />
            {getFormattedStatus(status)}
            {maintenance && (
              <TooltipIcon
                className="ui-TooltipIcon"
                icon={
                  maintenance.status === 'pending'
                    ? statusTooltipIcons.pending
                    : statusTooltipIcons.scheduled
                }
                status="other"
                sx={{ tooltip: { maxWidth: 300 } }}
                text={
                  <MaintenanceText
                    isOpened
                    maintenanceStartTime={parsedMaintenanceStartTime}
                  />
                }
                tooltipPosition="top"
              />
            )}
          </>
        )}
      </StyledMaintenanceTableCell>
      <Hidden smDown>
        <TableCell noWrap>
          {linodeType ? formatStorageUnits(linodeType.label) : type}
        </TableCell>
        <StyledIpTableCell data-qa-ips>
          <IPAddress ips={ipv4} isHovered={isHovered} />
        </StyledIpTableCell>
        <Hidden lgDown>
          <TableCell data-qa-region>
            <RegionIndicator region={region} />
          </TableCell>
        </Hidden>
      </Hidden>
      <Hidden lgDown>
        <TableCell>
          <BackupStatus
            backupsEnabled={backups.enabled}
            isBareMetalInstance={isBareMetalInstance}
            linodeId={id}
            mostRecentBackup={backups.last_successful}
          />
        </TableCell>
      </Hidden>
      <TableCell actionCell data-qa-notifications>
        <RenderFlag
          mutationAvailable={
            linodeType !== undefined && linodeType?.successor !== null
          }
        />
        <LinodeActionMenu
          linodeBackups={backups}
          linodeId={id}
          linodeLabel={label}
          linodeRegion={region}
          linodeStatus={status}
          linodeType={linodeType}
          {...handlers}
          inListView
        />
      </TableCell>
    </TableRow>
  );
};

export const RenderFlag: React.FC<{
  mutationAvailable: boolean;
}> = (props) => {
  /*
   * Render either a flag for if the Linode has a notification
   * or if it has a pending mutation available. Mutations take
   * precedent over notifications
   */
  const { mutationAvailable } = props;

  if (mutationAvailable) {
    return (
      <Tooltip title="There is a free upgrade available for this Linode">
        <Flag />
      </Tooltip>
    );
  }
  return null;
};

RenderFlag.displayName = `RenderFlag`;

export const ProgressDisplay: React.FC<{
  className?: string;
  progress: null | number;
  sx?: SxProps<Theme>;
  text: string | undefined;
}> = (props) => {
  const { className, progress, sx, text } = props;
  const displayProgress = progress ? `${progress}%` : `scheduled`;

  return (
    <Typography className={className} sx={sx} variant="body1">
      {text} {displayProgress === 'scheduled' ? '(0%)' : `(${displayProgress})`}
    </Typography>
  );
};
