import { APIError } from '@linode/api-v4/lib/types';
import { Theme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';
import { pathOr } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';

import { Button } from 'src/components/Button/Button';
import { EditableEntityLabel } from 'src/components/EditableEntityLabel/EditableEntityLabel';
import { Grid } from 'src/components/Grid';
import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';
import { DispatchProps } from 'src/containers/longview.container';
import withClientStats, {
  Props as LVDataProps,
} from 'src/containers/longview.stats.container';
import { useProfile } from 'src/queries/profile';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { formatDate } from 'src/utilities/formatDate';
import { formatUptime } from 'src/utilities/formatUptime';

import { LongviewPackage } from '../request.types';
import { getPackageNoticeText } from '../shared/utilities';
import RestrictedUserLabel from './RestrictedUserLabel';

const useStyles = makeStyles()((theme: Theme) => ({
  lastUpdatedOuter: {
    [theme.breakpoints.up('md')]: {
      marginTop: theme.spacing(1),
    },
  },
  lastUpdatedText: {
    fontSize: '0.75rem',
  },
  packageButton: {
    '&:hover': {
      backgroundColor: 'inherit',
      color: 'inherit',
      textDecoration: 'underline',
    },
    fontSize: '0.875rem',
    padding: 0,
    textAlign: 'left',
  },
  root: {
    '& a': {
      color: theme.textColors.linkActiveLight,
    },
    '& a:hover': {
      color: theme.palette.primary.main,
    },
    [theme.breakpoints.down('lg')]: {
      alignItems: 'center',
      flexDirection: 'row',
    },
  },
  updates: {
    [theme.breakpoints.down('lg')]: {
      marginRight: theme.spacing(2),
    },
  },
}));

interface Props {
  clientID: number;
  clientLabel: string;
  lastUpdatedError?: APIError[];
  longviewClientLastUpdated?: number;
  openPackageDrawer: () => void;
  updateLongviewClient: DispatchProps['updateLongviewClient'];
  userCanModifyClient: boolean;
}

type CombinedProps = Props & DispatchProps & LVDataProps;

export const LongviewClientHeader = (props: CombinedProps) => {
  const {
    clientID,
    clientLabel,
    lastUpdatedError,
    longviewClientData,
    longviewClientDataLoading,
    longviewClientLastUpdated,
    openPackageDrawer,
    updateLongviewClient,
    userCanModifyClient,
  } = props;
  const { classes } = useStyles();
  const [updating, setUpdating] = React.useState<boolean>(false);

  const { data: profile } = useProfile();

  const handleUpdateLabel = (newLabel: string) => {
    setUpdating(true);
    return updateLongviewClient(clientID, newLabel)
      .then((_) => {
        setUpdating(false);
      })
      .catch((error) => {
        setUpdating(false);
        return Promise.reject(
          getAPIErrorOrDefault(error, 'Error updating label')[0].reason
        );
      });
  };

  const hostname = pathOr(
    'Hostname not available',
    ['SysInfo', 'hostname'],
    longviewClientData
  );
  const uptime = pathOr<null | number>(null, ['Uptime'], longviewClientData);
  const formattedUptime =
    uptime !== null ? `Up ${formatUptime(uptime)}` : 'Uptime not available';
  const packages = pathOr<LongviewPackage[] | null>(
    null,
    ['Packages'],
    longviewClientData
  );
  const numPackagesToUpdate = packages ? packages.length : 0;
  const packagesToUpdate = getPackageNoticeText(packages);

  const formattedlastUpdatedTime =
    longviewClientLastUpdated !== undefined
      ? `Last updated ${formatDate(longviewClientLastUpdated, {
          timezone: profile?.timezone,
        })}`
      : 'Latest update time not available';

  /**
   * The pathOrs ahead will default to 'not available' values if
   * there's an error, so the only case we need to handle is
   * the loading state, which should be displayed only if
   * data is loading for the first time and there are no errors.
   */
  const loading =
    longviewClientDataLoading &&
    !lastUpdatedError &&
    longviewClientLastUpdated !== 0;

  return (
    <Grid className={classes.root} container direction="column">
      <Grid item>
        {userCanModifyClient ? (
          <EditableEntityLabel
            loading={updating}
            onEdit={handleUpdateLabel}
            subText={hostname}
            text={clientLabel}
          />
        ) : (
          <RestrictedUserLabel label={clientLabel} subtext={hostname} />
        )}
      </Grid>
      <Grid className={classes.updates} item>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <>
            <Typography>{formattedUptime}</Typography>
            {numPackagesToUpdate > 0 ? (
              <Button
                className={classes.packageButton}
                onClick={() => openPackageDrawer()}
                title={packagesToUpdate}
              >
                {packagesToUpdate}
              </Button>
            ) : (
              <Typography>{packagesToUpdate}</Typography>
            )}
          </>
        )}
      </Grid>
      <Grid item>
        <Link to={`/longview/clients/${clientID}`}>View Details</Link>
        {!loading && (
          <div className={classes.lastUpdatedOuter}>
            <Typography className={classes.lastUpdatedText} variant="caption">
              {formattedlastUpdatedTime}
            </Typography>
          </div>
        )}
      </Grid>
    </Grid>
  );
};

const enhanced = compose<CombinedProps, Props>(
  withClientStats((ownProps: Props) => ownProps.clientID)
);

export default enhanced(LongviewClientHeader);
