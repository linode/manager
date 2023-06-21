import { Disk } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import BarPercent from 'src/components/BarPercent';
import Hidden from 'src/components/core/Hidden';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { useEvents } from 'src/hooks/useEvents';
import { LinodeDiskActionMenu } from './LinodeDiskActionMenu';

const useStyles = makeStyles((theme: Theme) => ({
  diskLabel: {
    width: '20%',
  },
  diskType: {
    width: '10%',
  },
  diskSize: {
    width: '15%',
  },
  diskCreated: {
    width: '20%',
  },
  progressBar: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
  },
  bar: {
    paddingLeft: theme.spacing(),
    width: 250,
  },
}));

interface Props {
  disk: Disk;
  linodeId?: number;
  linodeStatus: string;
  readOnly: boolean;
  onRename: () => void;
  onResize: () => void;
  onImagize: () => void;
  onDelete: () => void;
}

export const LinodeDiskRow = React.memo((props: Props) => {
  const classes = useStyles();
  const { inProgressEvents } = useEvents();
  const {
    disk,
    linodeId,
    linodeStatus,
    readOnly,
    onDelete,
    onImagize,
    onRename,
    onResize,
  } = props;

  const diskEventLabelMap = {
    disk_create: 'Creating',
    disk_resize: 'Resizing',
    disk_delete: 'Deleting',
  };

  const diskEventsToShowProgressFor = Object.keys(diskEventLabelMap);

  const event = inProgressEvents.find(
    (event) =>
      event.secondary_entity?.id === disk.id &&
      diskEventsToShowProgressFor.includes(event.action)
  );

  return (
    <TableRow data-qa-disk={disk.label}>
      <TableCell className={classes.diskLabel}>{disk.label}</TableCell>
      <TableCell className={classes.diskType}>{disk.filesystem}</TableCell>
      <TableCell className={classes.diskSize}>
        {event ? (
          <div className={classes.progressBar}>
            {diskEventLabelMap[event.action]} ({event.percent_complete}%)
            <BarPercent
              className={classes.bar}
              max={100}
              value={event?.percent_complete ?? 0}
              rounded
              narrow
            />
          </div>
        ) : (
          `${disk.size} MB`
        )}
      </TableCell>
      <Hidden mdDown>
        <TableCell className={classes.diskCreated}>
          <DateTimeDisplay value={disk.created} />
        </TableCell>
      </Hidden>
      <TableCell>
        <LinodeDiskActionMenu
          linodeStatus={linodeStatus || 'offline'}
          linodeId={linodeId}
          diskId={disk.id}
          label={disk.label}
          onRename={onRename}
          onResize={onResize}
          onImagize={onImagize}
          onDelete={onDelete}
          readOnly={readOnly}
        />
      </TableCell>
    </TableRow>
  );
});
