import type { Config } from '@linode/api-v4';
import { Notification } from '@linode/api-v4/lib/account';
import { SxProps } from '@mui/system';
import * as React from 'react';

import Flag from 'src/assets/icons/flag.svg';
import { BackupStatus } from 'src/components/BackupStatus/BackupStatus';
import { Hidden } from 'src/components/Hidden';
import { Link } from 'src/components/Link';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { Tooltip } from 'src/components/Tooltip';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
import {
  getProgressOrDefault,
  linodeInTransition,
  transitionText,
} from 'src/features/Linodes/transitions';
import { notificationContext as _notificationContext } from 'src/features/NotificationCenter/NotificationContext';
import { useNotificationsQuery } from 'src/queries/accountNotifications';
import { useAllLinodeConfigsQuery } from 'src/queries/linodes/configs';
import { useVPCQuery } from 'src/queries/vpcs';
import { useTypeQuery } from 'src/queries/types';
import { useFlags } from 'src/hooks/useFlags';
import { useRecentEventForLinode } from 'src/store/selectors/recentEventForLinode';
import { capitalizeAllWords } from 'src/utilities/capitalize';
import { formatStorageUnits } from 'src/utilities/formatStorageUnits';
import { LinodeWithMaintenance } from 'src/utilities/linodes';

import { IPAddress } from '../IPAddress';
import { LinodeActionMenu } from '../LinodeActionMenu';
import { LinodeHandlers } from '../LinodesLanding';
import { RegionIndicator } from '../RegionIndicator';
import { parseMaintenanceStartTime } from '../utils';
import {
  StyledButton,
  StyledIpTableCell,
  StyledMaintenanceTableCell,
} from './LinodeRow.styles';

type Props = LinodeWithMaintenance & { handlers: LinodeHandlers };

export const LinodeRow = (props: Props) => {
  const flags = useFlags();
  const {
    backups,
    handlers,
    id,
    ipv4,
    label,
    region,
    status,
    type,
    maintenance,
  } = props;

  const notificationContext = React.useContext(_notificationContext);

  const { data: notifications } = useNotificationsQuery();

  // TODO: VPC - later if there is a way to directly get a linode's vpc, replace this
  const { data: configs } = useAllLinodeConfigsQuery(id);
  const vpcId = getVPCId(configs ?? []);
  const { data: vpc } = useVPCQuery(vpcId ?? -1, vpcId !== undefined);
  const vpcLabel = vpc?.label;

  const linodeNotifications =
    notifications?.filter(
      (notification) =>
        notification.entity?.type === 'linode' && notification.entity?.id === id
    ) ?? [];

  const { data: linodeType } = useTypeQuery(type ?? '', type !== null);

  const recentEvent = useRecentEventForLinode(id);

  const isBareMetalInstance = linodeType?.class === 'metal';

  const loading = linodeInTransition(status, recentEvent);

  const parsedMaintenanceStartTime = parseMaintenanceStartTime(
    maintenance?.when
  );

  const MaintenanceText = () => {
    return (
      <>
        This Linode&rsquo;s maintenance window opens at{' '}
        {parsedMaintenanceStartTime}. For more information, see your{' '}
        <Link to="/support/tickets?type=open">open support tickets.</Link>
      </>
    );
  };

  const iconStatus =
    status === 'running'
      ? 'active'
      : ['offline', 'stopped'].includes(status)
      ? 'inactive'
      : 'other';

  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseEnter = React.useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = React.useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <TableRow
      ariaLabel={label}
      data-qa-linode={label}
      data-qa-loading
      key={id}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{ height: 'auto' }}
    >
      <TableCell noWrap>
        <Link tabIndex={0} to={`/linodes/${id}`}>
          {label}
        </Link>
      </TableCell>
      <StyledMaintenanceTableCell
        maintenance={Boolean(maintenance)}
        data-qa-status
        statusCell
      >
        {!Boolean(maintenance) ? (
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
            </>
          ) : (
            <>
              <StatusIcon status={iconStatus} />
              {capitalizeAllWords(status.replace('_', ' '))}
            </>
          )
        ) : (
          <div style={{ alignItems: 'center', display: 'flex' }}>
            <strong>Maintenance Scheduled</strong>
            <TooltipIcon
              sx={{ tooltip: { maxWidth: 300 } }}
              interactive
              status="help"
              text={<MaintenanceText />}
              tooltipPosition="top"
            />
          </div>
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
        {flags.vpc && (
          <Hidden smDown>
            <TableCell noWrap>
              {vpcLabel && (vpcId === 0 || vpcId) && (
                <Link tabIndex={0} to={`/vpc/${vpcId}`}>
                  {vpcLabel}
                </Link>
              )}
            </TableCell>
          </Hidden>
        )}
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
          linodeNotifications={linodeNotifications}
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
  linodeNotifications: Notification[];
  mutationAvailable: boolean;
}> = (props) => {
  /*
   * Render either a flag for if the Linode has a notification
   * or if it has a pending mutation available. Mutations take
   * precedent over notifications
   */
  const { linodeNotifications, mutationAvailable } = props;

  if (mutationAvailable) {
    return (
      <Tooltip title="There is a free upgrade available for this Linode">
        <Flag />
      </Tooltip>
    );
  }
  if (linodeNotifications.length > 0) {
    return (
      // eslint-disable-next-line
      <>
        {linodeNotifications.map((notification, idx) => (
          <Tooltip key={idx} title={notification.message}>
            <Flag />
          </Tooltip>
        ))}
      </>
    );
  }
  return null;
};

const getVPCId = (configs: Config[]): number | undefined => {
  for (const config of configs) {
    for (const linodeInterface of config.interfaces) {
      if (
        linodeInterface.purpose === 'vpc' &&
        (linodeInterface.vpc_id || linodeInterface.vpc_id === 0)
      ) {
        return linodeInterface.vpc_id;
      }
    }
  }

  return undefined;
};

RenderFlag.displayName = `RenderFlag`;

export const ProgressDisplay: React.FC<{
  className?: string;
  progress: null | number;
  sx?: SxProps;
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
