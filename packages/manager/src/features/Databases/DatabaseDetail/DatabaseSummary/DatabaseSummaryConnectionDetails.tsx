import { getSSLFields } from '@linode/api-v4/lib/databases/databases';
import { Database, SSLFields } from '@linode/api-v4/lib/databases/types';
import { useTheme } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import DownloadIcon from 'src/assets/icons/lke-download.svg';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { CircleProgress } from 'src/components/CircleProgress';
import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
import { DB_ROOT_USERNAME } from 'src/constants';
import { useDatabaseCredentialsQuery } from 'src/queries/databases';
import { downloadFile } from 'src/utilities/downloadFile';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

const useStyles = makeStyles()((theme: Theme) => ({
  actionBtnsCtn: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: `${theme.spacing(1)} 0`,
  },
  caCertBtn: {
    '& svg': {
      marginRight: theme.spacing(),
    },
    '&:hover': {
      backgroundColor: 'transparent',
      opacity: 0.7,
    },
    '&[disabled]': {
      '& g': {
        stroke: '#cdd0d5',
      },
      '&:hover': {
        backgroundColor: 'inherit',
        textDecoration: 'none',
      },
      // Override disabled background color defined for dark mode
      backgroundColor: 'transparent',
      color: '#cdd0d5',
      cursor: 'default',
    },
    color: theme.palette.primary.main,
    fontFamily: theme.font.bold,
    fontSize: '0.875rem',
    lineHeight: '1.125rem',
    marginLeft: theme.spacing(),
    minHeight: 'auto',
    minWidth: 'auto',
    padding: 0,
  },
  connectionDetailsCtn: {
    '& p': {
      lineHeight: '1.5rem',
    },
    background: theme.bg.bgAccessRow,
    border: `1px solid ${theme.name === 'light' ? '#ccc' : '#222'}`,
    padding: '8px 15px',
  },
  copyToolTip: {
    '& svg': {
      color: theme.palette.primary.main,
      height: `16px !important`,
      width: `16px !important`,
    },
    marginRight: 12,
  },
  error: {
    color: theme.color.red,
    marginLeft: theme.spacing(2),
  },
  header: {
    marginBottom: theme.spacing(2),
  },
  inlineCopyToolTip: {
    '& svg': {
      height: `16px`,
      width: `16px`,
    },
    '&:hover': {
      backgroundColor: 'transparent',
    },
    display: 'inline-flex',
    marginLeft: 4,
  },
  progressCtn: {
    '& circle': {
      stroke: theme.palette.primary.main,
    },
    alignSelf: 'flex-end',
    marginBottom: 2,
    marginLeft: 22,
  },
  provisioningText: {
    fontFamily: theme.font.normal,
    fontStyle: 'italic',
  },
  showBtn: {
    color: theme.palette.primary.main,
    fontSize: '0.875rem',
    marginLeft: theme.spacing(),
    minHeight: 'auto',
    minWidth: 'auto',
    padding: 0,
  },
}));

interface Props {
  database: Database;
}

const sxTooltipIcon = {
  marginLeft: '4px',
  padding: '0px',
};

const privateHostCopy =
  'A private network host and a private IP can only be used to access a Database Cluster from Linodes in the same data center and will not incur transfer costs.';

const mongoHostHelperCopy =
  'This is a public hostname. Coming soon: connect to your MongoDB clusters using private IPs';

