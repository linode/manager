import { Event } from '@linode/api-v4/lib/account';
import { Volume } from '@linode/api-v4/lib/volumes/types';
import { Box } from 'src/components/Box';
import { makeStyles } from '@mui/styles';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { Hidden } from 'src/components/Hidden';
import { Status } from 'src/components/StatusIcon/StatusIcon';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';
import { useRegionsQuery } from 'src/queries/regions';

import VolumesActionMenu, { ActionHandlers } from './VolumesActionMenu';
// import useEvents from 'src/hooks/useEvents';

export const useStyles = makeStyles({
  chipWrapper: {
    alignSelf: 'center',
  },
  volumePath: {
    width: '35%',
    wordBreak: 'break-all',
  },
});

interface Props {
  isDetailsPageRow?: boolean;
}

export type CombinedProps = Props & Volume & ActionHandlers;

export const progressFromEvent = (e?: Event) => {
  if (!e) {
    return undefined;
  }

  if (e.status === 'started' && e.percent_complete) {
    return e.percent_complete;
  }

  return undefined;
};

export const isVolumeUpdating = (e?: Event) => {
  // Make Typescript happy, since this function can otherwise technically return undefined
  if (!e) {
    return false;
  }
  return (
    e &&
    ['volume_attach', 'volume_create', 'volume_detach'].includes(e.action) &&
    ['scheduled', 'started'].includes(e.status)
  );
};

export const volumeStatusIconMap: Record<Volume['status'], Status> = {
  active: 'active',
  creating: 'other',
  migrating: 'other',
  offline: 'inactive',
  resizing: 'other',
};

export const VolumeTableRow = React.memo((props: CombinedProps) => {
  const classes = useStyles();
  const { data: regions } = useRegionsQuery();
  const {
    filesystem_path: filesystemPath,
    handleAttach,
    handleDelete,
    handleDetach,
    id,
    isDetailsPageRow,
    label,
    linode_id: linodeId,
    linode_label,
    openForClone,
    openForConfig,
    openForEdit,
    openForResize,
    region,
    size,
    status,
    tags,
  } = props;

  const isVolumesLanding = !isDetailsPageRow;

  const regionLabel = regions?.find((r) => r.id === region)?.label ?? region;
  // const { events } = useEvents();

  // const recentEvent = events.find((event) => event.entity?.id === id);

  // Use this to show a progress bar
  // const isUpdating = isVolumeUpdating(recentEvent);
  // const progress = progressFromEvent(recentEvent);

  return (
    <TableRow data-qa-volume-cell={id} key={`volume-row-${id}`}>
      <TableCell data-qa-volume-cell-label={label}>
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'space-between',
            wrap: 'nowrap',
          }}
        >
          {label}
        </Box>
      </TableCell>
      <TableCell statusCell>
        <StatusIcon status={volumeStatusIconMap[status]} />
        {status.replace('_', ' ')}
      </TableCell>
      {isVolumesLanding && region ? (
        <TableCell data-qa-volume-region data-testid="region" noWrap>
          {regionLabel}
        </TableCell>
      ) : null}
      <TableCell data-qa-volume-size>{size} GB</TableCell>
      {!isVolumesLanding ? (
        <Hidden smDown>
          <TableCell className={classes.volumePath} data-qa-fs-path>
            {filesystemPath}
          </TableCell>
        </Hidden>
      ) : null}
      {isVolumesLanding && (
        <TableCell data-qa-volume-cell-attachment={linode_label}>
          {linodeId !== null ? (
            <Link
              className="link secondaryLink"
              to={`/linodes/${linodeId}/storage`}
            >
              {linode_label}
            </Link>
          ) : (
            <Typography data-qa-unattached>Unattached</Typography>
          )}
        </TableCell>
      )}
      <TableCell actionCell>
        <VolumesActionMenu
          /**
           * This is a safer check than linode_id (see logic in addAttachedLinodeInfoToVolume() from VolumesLanding)
           * as it actually checks to see if the Linode exists before adding linodeLabel and linodeStatus.
           * This avoids a bug (M3-2534) where a Volume attached to a just-deleted Linode
           * could sometimes get tagged as "attached" here.
           */
          attached={Boolean(linode_label)}
          filesystemPath={filesystemPath}
          handleAttach={handleAttach}
          handleDelete={handleDelete}
          handleDetach={handleDetach}
          isVolumesLanding={isVolumesLanding} // Passing this down to govern logic re: showing Attach or Detach in action menu.
          label={label}
          linodeId={linodeId ?? 0}
          linodeLabel={linode_label || ''}
          openForClone={openForClone}
          openForConfig={openForConfig}
          openForEdit={openForEdit}
          openForResize={openForResize}
          regionID={region}
          size={size}
          volumeId={id}
          volumeLabel={label}
          volumeRegion={region}
          volumeTags={tags}
        />
      </TableCell>
    </TableRow>
  );
});
