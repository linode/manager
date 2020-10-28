import { Disk } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import BarPercent from 'src/components/BarPercent/BarPercent_CMR';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import LinodeDiskActionMenu from './LinodeDiskActionMenu_CMR';

const useStyles = makeStyles((theme: Theme) => ({
  diskLabel: {
    width: '20%'
  },
  diskType: {
    width: '10%'
  },
  diskSize: {
    width: '30%'
  },
  actionMenu: {
    paddingTop: 0,
    paddingBottom: 0,
    '&.MuiTableCell-root': {
      paddingRight: 0
    }
  }
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

export const LinodeDiskRow: React.FC<Props> = props => {
  const classes = useStyles();
  const {
    disk,
    linodeId,
    onDelete,
    onImagize,
    onRename,
    onResize,
    readOnly
  } = props;

  const isResizing = true;

  return (
    <TableRow data-qa-disk={disk.label}>
      <TableCell className={classes.diskLabel}>{disk.label}</TableCell>
      <TableCell className={classes.diskType}>{disk.filesystem}</TableCell>

      <TableCell className={classes.diskSize}>
        {isResizing ? (
          <div>
            Resizing ({25}%)
            <BarPercent max={100} value={100 ?? 0} rounded narrow />
          </div>
        ) : (
          `${disk.size} MB`
        )}
      </TableCell>
      <TableCell className={classes.actionMenu}>
        <LinodeDiskActionMenu
          linodeStatus={status || 'offline'}
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
