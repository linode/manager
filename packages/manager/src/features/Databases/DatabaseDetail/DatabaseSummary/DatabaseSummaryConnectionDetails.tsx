import { getSSLFields } from '@linode/api-v4/lib/databases/databases';
import { Database, SSLFields } from '@linode/api-v4/lib/databases/types';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import DownloadIcon from 'src/assets/icons/lke-download.svg';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import Box from 'src/components/core/Box';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import CopyTooltip from 'src/components/CopyTooltip';
import Grid from 'src/components/Grid';
import HelpIcon from 'src/components/HelpIcon';
import { DB_ROOT_USERNAME } from 'src/constants';
import { useDatabaseCredentialsQuery } from 'src/queries/databases';
import { downloadFile } from 'src/utilities/downloadFile';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

const useStyles = makeStyles((theme: Theme) => ({
  header: {
    marginBottom: theme.spacing(2),
  },
  copyToolTip: {
    '& svg': {
      color: theme.palette.primary.main,
      height: `16px !important`,
      width: `16px !important`,
    },
    marginRight: 12,
  },
  inlineCopyToolTip: {
    '& svg': {
      height: `16px`,
      width: `16px`,
    },
    padding: `0 0 0 4px`,
    marginLeft: 4,
  },
  actionBtnsCtn: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: `${theme.spacing(1)}px 0`,
  },
  actionBtn: {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    borderRight: '1px solid #c4c4c4',
    '&:hover': {
      opacity: 0.7,
    },
    '&:last-child': {
      borderRight: 'none',
    },
    marginLeft: theme.spacing(2),
  },
  actionText: {
    color: theme.textColors.linkActiveLight,
    whiteSpace: 'nowrap',
  },
  connectionDetailsCtn: {
    padding: '8px 15px',
    background: theme.bg.bgAccessRow,
    border: `1px solid ${theme.name === 'lightTheme' ? '#ccc' : '#222'}`,
    '& p': {
      lineHeight: '1.5rem',
      '& span': {
        fontWeight: 'bold',
      },
    },
  },
  showBtn: {
    color: theme.palette.primary.main,
    marginLeft: theme.spacing(),
    fontSize: '0.875rem',
    minHeight: 'auto',
    minWidth: 'auto',
    padding: 0,
  },
  progressCtn: {
    marginLeft: 22,
    marginBottom: 2,
    '& circle': {
      stroke: theme.palette.primary.main,
    },
    alignSelf: 'flex-end',
  },
  error: {
    color: theme.color.red,
    marginLeft: theme.spacing(2),
  },
  helpIcon: {
    padding: 0,
    marginLeft: theme.spacing(),
    alignSelf: 'baseline',
  },
  provisioningText: {
    fontStyle: 'italic',
    fontWeight: 'lighter !important' as 'lighter',
  },
}));

interface Props {
  database: Database;
}

const privateHostCopy =
  'A private network host and a private IP can only be used to access a Database Cluster from Linodes in the same data center and will not incur transfer costs.';

