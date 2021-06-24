import { Disk } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import BarPercent from 'src/components/BarPercent';
import Hidden from 'src/components/core/Hidden';
import { makeStyles, Theme } from 'src/components/core/styles';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import useEvents from 'src/hooks/useEvents';
import LinodeDiskActionMenu from './LinodeDiskActionMenu';

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

export const LinodeDiskRow: React.FC<Props> = (props) => {
  const classes = useStyles();
  const { inProgressEvents } = useEvents();
  const {
    disk,
    linodeId,
    onDelete,
    onImagize,
    onRename,
    onResize,
    linodeStatus,
    readOnly,
  } = props;

  const resizeEvent = inProgressEvents.find(
    (thisEvent) =>
      thisEvent.secondary_entity?.id === disk.id &&
      ['disk_create', 'disk_resize'].includes(thisEvent.action)
  );

  return (
    <TableRow data-qa-disk={disk.label}>
      <TableCell className={classes.diskLabel}>{disk.label}</TableCell>
      <TableCell className={classes.diskType}>{disk.filesystem}</TableCell>

      <TableCell className={classes.diskSize}>
        {Boolean(resizeEvent) ? (
          <div className={classes.progressBar}>
            Resizing ({resizeEvent?.percent_complete}%)
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
      <Hidden smDown>
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
};

export default React.memo(LinodeDiskRow);
