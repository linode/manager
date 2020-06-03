import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import EntityIcon from 'src/components/EntityIcon';
import Grid from 'src/components/Grid';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';

// Keep this for when we display URL on hover
// import { generateObjectUrl } from '../utilities';

const useStyles = makeStyles((theme: Theme) => ({
  manuallyCreated: {
    '&:before': {
      backgroundColor: theme.bg.lightBlue
    }
  },
  folderNameWrapper: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center'
  },
  iconWrapper: {
    margin: '2px 0'
  }
}));

interface Props {
  folderName: string;
  displayName: string;
  manuallyCreated: boolean;
}

const FolderTableRow: React.FC<Props> = props => {
  const { folderName, displayName, manuallyCreated } = props;

  const history = useHistory();

  const classes = useStyles();

  const handleClick = () => {
    history.push({ search: `?prefix=${folderName}` });
  };

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
            <div className={classes.folderNameWrapper}>
              <Typography variant="h3" style={{ whiteSpace: 'nowrap' }}>
                {displayName}
              </Typography>
            </div>
          </Grid>
        </Grid>
      </TableCell>
      <TableCell parentColumn="Size" />
      <TableCell parentColumn="Last Modified" />
      {/* Empty TableCell for Action Menu (for ObjectTableRow).*/}
      <TableCell />
    </TableRow>
  );
};

export default React.memo(FolderTableRow);
