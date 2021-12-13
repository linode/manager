import { Event } from '@linode/api-v4/lib/account';
import * as React from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { compose } from 'recompose';
import Chip from 'src/components/core/Chip';
import Hidden from 'src/components/core/Hidden';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import LinearProgress from 'src/components/LinearProgress';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { formatRegion } from 'src/utilities';
import { ExtendedVolume } from './types';
import VolumesActionMenu, { ActionHandlers } from './VolumesActionMenu';

export const useStyles = makeStyles((theme: Theme) => ({
  volumePath: {
    width: '35%',
    wordBreak: 'break-all',
  },
  chipWrapper: {
    alignSelf: 'center',
  },
  chip: {
    borderRadius: 1,
    fontSize: '0.65rem',
    marginTop: 0,
    marginBottom: 0,
    marginLeft: theme.spacing(2),
    minHeight: theme.spacing(2),
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5),
  },
  forceUpgradeChip: {
    backgroundColor: theme.color.chipButton,
    '&:hover': {
      backgroundColor: theme.color.chipButtonHover,
    },
  },
  upgradePendingChip: {
    backgroundColor: 'transparent',
    border: '1px solid #ccc',
  },
  nvmeChip: {
    backgroundColor: 'transparent',
    border: '1px solid #02B159',
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
    id,
    label,
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
          alignItems="flex-end"
        >
          {isVolumesLanding ? (
            <>
              <Grid item>
                <div>{label}</div>
              </Grid>
              {isNVMe ? (
                <Grid item className={classes.chipWrapper}>
                  <Chip
                    className={`${classes.chip} ${classes.nvmeChip}`}
                    label="NVMe"
                    data-testid="nvme-chip"
                  />
                </Grid>
              ) : linodeId &&
                eligibleForUpgradeToNVMe &&
                !nvmeUpgradeScheduledByUserImminent ? (
                <Grid item className={classes.chipWrapper}>
                  <Chip
                    className={`${classes.chip} ${classes.forceUpgradeChip}`}
                    label="UPGRADE TO NVMe"
                    onClick={() => history.push(`/linodes/${linodeId}/upgrade`)}
                    data-testid="upgrade-chip"
                  />
                </Grid>
              ) : linodeId &&
                (nvmeUpgradeScheduledByUserImminent ||
                  nvmeUpgradeScheduledByUserInProgress) ? (
                <Grid item className={classes.chipWrapper}>
                  <Chip
                    className={`${classes.chip} ${classes.upgradePendingChip}`}
                    label="UPGRADE PENDING"
                    data-testid="upgrading-chip"
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
