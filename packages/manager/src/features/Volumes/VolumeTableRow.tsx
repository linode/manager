import { Event } from '@linode/api-v4/lib/account';
import { Volume } from '@linode/api-v4/lib/volumes/types';
import { makeStyles } from 'tss-react/mui';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { Box } from 'src/components/Box';
import { Hidden } from 'src/components/Hidden';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { Status } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';
import { useRegionsQuery } from 'src/queries/regions';

import { ActionHandlers, VolumesActionMenu } from './VolumesActionMenu';
// import useEvents from 'src/hooks/useEvents';

// TODO jss-to-tss-react codemod: usages of this hook outside of this file will not be converted.
export const useStyles = makeStyles()({
  chipWrapper: {
    alignSelf: 'center',
  },
  volumePath: {
    width: '35%',
    wordBreak: 'break-all',
  },
});

interface Props {
  handlers: ActionHandlers;
  isDetailsPageRow?: boolean;
  volume: Volume;
}

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

export const VolumeTableRow = React.memo((props: Props) => {
  const { classes } = useStyles();
  const { data: regions } = useRegionsQuery();
  const { handlers, isDetailsPageRow, volume } = props;

  const isVolumesLanding = !isDetailsPageRow;

  const regionLabel =
    regions?.find((r) => r.id === volume.region)?.label ?? volume.region;

  // const { events } = useEvents();

  // const recentEvent = events.find((event) => event.entity?.id === id);

  // Use this to show a progress bar
  // const isUpdating = isVolumeUpdating(recentEvent);
  // const progress = progressFromEvent(recentEvent);

  return (
    <TableRow data-qa-volume-cell={volume.id} key={`volume-row-${volume.id}`}>
      <TableCell data-qa-volume-cell-label={volume.label}>
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'space-between',
            wrap: 'nowrap',
          }}
        >
          {volume.label}
        </Box>
      </TableCell>
      <TableCell statusCell>
        <StatusIcon status={volumeStatusIconMap[volume.status]} />
        {volume.status.replace('_', ' ')}
      </TableCell>
      {isVolumesLanding && volume.region ? (
        <TableCell data-qa-volume-region data-testid="region" noWrap>
          {regionLabel}
        </TableCell>
      ) : null}
      <TableCell data-qa-volume-size>{volume.size} GB</TableCell>
      {!isVolumesLanding ? (
        <Hidden smDown>
          <TableCell className={classes.volumePath} data-qa-fs-path>
            {volume.filesystem_path}
          </TableCell>
        </Hidden>
      ) : null}
      {isVolumesLanding && (
        <TableCell data-qa-volume-cell-attachment={volume.linode_label}>
          {volume.linode_id !== null ? (
            <Link
              className="link secondaryLink"
              to={`/linodes/${volume.linode_id}/storage`}
            >
              {volume.linode_label}
            </Link>
          ) : (
            <Typography data-qa-unattached>Unattached</Typography>
          )}
        </TableCell>
      )}
      <TableCell actionCell>
        <VolumesActionMenu
          handlers={handlers}
          isVolumesLanding={isVolumesLanding} // Passing this down to govern logic re: showing Attach or Detach in action menu.
          volume={volume}
        />
      </TableCell>
    </TableRow>
  );
});
