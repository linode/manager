import { Event } from 'linode-js-sdk/lib/account';
import { Image } from 'linode-js-sdk/lib/images';
import { LinodeBackups, LinodeStatus } from 'linode-js-sdk/lib/linodes';
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
import HelpIcon from 'src/components/HelpIcon';
import Notice from 'src/components/Notice';
import TableCell from 'src/components/TableCell';
import withImages from 'src/containers/withImages.container';
import {
  linodeInTransition,
  transitionText
} from 'src/features/linodes/transitions';
import getLinodeDescription from 'src/utilities/getLinodeDescription';
import withDisplayType, { WithDisplayType } from '../withDisplayType';

import { filterImagesByType } from 'src/store/image/image.helpers';

type ClassNames =
  | 'root'
  | 'link'
  | 'loadingStatus'
  | 'labelWrapper'
  | 'status'
  | 'labelRow'
  | 'labelStatusWrapper'
  | 'dashboard'
  | 'wrapHeader'
  | 'maintenanceContainer'
  | 'maintenanceNotice'
  | 'helpIcon';

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
    },
    maintenanceContainer: {},
    maintenanceNotice: {
      paddingTop: 0,
      paddingBottom: 0,
      '& .noticeText': {
        display: 'flex',
        alignItems: 'center',
        fontSize: '.9rem',
        '& br': {
          display: 'none'
        }
      }
    },
    helpIcon: {
      paddingTop: 0,
      paddingBottom: 0
    }
  });

interface Props {
  backups: LinodeBackups;
  id: number;
  image: string | null;
  ipv4: string[];
  ipv6: string;
  label: string;
  region: string;
  disk: number;
  memory: number;
  vcpus: number;
  status: LinodeStatus;
  displayStatus: string | null;
  type: null | string;
  tags: string[];
  mostRecentBackup: string | null;
  width?: number;
  loading: boolean;
  recentEvent?: Event;
  maintenance?: string | null;
  isDashboard?: boolean;
}

interface WithImagesProps {
  imagesData: Record<string, Image>;
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
    maintenance,
    isDashboard
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
  const dateTime = maintenance && maintenance.split(' ');
  const MaintenanceText = () => {
    return (
      <>
        Please consult your{' '}
        <Link to="/support/tickets?type=open">support tickets</Link> for
        details.
      </>
    );
  };

  return (
    <TableCell className={classes.root} style={style} rowSpan={loading ? 2 : 1}>
      <Grid container wrap="nowrap" alignItems="center">
        <Grid item className="py0">
          <EntityIcon
            variant="linode"
            status={status}
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
          {maintenance && dateTime && isDashboard && (
            <div className={classes.maintenanceContainer}>
              <Notice
                warning
                spacingTop={8}
                spacingBottom={0}
                className={classes.maintenanceNotice}
              >
                Maintenance: <br />
                {dateTime[0]} at {dateTime[1]}
                <HelpIcon
                  text={<MaintenanceText />}
                  tooltipPosition="top"
                  className={classes.helpIcon}
                />
              </Notice>
            </div>
          )}
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
    imagesData: filterImagesByType(imagesData, 'public')
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