export const DatabaseSummaryConnectionDetails: React.FC<Props> = (props) => {
  const { database } = props;
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [showCredentials, setShowPassword] = React.useState<boolean>(false);

  const {
    data: credentials,
    isLoading: credentialsLoading,
    error: credentialsError,
    refetch: getDatabaseCredentials,
  } = useDatabaseCredentialsQuery(database.engine, database.id);

  const password =
    showCredentials && credentials ? credentials?.password : '••••••••••';

  const handleShowPasswordClick = () => {
    setShowPassword((showCredentials) => !showCredentials);
  };

  const databaseIsProvisioning = database.status === 'provisioning';

  const isMongoDatabase = database.engine === 'mongodb';
  const isStandaloneMongoDatabase =
    isMongoDatabase && database.cluster_size === 1;

  React.useEffect(() => {
    if (showCredentials && !credentials) {
      getDatabaseCredentials();
    }
  }, [credentials, getDatabaseCredentials, showCredentials]);

  const hostnameJSX = () => {
    // For standalone Mongo instances, hosts.primary is populated after provisioning completes.
    if (!isMongoDatabase || isStandaloneMongoDatabase) {
      return (
        <Typography>
          <span>hostname</span> ={' '}
          {database.hosts?.primary ?? (
            <span className={classes.provisioningText}>
              Your hostname will appear here once it is available.
            </span>
          )}
          {database.hosts?.primary ? (
            <CopyTooltip
              className={classes.inlineCopyToolTip}
              text={database.hosts?.primary}
            />
          ) : null}
        </Typography>
      );
    }

    const listOfHostnames =
      database.peers && database.peers.length > 1
        ? database.peers?.join(', ')
        : undefined;

    const determineHostnameFieldContents = () => {
      return databaseIsProvisioning ? (
        <span className={classes.provisioningText}>
          Your hostnames will appear here once they are available.
        </span>
      ) : (
        database.peers?.join(', ')
      );
    };

    return (
      <Typography>
        <span>hostnames</span> = {determineHostnameFieldContents()}
        {!databaseIsProvisioning && listOfHostnames ? (
          <CopyTooltip
            className={classes.inlineCopyToolTip}
            text={listOfHostnames}
          />
        ) : null}
      </Typography>
    );
  };

  const replicaSetJSX = () => {
    if (!isMongoDatabase) {
      return null;
    }

    return (
      <Typography>
        <span>replica set</span> ={' '}
        {databaseIsProvisioning ? (
          <span className={classes.provisioningText}>
            Your replica set will appear here once it is available.
          </span>
        ) : (
          database.replica_set ?? 'Your replica set is unavailable.'
        )}
        {database.replica_set ? (
          <CopyTooltip
            className={classes.inlineCopyToolTip}
            text={database.replica_set}
          />
        ) : null}
      </Typography>
    );
  };

  const handleDownloadCACertificate = () => {
    getSSLFields(database.engine, database.id)
      .then((response: SSLFields) => {
        // Convert to utf-8 from base64
        try {
          const decodedFile = window.atob(response.ca_certificate);
          downloadFile(`${database.label}-ca-certificate.crt`, decodedFile);
        } catch (e) {
          enqueueSnackbar('Error parsing your CA Certificate file', {
            variant: 'error',
          });
          return;
        }
      })
      .catch((errorResponse: any) => {
        const error = getErrorStringOrDefault(
          errorResponse,
          'Unable to download your CA Certificate'
        );
        enqueueSnackbar(error, { variant: 'error' });
      });
  };

  const ssl = database.ssl_connection ? 'ENABLED' : 'DISABLED';
  const disableShowBtn = ['provisioning', 'failed'].includes(database.status);
  const disableToolTipText =
    database.status === 'provisioning'
      ? 'Your Database Cluster is currently provisioning.'
      : 'Your root password is unavailable when your Database Cluster has failed.';
  // const connectionDetailsCopy = `username = ${credentials?.username}\npassword = ${credentials?.password}\nhost = ${database.host}\nport = ${database.port}\ssl = ${ssl}`;

  const credentialsBtn = (handleClick: () => void, btnText: string) => {
    return (
      <Button
        onClick={handleClick}
        className={classes.showBtn}
        disabled={disableShowBtn}
      >
        {btnText}
      </Button>
    );
  };

  return (
    <>
      <Typography className={classes.header} variant="h3">
        Connection Details
      </Typography>
      <Grid className={classes.connectionDetailsCtn}>
        <Typography>
          <span>username</span> ={' '}
          {database.engine === 'postgresql' ? 'linpostgres' : DB_ROOT_USERNAME}
        </Typography>
        <Box display="flex">
          <Typography>
            <span>password</span> = {password}
          </Typography>
          {credentialsLoading ? (
            <div className={classes.progressCtn}>
              <CircleProgress mini tag />
            </div>
          ) : credentialsError ? (
            <>
              <span className={classes.error}>
                Error retrieving credentials.
              </span>
              {credentialsBtn(() => getDatabaseCredentials(), 'Retry')}
            </>
          ) : (
            credentialsBtn(
              handleShowPasswordClick,
              showCredentials && credentials ? 'Hide' : 'Show'
            )
          )}
          {disableShowBtn ? (
            <HelpIcon className={classes.helpIcon} text={disableToolTipText} />
          ) : null}
          {showCredentials && credentials ? (
            <CopyTooltip
              className={classes.inlineCopyToolTip}
              text={password}
            />
          ) : null}
        </Box>
        <Box display="flex">{hostnameJSX}</Box>
        {database.hosts.secondary ? (
          <Box display="flex" flexDirection="row" alignItems="center">
            <Typography>
              <span>private network host</span> = {database.hosts.secondary}
            </Typography>
            <CopyTooltip
              className={classes.inlineCopyToolTip}
              text={database.hosts.secondary}
            />
            <HelpIcon className={classes.helpIcon} text={privateHostCopy} />
          </Box>
        ) : null}
        <Typography>
          <span>port</span> = {database.port}
        </Typography>
        {replicaSetJSX()}
        <Typography>
          <span>ssl</span> ={' '}
          {!isMongoDatabase ? ssl : valueForMongoSSL(database.ssl_connection)}
        </Typography>
      </Grid>
      <div className={classes.actionBtnsCtn}>
        {/* <Grid item className={classes.actionBtn}>
          <CopyTooltip
            className={classes.copyToolTip}
            text={connectionDetailsCopy}
            displayText="Copy Connection Details"
          />
        </Grid> */}
        {database.ssl_connection ? (
          <Grid
            item
            onClick={handleDownloadCACertificate}
            role="button"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleDownloadCACertificate();
              }
            }}
            tabIndex={0}
            className={classes.actionBtn}
          >
            <DownloadIcon style={{ marginRight: 8 }} />
            <Typography className={classes.actionText}>
              Download CA Certificate
            </Typography>
          </Grid>
        ) : null}
      </div>
    </>
  );
};

const valueForMongoSSL = (ssl_connection: boolean) => {
  return ssl_connection ? 'TRUE' : 'FALSE';
};

export default DatabaseSummaryConnectionDetails;
