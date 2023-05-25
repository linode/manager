import * as React from 'react';
import { Link } from 'react-router-dom';
import Hidden from 'src/components/core/Hidden';
import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';
import { EntityIcon } from 'src/components/EntityIcon/EntityIcon';
import Grid from '@mui/material/Unstable_Grid2';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { FolderActionMenu } from './FolderActionMenu';

const useStyles = makeStyles()((theme: Theme) => ({
  manuallyCreated: {
    '&:before': {
      backgroundColor: theme.bg.lightBlue1,
    },
  },
  iconWrapper: {
    margin: '2px 0',
  },
}));

interface Props {
  folderName: string;
  displayName: string;
  manuallyCreated: boolean;
  handleClickDelete: (objectName: string) => void;
}

const FolderTableRow: React.FC<Props> = (props) => {
  const { classes } = useStyles();

  const { folderName, displayName, manuallyCreated, handleClickDelete } = props;

  return (
    <TableRow
      className={manuallyCreated ? classes.manuallyCreated : ''}
      key={folderName}
      ariaLabel={`Folder ${displayName}`}
    >
      <TableCell parentColumn="Object">
        <Grid container wrap="nowrap" alignItems="center" spacing={2}>
          <Grid className={classes.iconWrapper}>
            <EntityIcon variant="folder" size={22} />
          </Grid>
          <Grid>
            <Link to={`?prefix=${folderName}`} className="secondaryLink">
              {displayName}
            </Link>
          </Grid>
        </Grid>
      </TableCell>
      {/* Three empty TableCells corresponding to the Size, Last Modified, and Action Menu (for ObjectTableRow) columns for formatting purposes. */}
      <TableCell />
      <Hidden mdDown>
        <TableCell />
      </Hidden>
      <TableCell actionCell>
        <FolderActionMenu
          handleClickDelete={handleClickDelete}
          objectName={folderName}
        />
      </TableCell>
    </TableRow>
  );
};

export default React.memo(FolderTableRow);
