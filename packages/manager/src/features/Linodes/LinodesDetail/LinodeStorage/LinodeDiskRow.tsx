import { Disk } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import BarPercent from 'src/components/BarPercent';
import { Hidden } from 'src/components/Hidden';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { useEventsInfiniteQuery } from 'src/queries/events';
import { isInProgressEvent } from 'src/utilities/eventUtils';
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

  const classes = useStyles();
  const { data: eventsData } = useEventsInfiniteQuery({
    filter: {
      'secondary_entity.id': disk.id,
    },
  });

  const diskEventLabelMap = {
    disk_create: 'Creating',
    disk_resize: 'Resizing',
    disk_delete: 'Deleting',
  };

  const diskEventsToShowProgressFor = Object.keys(diskEventLabelMap);

  const resizeEvent = eventsData?.pages
    .reduce((events, page) => [...events, ...page.data], [])
    .find(
      (event) =>
        isInProgressEvent(event) &&
        event.secondary_entity?.id === disk.id &&
        diskEventsToShowProgressFor.includes(event.action)
    );

  return (
    <TableRow data-qa-disk={disk.label}>
      <TableCell className={classes.diskLabel}>{disk.label}</TableCell>
      <TableCell className={classes.diskType}>{disk.filesystem}</TableCell>
      <TableCell className={classes.diskSize}>
        {resizeEvent ? (
          <div className={classes.progressBar}>
            {diskEventLabelMap[resizeEvent.action]} (
            {resizeEvent.percent_complete}%)
            <BarPercent
              className={classes.bar}
              max={100}
              value={resizeEvent?.percent_complete ?? 0}
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
