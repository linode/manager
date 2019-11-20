import { APIError } from 'linode-js-sdk/lib/types';
import { pathOr } from 'ramda';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';
import Button from 'src/components/Button';
import { makeStyles, Theme, WithTheme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import EditableEntityLabel from 'src/components/EditableEntityLabel';
import Grid from 'src/components/Grid';
import { DispatchProps } from 'src/containers/longview.container';
import withClientStats, {
  Props as LVDataProps
} from 'src/containers/longview.stats.container';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { formatDate } from 'src/utilities/formatDate';
import { formatUptime } from 'src/utilities/formatUptime';
import { pluralize } from 'src/utilities/pluralize';
import { LongviewPackage } from '../request.types';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    [theme.breakpoints.down('md')]: {
      flexDirection: 'row',
      alignItems: 'center'
    }
  },
  updates: {
    [theme.breakpoints.down('md')]: {
      marginRight: theme.spacing(2)
    }
  },
  link: {
    ...pathOr<Object>({}, ['overrides', 'MuiButton', 'root'], theme),
    ...pathOr<Object>(
      {},
      ['overrides', 'MuiButton', 'containedSecondary'],
      theme
    ),
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    display: 'inline-block',
    position: 'relative',
    [theme.breakpoints.down('md')]: {
      top: -4
    }
  },
  packageButton: {
    fontSize: '0.875rem',
    padding: 0,
    textAlign: 'left'
  },
  lastUpdatedOuter: {
    marginTop: theme.spacing(1)
  },
  lastUpdatedText: {
    fontSize: '0.75rem'
  }
}));

interface Props {
  clientID: number;
  clientLabel: string;
  lastUpdatedError?: APIError[];
  updateLongviewClient: DispatchProps['updateLongviewClient'];
  longviewClientLastUpdated: number;
}

type CombinedProps = Props & DispatchProps & LVDataProps & WithTheme;

const getPackageNoticeText = (packages: LongviewPackage[]) => {
  if (!packages) {
    return 'Package information not available';
  }
  if (packages.length === 0) {
    return 'All packages up to date';
  }
  return `${pluralize(
    'package update',
    'package updates',
    packages.length
  )} available`;
};

export const LongviewClientHeader: React.FC<CombinedProps> = props => {
  const {
    clientID,
    clientLabel,
    lastUpdatedError,
    longviewClientData,
    longviewClientDataLoading,
    longviewClientLastUpdated,
    updateLongviewClient
  } = props;
  const classes = useStyles();
  const [updating, setUpdating] = React.useState<boolean>(false);

  const handleUpdateLabel = (newLabel: string) => {
    setUpdating(true);
    return updateLongviewClient(clientID, newLabel)
      .then(_ => {
        setUpdating(false);
      })
      .catch(error => {
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
  const uptime = pathOr<number | null>(null, ['Uptime'], longviewClientData);
  const formattedUptime =
    uptime !== null ? `Up ${formatUptime(uptime)}` : 'Uptime not available';
  const packages = pathOr<LongviewPackage[] | null>(
    null,
    ['Packages'],
    longviewClientData
  );
  const packagesToUpdate = getPackageNoticeText(packages);

  const utcLastUpdatedTime = new Date(longviewClientLastUpdated).toUTCString();
  const formattedlastUpdatedTime =
    longviewClientLastUpdated !== null
      ? `Last updated ${formatDate(utcLastUpdatedTime, {
          humanizeCutoff: 'never'
        })}`
      : undefined;

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
    <Grid container direction="column" className={classes.root}>
      <Grid item>
        <EditableEntityLabel
          text={clientLabel}
          subText={hostname}
          onEdit={handleUpdateLabel}
          loading={updating}
        />
      </Grid>
      <Grid item className={classes.updates}>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <>
            <Typography>{formattedUptime}</Typography>
            {packages && packages.length > 0 ? (
              <Button
                className={classes.packageButton}
                title={packagesToUpdate}
                onClick={() => window.open('#')}
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
        <Link to={`/longview/clients/${clientID}`} className={classes.link}>
          View details
        </Link>
        {!loading && (
          <div className={classes.lastUpdatedOuter}>
            <Typography variant="caption" className={classes.lastUpdatedText}>
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
