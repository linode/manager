import { useTypeQuery } from '@linode/queries';
import { Tooltip, TooltipIcon, Typography } from '@linode/ui';
import { Hidden } from '@linode/ui';
import { formatStorageUnits } from '@linode/utilities';
import * as React from 'react';

import Flag from 'src/assets/icons/flag.svg';
import { BackupStatus } from 'src/components/BackupStatus/BackupStatus';
import { Link } from 'src/components/Link';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { statusTooltipIcons } from 'src/features/Linodes/LinodeEntityDetailHeaderMaintenancePolicy.utils';
import { LinodeActionMenu } from 'src/features/Linodes/LinodesLanding/LinodeActionMenu/LinodeActionMenu';

import { LinodeMaintenanceText } from '../../LinodeMaintenanceText';
import { IPAddress } from '../IPAddress';
import { RegionIndicator } from '../RegionIndicator';
import { parseMaintenanceStartTime } from '../utils';
import { StyledIpTableCell } from './LinodeRow.styles';
import { LinodeStatus } from './LinodeStatus';

import type { LinodeHandlers } from '../LinodesLanding';
import type { SxProps, Theme } from '@mui/material/styles';
import type { LinodeWithMaintenance } from 'src/utilities/linodes';

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

  const { data: linodeType } = useTypeQuery(type ?? '', type !== null);

  const isBareMetalInstance = linodeType?.class === 'metal';

  const parsedMaintenanceStartTime = parseMaintenanceStartTime(
    maintenance?.start_time || maintenance?.when
  );

  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseEnter = React.useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = React.useCallback(() => {
    setIsHovered(false);
  }, []);

  const isMaintenancePendingOrScheduled =
    maintenance?.status === 'pending' || maintenance?.status === 'scheduled';

  const isMaintenanceInProgress =
    maintenance?.status === 'started' || maintenance?.status === 'in-progress';

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
      <TableCell>
        <LinodeStatus linodeId={id} linodeStatus={status} />
        {isMaintenanceInProgress && (
          <TooltipIcon
            className="ui-TooltipIcon ui-TooltipIcon-isActive"
            icon={statusTooltipIcons.active}
            sx={{ tooltip: { maxWidth: 300 } }}
            text={
              <LinodeMaintenanceText
                isOpened
                maintenanceStartTime={parsedMaintenanceStartTime}
              />
            }
            tooltipPosition="top"
          />
        )}
        {isMaintenancePendingOrScheduled && (
          <TooltipIcon
            className="ui-TooltipIcon"
            icon={
              maintenance.status === 'pending'
                ? statusTooltipIcons.pending
                : statusTooltipIcons.scheduled
            }
            sx={{ tooltip: { maxWidth: 300 } }}
            text={
              maintenance?.status === 'pending' ? (
                "This Linode's maintenance window is pending."
              ) : (
                <LinodeMaintenanceText
                  isOpened={false}
                  maintenanceStartTime={parsedMaintenanceStartTime}
                />
              )
            }
            tooltipPosition="top"
          />
        )}
      </TableCell>
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
