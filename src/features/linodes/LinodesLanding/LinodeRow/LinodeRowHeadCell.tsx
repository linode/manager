import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';
import LinodeIcon from 'src/assets/addnewmenu/linode.svg';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import TableCell from 'src/components/TableCell';
import withImages from 'src/containers/withImages.container';
import { linodeInTransition, transitionText } from 'src/features/linodes/transitions';
import getLinodeDescription from 'src/utilities/getLinodeDescription';
import LinodeStatusIndicator from '../LinodeStatusIndicator';
import withDisplayType, { WithDisplayType } from '../withDisplayType';

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
    paddingLeft: '4px !important',
    paddingRight: '4px !important',
  }
});

interface Props {
  backups: Linode.LinodeBackups;
  id: number;
  image: string | null;
  ipv4: string[];
  ipv6: string;
  label: string;
  region: string;
  disk: number;
  memory: number;
  vcpus: number;
  status: Linode.LinodeStatus;
  type: null | string;
  tags: string[];
  mostRecentBackup: string | null;

  loading: boolean;
  recentEvent?: Linode.Event;
}

interface WithImagesProps {
  imagesData: Linode.Image[]
}

type CombinedProps = Props
& WithDisplayType
& WithImagesProps
& WithStyles<ClassNames>;

const LinodeRowHeadCell: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    // linode props
    id,
    label,
    status,
    memory,
    disk,
    vcpus,  
    image,
    // other props
    classes,
    loading,
    recentEvent,
    displayType,
    imagesData,
  } = props;

  const description = getLinodeDescription(
    displayType,
    memory,
    disk,
    vcpus,
    image,
    imagesData,
    )


  return (
    <TableCell
      className={classes.root}
      rowSpan={loading ? 2 : 1}
    >
      <Link to={`/linodes/${id}`} className={classes.link}>
        <Grid container wrap="nowrap" alignItems="center">
          <Grid item className="py0">
            <LinodeIcon className={classes.icon}/>
          </Grid>
          <Grid item className={classes.labelGridWrapper}>
            <div className={loading ? classes.labelWrapper : ''}>
              {
                recentEvent && linodeInTransition(status, recentEvent) &&
                <ProgressDisplay
                  className={classes.loadingStatus}
                  text={transitionText(status, recentEvent)}
                  progress={recentEvent.percent_complete}
                />
              }
             <div className={classes.labelStatusWrapper}>
               <Typography role="header" variant="h3" data-qa-label>
                {label}
              </Typography>
              <div className={classes.statusOuter}>
                <LinodeStatusIndicator status={status} />
              </div>
            </div>
            <Typography className={classes.linodeDescription}>
              {description}
            </Typography>
            </div>
          </Grid>
        </Grid>
      </Link>
    </TableCell>
  );
};

const styled = withStyles(styles);
const enhanced = compose<CombinedProps, Props>(
  withDisplayType,
  styled,
  withImages((ownProps, imagesData, imagesLoading) => ({
    ...ownProps,
    imagesData: imagesData.filter(i => i.is_public === true),
  })),
)


export default enhanced(LinodeRowHeadCell);

const ProgressDisplay: React.StatelessComponent<{ className: string; progress: null | number; text: string }> = (props) => {
  const { progress, text, className } = props;
  const displayProgress = progress ? `${progress}%` : `scheduled`;

  return (
    <Typography variant="body2" className={className}>
      {text}: {displayProgress}
    </Typography>
  );
}
