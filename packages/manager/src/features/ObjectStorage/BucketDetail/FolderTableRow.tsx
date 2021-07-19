import * as React from 'react';
import { Link } from 'react-router-dom';
import Hidden from 'src/components/core/Hidden';
import { makeStyles, Theme } from 'src/components/core/styles';
import EntityIcon from 'src/components/EntityIcon';
import Grid from 'src/components/Grid';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';

const useStyles = makeStyles((theme: Theme) => ({
  manuallyCreated: {
    '&:before': {
      backgroundColor: theme.bg.lightBlue,
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
}

const FolderTableRow: React.FC<Props> = (props) => {
  const classes = useStyles();

  const { folderName, displayName, manuallyCreated } = props;

  return (
    <TableRow
      className={manuallyCreated ? classes.manuallyCreated : ''}
      key={folderName}
      ariaLabel={`Folder ${displayName}`}
    >
      <TableCell parentColumn="Object">
        <Grid container wrap="nowrap" alignItems="center">
          <Grid item className={classes.iconWrapper}>
            <EntityIcon variant="folder" size={22} />
          </Grid>
          <Grid item>
            <Link to={`?prefix=${folderName}`} className="secondaryLink">
              {displayName}
            </Link>
          </Grid>
        </Grid>
      </TableCell>
      {/* Three empty TableCells corresponding to the Size, Last Modified, and Action Menu (for ObjectTableRow) columns for formatting purposes. */}
      <TableCell />
      <Hidden smDown>
        <TableCell />
      </Hidden>
      <TableCell />
    </TableRow>
  );
};

export default React.memo(FolderTableRow);
