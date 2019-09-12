import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import EntityIcon from 'src/components/EntityIcon';
import Grid from 'src/components/Grid';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import truncateText from 'src/utilities/truncateText';

// Keep this for when we display URL on hover
// import { generateObjectUrl } from '../utilities';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    cursor: 'pointer',
    '& div': {
      cursor: 'pointer'
    }
  },
  folderNameWrapper: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center'
  },
  folderName: {
    color: theme.palette.primary.main
  }
}));

interface Props {
  folderName: string;
  displayName: string;
}

type CombinedProps = Props & RouteComponentProps<{}>;

const FolderTableRow: React.FC<CombinedProps> = props => {
  const { folderName, displayName } = props;

  const classes = useStyles();

  const handleClick = () => {
    props.history.push({ search: `?prefix=${folderName}` });
  };

  return (
    <TableRow className={classes.root} key={folderName} rowLink={handleClick}>
      <TableCell parentColumn="Object">
        <Grid container wrap="nowrap" alignItems="center">
          <Grid item className="py0">
            <EntityIcon variant="folder" size={20} />
          </Grid>
          <Grid item>
            <div className={classes.folderNameWrapper}>
              <Typography variant="h3" className={classes.folderName}>
                {truncateText(displayName, 40)}
              </Typography>
            </div>
          </Grid>
        </Grid>
      </TableCell>
      <TableCell parentColumn="Size" />
      <TableCell parentColumn="Region" />
      <TableCell parentColumn="Last Modified" />
    </TableRow>
  );
};

export default withRouter(FolderTableRow);
