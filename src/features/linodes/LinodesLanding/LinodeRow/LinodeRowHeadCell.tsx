import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import EntityIcon from 'src/components/EntityIcon';
import Grid from 'src/components/Grid';
import TableCell from 'src/components/TableCell';
import withImages from 'src/containers/withImages.container';
import {
  linodeInTransition,
  transitionText
} from 'src/features/linodes/transitions';
import getLinodeDescription from 'src/utilities/getLinodeDescription';
import withDisplayType, { WithDisplayType } from '../withDisplayType';

type ClassNames =
  | 'root'
  | 'link'
  | 'loadingStatus'
  | 'labelWrapper'
  | 'status'
  | 'labelRow'
  | 'labelStatusWrapper'
  | 'dashboard'
  | 'wrapHeader';

const styles = (theme: Theme) =>
  createStyles({
    link: {
      display: 'block'
    },
    labelWrapper: {
      minHeight: 50,
      paddingTop: theme.spacing(1) / 4
    },
    root: {
      '& h3': {
        transition: theme.transitions.create(['color'])
      },
      [theme.breakpoints.up('lg')]: {
        width: '40%'
      },
      [theme.breakpoints.up('xl')]: {
        width: '35%'
      }
    },
    dashboard: {
      width: '70%'
    },
    status: {
      marginLeft: theme.spacing(1) / 2,
      position: 'relative',
      top: 0,
      lineHeight: '0.8rem'
    },
    labelRow: {
      display: 'flex',
      flexFlow: 'row nowrap',
      alignItems: 'center'
    },
    loadingStatus: {
      marginBottom: theme.spacing(1) / 2
    },
    labelStatusWrapper: {
      display: 'flex',
      flexFlow: 'row nowrap',
      alignItems: 'center'
    },
    wrapHeader: {
      wordBreak: 'break-all'
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
  width?: number;
  loading: boolean;
  recentEvent?: Linode.Event;
  maintenance?: string | null;
}

interface WithImagesProps {
  imagesData: Linode.Image[];
}

type CombinedProps = Props &
  WithDisplayType &
  WithImagesProps &
  WithStyles<ClassNames>;

const LinodeRowHeadCell: React.StatelessComponent<CombinedProps> = props => {
  const {
    // linode props
    label,
    status,
    memory,
    disk,
    vcpus,
    id,
    image,
    // other props
    classes,
    loading,
    recentEvent,
    displayType,
    imagesData,
    width,
    maintenance
  } = props;

  const description = getLinodeDescription(
    displayType,
    memory,
    disk,
    vcpus,
    image,
    imagesData
  );

  const style = width ? { width: `${width}%` } : {};

  return (
    <TableCell className={classes.root} style={style} rowSpan={loading ? 2 : 1}>
      <Grid container wrap="nowrap" alignItems="center">
        <Grid item className="py0">
          <EntityIcon
            variant="linode"
            status={!maintenance ? status : 'maintenance'}
            loading={linodeInTransition(status, recentEvent)}
            marginTop={1}
          />
        </Grid>
        <Grid item>
          <div className={loading ? classes.labelWrapper : ''}>
            {recentEvent && linodeInTransition(status, recentEvent) && (
              <ProgressDisplay
                className={classes.loadingStatus}
                text={transitionText(status, recentEvent)}
                progress={recentEvent.percent_complete}
              />
            )}
            <div className={classes.labelStatusWrapper}>
              <Link to={`/linodes/${id}`} tabIndex={-1}>
                <Typography
                  variant="h3"
                  className={classes.wrapHeader}
                  data-qa-label
                >
                  {label}
                </Typography>
              </Link>
            </div>
            <Typography>{description}</Typography>
          </div>
        </Grid>
      </Grid>
    </TableCell>
  );
};

const styled = withStyles(styles);
const enhanced = compose<CombinedProps, Props>(
  withDisplayType,
  withImages((ownProps, imagesData, imagesLoading) => ({
    ...ownProps,
    imagesData: imagesData.filter(i => i.is_public === true)
  })),
  styled
);

export default enhanced(LinodeRowHeadCell);

const ProgressDisplay: React.StatelessComponent<{
  className: string;
  progress: null | number;
  text: string;
}> = props => {
  const { progress, text, className } = props;
  const displayProgress = progress ? `${progress}%` : `scheduled`;

  return (
    <Typography variant="body2" className={className}>
      {text}: {displayProgress}
    </Typography>
  );
};
