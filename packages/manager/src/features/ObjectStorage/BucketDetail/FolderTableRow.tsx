import * as React from 'react';
import { useHistory, Link } from 'react-router-dom';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import EntityIcon from 'src/components/EntityIcon';
import Grid from 'src/components/Grid';
import TableCell_PreCMR from 'src/components/TableCell';
import TableCell_CMR from 'src/components/TableCell/TableCell_CMR';
import TableRow_PreCMR from 'src/components/TableRow';
import TableRow_CMR from 'src/components/TableRow/TableRow_CMR';
import { useFlags } from 'src/hooks/useFlags';
import Hidden from 'src/components/core/Hidden';

// Keep this for when we display URL on hover
// import { generateObjectUrl } from '../utilities';

const useStyles = makeStyles((theme: Theme) => ({
  manuallyCreated: {
    '&:before': {
      backgroundColor: theme.bg.lightBlue,
    },
  },
  folderNameWrapper: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
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
  const { folderName, displayName, manuallyCreated } = props;

  const history = useHistory();

  const classes = useStyles();

  const flags = useFlags();

  const handleClick = () => {
    history.push({ search: `?prefix=${folderName}` });
  };

  const TableRow = flags.cmr ? TableRow_CMR : TableRow_PreCMR;
  const TableCell = flags.cmr ? TableCell_CMR : TableCell_PreCMR;

  return (
    <TableRow
      className={manuallyCreated ? classes.manuallyCreated : ''}
      key={folderName}
      rowLink={handleClick}
      ariaLabel={`Folder ${displayName}`}
    >
      <TableCell parentColumn="Object">
        <Grid container wrap="nowrap" alignItems="center">
          <Grid item className={classes.iconWrapper}>
            <EntityIcon variant="folder" size={22} />
          </Grid>
          <Grid item>
            {flags.cmr ? (
              <Link to={`?prefix=${folderName}`} className="secondaryLink">
                {displayName}
              </Link>
            ) : (
              <div className={classes.folderNameWrapper}>
                <Typography variant="h3" style={{ whiteSpace: 'nowrap' }}>
                  {displayName}
                </Typography>
              </div>
            )}
          </Grid>
        </Grid>
      </TableCell>
      {/* Three empty TableCells corresponding to the Size, Last Modified, and Action Menu (for ObjectTableRow) columns for formatting purposes. */}
      <TableCell />
      {flags.cmr ? (
        <Hidden smDown>
          <TableCell />
        </Hidden>
      ) : (
        <TableCell />
      )}
      <TableCell />
    </TableRow>
  );
};

export default React.memo(FolderTableRow);
