import * as React from 'react';
import { Link } from 'react-router-dom';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import TableCell from 'src/components/TableCell';
import Tags from 'src/components/Tags';
import { transitionText } from 'src/features/linodes/transitions';
import LinodeStatusIndicator from '../LinodeStatusIndicator';

type ClassNames = 'root' | 'link' | 'tagWrapper' | 'loadingStatus' | 'labelWrapper';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  link: {
    display: 'block',
  },
  labelWrapper: {
    minHeight: 50,
    paddingTop: theme.spacing.unit / 4,
  },
  root: {
    width: '30%',
    '& h3': {
      transition: theme.transitions.create(['color']),
    },
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    },
  },
  tagWrapper: {
    marginTop: theme.spacing.unit / 2,
    marginLeft: theme.spacing.unit * 4,
  },
  loadingStatus: {
    marginBottom: theme.spacing.unit / 2,
  }
});

interface Props {
  loading: boolean;
  linodeId: number;
  linodeLabel: string;
  linodeStatus: Linode.LinodeStatus;
  linodeTags: string[];
  linodeRecentEvent?: Linode.Event;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const LinodeRowHeadCell: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    classes,
    linodeId,
    linodeLabel,
    linodeStatus,
    linodeTags,
    loading,
    linodeRecentEvent,
  } = props;

  const value = (linodeRecentEvent && linodeRecentEvent.percent_complete) || 1;


  return (
    <TableCell
      parentColumn="Linode"
      className={classes.root}
      rowSpan={loading ? 2 : 1}
    >
      <Link to={`/linodes/${linodeId}`} className={classes.link}>
        <Grid container wrap="nowrap" alignItems="center">
          <Grid item className="py0">
            <LinodeStatusIndicator status={linodeStatus} />
          </Grid>
          <Grid item className="py0">
            <div className={loading ? classes.labelWrapper : ''}>
              {loading && <Typography variant="body2" className={classes.loadingStatus}>
              {transitionText(linodeStatus, linodeRecentEvent)}: {value}%
              </Typography>}
              <Typography role="header" variant="h3" data-qa-label>
                {linodeLabel}
              </Typography>
            </div>
          </Grid>
        </Grid>
        <div className={classes.tagWrapper}>
          <Tags tags={linodeTags} />
        </div>
      </Link>
    </TableCell>
  );
};

const styled = withStyles(styles);

export default styled(LinodeRowHeadCell);
