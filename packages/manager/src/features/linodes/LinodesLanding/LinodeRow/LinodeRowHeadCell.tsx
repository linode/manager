import * as classnames from 'classnames';
import { Event } from '@linode/api-v4/lib/account';
import { LinodeBackups, LinodeStatus } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import HelpIcon from 'src/components/HelpIcon';
import Notice from 'src/components/Notice';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import withImages, { WithImages } from 'src/containers/withImages.container';
import withDisplayType, { WithDisplayType } from '../withDisplayType';

import { filterImagesByType } from 'src/store/image/image.helpers';

const useStyles = makeStyles((theme: Theme) => ({
  link: {
    display: 'block',
    fontFamily: theme.font.bold,
    fontSize: '.875rem',
    lineHeight: '1.125rem',
    color: theme.cmrTextColors.linkActiveLight,
    '&:hover, &:focus': {
      textDecoration: 'underline',
    },
  },
  root: {
    '& h3': {
      transition: theme.transitions.create(['color']),
    },
    [theme.breakpoints.up('lg')]: {
      width: '20%',
    },
    [theme.breakpoints.up('xl')]: {
      width: '35%',
    },
  },
  labelStatusWrapper: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    '& a': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: 'inline-block',
    },
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
        display: 'none',
      },
    },
  },
  helpIcon: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  // The head cell in the VLAN Detail context.
  vlanContext: {
    width: '14%',
  },
}));

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
  isVLAN?: boolean;
}

type CombinedProps = Props & WithDisplayType & Pick<WithImages, 'imagesData'>;

const LinodeRowHeadCell: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const {
    // linode props
    label,
    id,
    // other props
    width,
    maintenance,
    isDashboard,
    isVLAN,
  } = props;

  const style = width ? { width: `${width}%` } : {};
  const dateTime = maintenance && maintenance.split(' ');
  const MaintenanceText = () => {
    return (
      <>
        For more information, please see your{' '}
        <Link to="/support/tickets?type=open">open support tickets.</Link>
      </>
    );
  };

  return (
    <TableCell
      className={classnames({
        [classes.root]: true,
        [classes.vlanContext]: isVLAN,
      })}
      style={style}
    >
      <Grid container wrap="nowrap" alignItems="center">
        {/* Hidden overflow is necessary for the wrapping of the label to work. */}
        <Grid item style={{ overflow: 'hidden' }}>
          <div className={classes.labelStatusWrapper}>
            <Link className={classes.link} to={`/linodes/${id}`} tabIndex={0}>
              {label}
            </Link>
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
                  interactive
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

const enhanced = compose<CombinedProps, Props>(
  withDisplayType,
  withImages((ownProps, imagesData) => ({
    ...ownProps,
    imagesData: filterImagesByType(imagesData, 'public'),
  }))
);

export default enhanced(LinodeRowHeadCell);
