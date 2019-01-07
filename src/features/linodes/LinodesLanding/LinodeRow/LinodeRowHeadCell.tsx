import * as React from 'react';
import { Link } from 'react-router-dom';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import TableCell from 'src/components/TableCell';
import Tags from 'src/components/Tags';
import { linodeInTransition, transitionText } from 'src/features/linodes/transitions';
import LinodeStatusIndicator from '../LinodeStatusIndicator';

type ClassNames = 'root' | 'link' | 'tagWrapper' | 'loadingStatus' | 'labelWrapper' | 'status' | 'labelRow';

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
  tagWrapper: {
    marginTop: theme.spacing.unit / 2,
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


  return (
    <TableCell
      parentColumn="Linode"
      className={classes.root}
      rowSpan={loading ? 2 : 1}
    >
      <Link to={`/linodes/${linodeId}`} className={classes.link}>
        <div className={loading ? classes.labelWrapper : ''}>
          {
            linodeRecentEvent && linodeInTransition(linodeStatus, linodeRecentEvent) &&
            <ProgressDisplay
              className={classes.loadingStatus}
              text={transitionText(linodeStatus, linodeRecentEvent)}
              progress={linodeRecentEvent.percent_complete}
            />
          }
          <div className={classes.labelRow}>
            <Typography role="header" variant="h3" data-qa-label>
              {linodeLabel}
            </Typography>
            <div className={classes.status} >
              <LinodeStatusIndicator status={linodeStatus} />
            </div>
          </div>
        </div>
        <div className={classes.tagWrapper}>
          <Tags tags={linodeTags} />
        </div>
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
