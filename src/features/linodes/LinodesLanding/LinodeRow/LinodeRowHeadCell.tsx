import * as React from 'react';
import { Link } from 'react-router-dom';
import LinodeIcon from 'src/assets/addnewmenu/linode.svg';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import TableCell from 'src/components/TableCell';
import { linodeInTransition, transitionText } from 'src/features/linodes/transitions';
import LinodeStatusIndicator from '../LinodeStatusIndicator';

type ClassNames = 'root'
 | 'link'
 | 'loadingStatus'
 | 'labelWrapper'
 | 'linodeDescription'
 | 'status'
 | 'labelRow'
 | 'icon'
 | 'labelStatusWrapper'
 | 'statusOuter'
 | 'labelGridWrapper';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  link: {
    display: 'block',
  },
  labelWrapper: {
    minHeight: 50,
    paddingTop: theme.spacing.unit / 4,
  },
  root: {
    width: '100%',
    '& h3': {
      transition: theme.transitions.create(['color']),
    },
    [theme.breakpoints.up('xl')]: {
      width: '35%'
    },
  },
  status: {
    marginLeft: theme.spacing.unit / 2,
    position: 'relative',
    top: 0,
    lineHeight: '0.8rem',
  },
  labelRow: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
  },
  loadingStatus: {
    marginBottom: theme.spacing.unit / 2,
  },
  linodeDescription: {
    paddingTop: theme.spacing.unit / 2,
  },
  icon: {
    position: 'relative',
    top: 3,
    width: 40,
    height: 40,
    '& .circle': {
      fill: theme.bg.offWhiteDT,
    },
    '& .outerCircle': {
      stroke: theme.bg.main,
    },
  },
  labelStatusWrapper: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
  },
  statusOuter: {
    top: 0,
    position: 'relative',
    marginLeft: 4,
    lineHeight: '0.8rem',
  },
  labelGridWrapper: {
    padding: '0 4px !important',
  }
});

interface Props {
  loading: boolean;
  linodeDescription: string;
  linodeId: number;
  linodeLabel: string;
  linodeStatus: Linode.LinodeStatus;
  linodeRecentEvent?: Linode.Event;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const LinodeRowHeadCell: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    classes,
    linodeDescription,
    linodeId,
    linodeLabel,
    linodeStatus,
    loading,
    linodeRecentEvent,
  } = props;


  return (
    <TableCell
      parentColumn="Linode"
      className={classes.root}
      rowSpan={loading ? 2 : 1}
    >
      <Link to={`/linodes/${linodeId}`} className={classes.link}>
        <Grid container wrap="nowrap" alignItems="center">
          <Grid item className="py0">
            <LinodeIcon className={classes.icon}/>
          </Grid>
          <Grid item className={classes.labelGridWrapper}>
            <div className={loading ? classes.labelWrapper : ''}>
              {
                linodeRecentEvent && linodeInTransition(linodeStatus, linodeRecentEvent) &&
                <ProgressDisplay
                  className={classes.loadingStatus}
                  text={transitionText(linodeStatus, linodeRecentEvent)}
                  progress={linodeRecentEvent.percent_complete}
                />
              }
             <div className={classes.labelStatusWrapper}>
               <Typography role="header" variant="h3" data-qa-label>
                {linodeLabel}
              </Typography>
              <div className={classes.statusOuter}>
                <LinodeStatusIndicator status={linodeStatus} />
              </div>
            </div>
            <Typography className={classes.linodeDescription}>
              {linodeDescription}
            </Typography>
            </div>
          </Grid>
        </Grid>
      </Link>
    </TableCell>
  );
};

const styled = withStyles(styles);

export default styled(LinodeRowHeadCell);

const ProgressDisplay: React.StatelessComponent<{ className: string; progress: null | number; text: string }> = (props) => {
  const { progress, text, className } = props;
  const displayProgress = progress ? `${progress}%` : `scheduled`;

  return (
    <Typography variant="body2" className={className}>
      {text}: {displayProgress}
    </Typography>
  );
}