export const DatabaseSummaryConnectionDetails = (props: Props) => {
  const { database } = props;
  const { classes } = useStyles();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [showCredentials, setShowPassword] = React.useState<boolean>(false);
  const [isCACertDownloading, setIsCACertDownloading] = React.useState<boolean>(
    false
  );

  const {
    data: credentials,
    error: credentialsError,
    isLoading: credentialsLoading,
    refetch: getDatabaseCredentials,
  } = useDatabaseCredentialsQuery(database.engine, database.id);

  const password =
    showCredentials && credentials ? credentials?.password : '••••••••••';

  const handleShowPasswordClick = () => {
    setShowPassword((showCredentials) => !showCredentials);
  };

  const isMongoReplicaSet =
    database.engine === 'mongodb' && database.cluster_size > 1;

  React.useEffect(() => {
    if (showCredentials && !credentials) {
      getDatabaseCredentials();
    }
  }, [credentials, getDatabaseCredentials, showCredentials]);

  const handleDownloadCACertificate = () => {
    setIsCACertDownloading(true);
    getSSLFields(database.engine, database.id)
      .then((response: SSLFields) => {
        // Convert to utf-8 from base64
        try {
          const decodedFile = window.atob(response.ca_certificate);
          downloadFile(`${database.label}-ca-certificate.crt`, decodedFile);
          setIsCACertDownloading(false);
        } catch (e) {
          enqueueSnackbar('Error parsing your CA Certificate file', {
            variant: 'error',
          });
          setIsCACertDownloading(false);
          return;
        }
      })
      .catch((errorResponse: any) => {
        const error = getErrorStringOrDefault(
          errorResponse,
          'Unable to download your CA Certificate'
        );
        setIsCACertDownloading(false);
        enqueueSnackbar(error, { variant: 'error' });
      });
  };

  const disableShowBtn = ['failed', 'provisioning'].includes(database.status);
  const disableDownloadCACertificateBtn = database.status === 'provisioning';
  // const connectionDetailsCopy = `username = ${credentials?.username}\npassword = ${credentials?.password}\nhost = ${database.host}\nport = ${database.port}\ssl = ${ssl}`;

  const credentialsBtn = (handleClick: () => void, btnText: string) => {
    return (
      <Button
        className={classes.showBtn}
        disabled={disableShowBtn}
        onClick={handleClick}
      >
        {btnText}
      </Button>
    );
  };

  const caCertificateJSX = (
    <>
      <Button
        className={classes.caCertBtn}
        disabled={disableDownloadCACertificateBtn}
        loading={isCACertDownloading}
        onClick={handleDownloadCACertificate}
      >
        <DownloadIcon />
        Download CA Certificate
      </Button>
      {disableDownloadCACertificateBtn ? (
        <span className="tooltipIcon">
          <TooltipIcon
            status="help"
            sxTooltipIcon={sxTooltipIcon}
            text="Your Database Cluster is currently provisioning."
          />
        </span>
      ) : null}
    </>
  );

  return (
    <>
      <Typography className={classes.header} variant="h3">
        Connection Details
      </Typography>
      <Box className={classes.connectionDetailsCtn} data-qa-connection-details>
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
              <CircleProgress mini noPadding size={12} />
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
            <TooltipIcon
              text={
                database.status === 'provisioning'
                  ? 'Your Database Cluster is currently provisioning.'
                  : 'Your root password is unavailable when your Database Cluster has failed.'
              }
              status="help"
              sxTooltipIcon={sxTooltipIcon}
            />
          ) : null}
          {showCredentials && credentials ? (
            <CopyTooltip
              className={classes.inlineCopyToolTip}
              text={password}
            />
          ) : null}
        </Box>
        <Box>
          {!isMongoReplicaSet ? (
            <Box alignItems="center" display="flex" flexDirection="row">
              {database.hosts?.primary ? (
                <>
                  <Typography>
                    <span>host</span> ={' '}
                    <span style={{ fontFamily: theme.font.normal }}>
                      {database.hosts?.primary}
                    </span>{' '}
                  </Typography>
                  <CopyTooltip
                    className={classes.inlineCopyToolTip}
                    text={database.hosts?.primary}
                  />
                  {database.engine === 'mongodb' ? (
                    <TooltipIcon
                      status="help"
                      sxTooltipIcon={sxTooltipIcon}
                      text={mongoHostHelperCopy}
                    />
                  ) : null}
                </>
              ) : (
                <Typography>
                  <span>host</span> ={' '}
                  <span className={classes.provisioningText}>
                    Your hostname will appear here once it is available.
                  </span>
                </Typography>
              )}
            </Box>
          ) : (
            <>
              <Typography>
                <span>hosts</span> ={' '}
                {!database.peers || database.peers.length === 0 ? (
                  <span className={classes.provisioningText}>
                    Your hostnames will appear here once they are available.
                  </span>
                ) : null}
              </Typography>
              {database.peers && database.peers.length > 0
                ? database.peers.map((hostname, i) => (
                    <Box
                      alignItems="center"
                      display="flex"
                      flexDirection="row"
                      key={hostname}
                    >
                      <Typography
                        style={{
                          marginBottom: 0,
                          marginLeft: 16,
                          marginTop: 0,
                        }}
                      >
                        <span style={{ fontFamily: theme.font.normal }}>
                          {hostname}
                        </span>
                      </Typography>
                      <CopyTooltip
                        className={classes.inlineCopyToolTip}
                        text={hostname}
                      />
                      {/*  Display the helper text on the first hostname */}
                      {i === 0 ? (
                        <TooltipIcon
                          status="help"
                          sxTooltipIcon={sxTooltipIcon}
                          text={mongoHostHelperCopy}
                        />
                      ) : null}
                    </Box>
                  ))
                : null}
            </>
          )}
        </Box>
        {database.hosts.secondary ? (
          <Box alignItems="center" display="flex" flexDirection="row">
            <Typography>
              <span>private network host</span> = {database.hosts.secondary}
            </Typography>
            <CopyTooltip
              className={classes.inlineCopyToolTip}
              text={database.hosts.secondary}
            />
            <TooltipIcon
              status="help"
              sxTooltipIcon={sxTooltipIcon}
              text={privateHostCopy}
            />
          </Box>
        ) : null}
        <Typography>
          <span>port</span> = {database.port}
        </Typography>
        {isMongoReplicaSet ? (
          database.replica_set ? (
            <Box alignItems="center" display="flex" flexDirection="row">
              <Typography>
                <span>replica set</span> ={' '}
                <span style={{ fontFamily: theme.font.normal }}>
                  {database.replica_set}
                </span>
              </Typography>
              <CopyTooltip
                className={classes.inlineCopyToolTip}
                text={database.replica_set}
              />
            </Box>
          ) : (
            <Typography>
              <span>replica set</span> ={' '}
              <span className={classes.provisioningText}>
                Your replica set will appear here once it is available.
              </span>
            </Typography>
          )
        ) : null}
        <Typography>
          <span>ssl</span> = {database.ssl_connection ? 'ENABLED' : 'DISABLED'}
        </Typography>
      </Box>
      <div className={classes.actionBtnsCtn}>
        {database.ssl_connection ? caCertificateJSX : null}
      </div>
    </>
  );
};

export default DatabaseSummaryConnectionDetails;
