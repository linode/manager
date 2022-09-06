import { Event } from '@linode/api-v4/lib/account';
import { Status } from 'src/components/StatusIcon/StatusIcon';
import * as React from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { compose } from 'recompose';
import Chip from 'src/components/core/Chip';
import Hidden from 'src/components/core/Hidden';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import LinearProgress from 'src/components/LinearProgress';
import StatusIcon from 'src/components/StatusIcon';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { formatRegion } from 'src/utilities';
import { ExtendedVolume } from './types';
import VolumesActionMenu, { ActionHandlers } from './VolumesActionMenu';
import SupportLink from 'src/components/SupportLink';

export const useStyles = makeStyles((theme: Theme) => ({
  volumePath: {
    width: '35%',
    wordBreak: 'break-all',
  },
  chipWrapper: {
    alignSelf: 'center',
  },
}));

export type CombinedProps = ExtendedVolume & ActionHandlers;

const progressFromEvent = (e?: Event) => {
  if (!e) {
    return undefined;
  }

  if (e.status === 'started' && e.percent_complete) {
    return e.percent_complete;
  }

  return undefined;
};

export const volumeStatusIconMap: Record<ExtendedVolume['status'], Status> = {
  active: 'active',
  resizing: 'other',
  creating: 'other',
  contact_support: 'error',
  deleting: 'other',
  deleted: 'inactive',
};

export const VolumeTableRow: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const {
    isUpdating,
    openForClone,
    openForConfig,
    openForEdit,
    openForResize,
    handleAttach,
    handleDelete,
    handleDetach,
    handleUpgrade,
    id,
    label,
    status,
    tags,
    size,
    recentEvent,
    region,
    hardware_type: hardwareType,
    filesystem_path: filesystemPath,
    linodeLabel,
    linode_id: linodeId,
    linodeStatus,
    eligibleForUpgradeToNVMe,
    nvmeUpgradeScheduledByUserImminent,
    nvmeUpgradeScheduledByUserInProgress,
  } = props;

  const history = useHistory();
  const location = useLocation();
  const isVolumesLanding = Boolean(location.pathname.match(/volumes/));

  const formattedRegion = formatRegion(region);

  const volumeStatusMap: Record<
    ExtendedVolume['status'],
    string | JSX.Element
  > = {
    active: 'Active',
    resizing: 'Resizing',
    creating: 'Creating',
    contact_support: (
      <SupportLink text="Contact Support" entity={{ type: 'volume_id', id }} />
    ),
    deleting: 'Deleting',
    deleted: 'Deleted',
  };

  const isNVMe = hardwareType === 'nvme';

  return isUpdating ? (
    <TableRow
      key={`volume-row-${id}`}
      data-qa-volume-loading
      className="fade-in-table"
    >
      <TableCell data-qa-volume-cell-label={label}>
        <Grid container wrap="nowrap" alignItems="center">
          <Grid item>
            <div>{label}</div>
          </Grid>
        </Grid>
      </TableCell>
      <TableCell colSpan={5}>
        <LinearProgress value={progressFromEvent(recentEvent)} />
      </TableCell>
    </TableRow>
  ) : (
    <TableRow key={`volume-row-${id}`} data-qa-volume-cell={id}>
      <TableCell data-qa-volume-cell-label={label}>
        <Grid
          container
          wrap="nowrap"
          justifyContent="space-between"
          alignItems="center"
        >
          {isVolumesLanding ? (
            <>
              <Grid item>
                <div>{label}</div>
              </Grid>
              {isNVMe ? (
                <Grid item className={classes.chipWrapper}>
                  <Chip
                    variant="outlined"
                    outlineColor="green"
                    label="NVMe"
                    data-testid="nvme-chip"
                    size="small"
                  />
                </Grid>
              ) : eligibleForUpgradeToNVMe &&
                !nvmeUpgradeScheduledByUserImminent ? (
                <Grid item className={classes.chipWrapper}>
                  <Chip
                    label="UPGRADE TO NVMe"
                    onClick={
                      linodeId
                        ? () => history.push(`/linodes/${linodeId}/upgrade`)
                        : () => handleUpgrade?.(id, label)
                    }
                    data-testid="upgrade-chip"
                    size="small"
                    clickable
                  />
                </Grid>
              ) : nvmeUpgradeScheduledByUserImminent ||
                nvmeUpgradeScheduledByUserInProgress ? (
                <Grid item className={classes.chipWrapper}>
                  <Chip
                    variant="outlined"
                    outlineColor="gray"
                    label="UPGRADE PENDING"
                    data-testid="upgrading-chip"
                    size="small"
                  />
                </Grid>
              ) : null}
            </>
          ) : (
            <Grid item>
              <div>{label}</div>
            </Grid>
          )}
        </Grid>
      </TableCell>
      {isVolumesLanding ? (
        <TableCell statusCell>
          <StatusIcon status={volumeStatusIconMap[status]} />
          {volumeStatusMap[status]}
        </TableCell>
      ) : null}
      {region ? (
        <TableCell data-qa-volume-region noWrap>
          {formattedRegion}
        </TableCell>
      ) : null}
      <TableCell data-qa-volume-size>{size} GB</TableCell>
      {!isVolumesLanding ? (
        <Hidden xsDown>
          <TableCell className={classes.volumePath} data-qa-fs-path>
            {filesystemPath}
          </TableCell>
        </Hidden>
      ) : null}
      {isVolumesLanding && (
        <TableCell data-qa-volume-cell-attachment={linodeLabel}>
          {linodeId ? (
            <Link to={`/linodes/${linodeId}`} className="link secondaryLink">
              {linodeLabel}
            </Link>
          ) : (
            <Typography data-qa-unattached>Unattached</Typography>
          )}
        </TableCell>
      )}
      <TableCell actionCell>
        <VolumesActionMenu
          onShowConfig={openForConfig}
          filesystemPath={filesystemPath}
          linodeLabel={linodeLabel || ''}
          regionID={region}
          volumeId={id}
          volumeTags={tags}
          size={size}
          label={label}
          onEdit={openForEdit}
          onResize={openForResize}
          onClone={openForClone}
          volumeLabel={label}
          /**
           * This is a safer check than linode_id (see logic in addAttachedLinodeInfoToVolume() from VolumesLanding)
           * as it actually checks to see if the Linode exists before adding linodeLabel and linodeStatus.
           * This avoids a bug (M3-2534) where a Volume attached to a just-deleted Linode
           * could sometimes get tagged as "attached" here.
           */
          attached={Boolean(linodeLabel)}
          isVolumesLanding={isVolumesLanding} // Passing this down to govern logic re: showing Attach or Detach in action menu.
          onAttach={handleAttach}
          onDetach={handleDetach}
          poweredOff={linodeStatus === 'offline'}
          onDelete={handleDelete}
        />
      </TableCell>
    </TableRow>
  );
};

export default compose<CombinedProps, ActionHandlers & ExtendedVolume>(
  React.memo
)(VolumeTableRow);
