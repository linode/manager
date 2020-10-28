import { Disk } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import LinodeDiskActionMenu from './LinodeDiskActionMenu_CMR';

const useStyles = makeStyles((theme: Theme) => ({
  diskLabel: {
    width: '23%'
  },
  diskType: {
    width: '8%'
  },
  diskSize: {
    width: '9%'
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

  return (
    <TableRow data-qa-disk={disk.label}>
      <TableCell className={classes.diskLabel}>{disk.label}</TableCell>
      <TableCell className={classes.diskType}>{disk.filesystem}</TableCell>
      <TableCell className={classes.diskSize}>{disk.size} MB</TableCell>
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
