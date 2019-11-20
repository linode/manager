import { APIError } from 'linode-js-sdk/lib/types';
import { pathOr } from 'ramda';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';
import { makeStyles, Theme, WithTheme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import EditableEntityLabel from 'src/components/EditableEntityLabel';
import Grid from 'src/components/Grid';
import { DispatchProps } from 'src/containers/longview.container';
import withClientStats, {
  Props as LVDataProps
} from 'src/containers/longview.stats.container';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
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
  packageLink: {
    background: 'none',
    color: theme.palette.primary.main,
    border: 'none',
    padding: 0,
    font: 'inherit',
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline'
    }
  }
}));

interface Props {
  clientID: number;
  clientLabel: string;
  lastUpdatedError?: APIError[];
  openPackageDrawer: () => void;
  updateLongviewClient: DispatchProps['updateLongviewClient'];
}

type CombinedProps = Props & DispatchProps & LVDataProps & WithTheme;

const getPackageNoticeText = (packages: LongviewPackage[]) => {
  if (!packages) {
    return 'Package information not available';
  }
  if (packages.length === 0) {
    return 'All packages up to date';
  }
  return `${pluralize('package', 'packages', packages.length)} have updates`;
};

export const LongviewClientHeader: React.FC<CombinedProps> = props => {
  const {
    clientID,
    clientLabel,
    lastUpdatedError,
    longviewClientData,
    longviewClientDataLoading,
    longviewClientLastUpdated,
    openPackageDrawer,
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
  const numPackagesToUpdate = packages ? packages.length : 0;
  const packagesToUpdate = getPackageNoticeText(packages);

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
          iconVariant="linode"
          subText={hostname}
          status="running"
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
            <Typography>
              {numPackagesToUpdate > 0 ? (
                <button
                  className={classes.packageLink}
                  onClick={openPackageDrawer}
                >
                  {packagesToUpdate}
                </button>
              ) : (
                packagesToUpdate
              )}
            </Typography>
          </>
        )}
      </Grid>
      <Grid item>
        <Link to={`/longview/clients/${clientID}`} className={classes.link}>
          View details
        </Link>
      </Grid>
    </Grid>
  );
};

const enhanced = compose<CombinedProps, Props>(
  withClientStats((ownProps: Props) => ownProps.clientID)
);

export default enhanced(LongviewClientHeader);
