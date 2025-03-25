import { getSSLFields } from '@linode/api-v4/lib/databases/databases';
import {
  Box,
  Button,
  CircleProgress,
  TooltipIcon,
  Typography,
} from '@linode/ui';
import { downloadFile } from '@linode/utilities';
import { useTheme } from '@mui/material';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import DownloadIcon from 'src/assets/icons/lke-download.svg';
import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { DB_ROOT_USERNAME } from 'src/constants';
import { useDatabaseCredentialsQuery } from 'src/queries/databases/databases';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

import type { Database, SSLFields } from '@linode/api-v4/lib/databases/types';
import type { Theme } from '@mui/material/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  actionBtnsCtn: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '10px',
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
        stroke: theme.tokens.color.Neutrals[30],
      },
      '&:hover': {
        backgroundColor: 'inherit',
        textDecoration: 'none',
      },
      // Override disabled background color defined for dark mode
      backgroundColor: 'transparent',
      color: theme.tokens.color.Neutrals[30],
      cursor: 'default',
    },
    color: theme.palette.primary.main,
    font: theme.font.bold,
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
    '& span': {
      font: theme.font.bold,
    },
    background: theme.bg.bgAccessRowTransparentGradient,
    border: `1px solid ${
      theme.name === 'light'
        ? theme.tokens.color.Neutrals[40]
        : theme.tokens.color.Neutrals.Black
    }`,
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
    font: theme.font.normal,
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

/**
 * Deprecated @since DBaaS V2 GA. Will be removed remove post GA release ~ Dec 2024
 * TODO (UIE-8214) remove POST GA
 */
export const DatabaseSummaryConnectionDetailsLegacy = (props: Props) => {
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

  const username =
    database.platform === 'rdbms-default'
      ? 'akmadmin'
      : database.engine === 'postgresql'
      ? 'linpostgres'
      : DB_ROOT_USERNAME;

  const password =
    showCredentials && credentials ? credentials?.password : '••••••••••';

  const handleShowPasswordClick = () => {
    setShowPassword((showCredentials) => !showCredentials);
  };

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
  const readOnlyHost = database?.hosts?.standby || database?.hosts?.secondary;

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
      {disableDownloadCACertificateBtn && (
        <span className="tooltipIcon">
          <TooltipIcon
            status="help"
            sxTooltipIcon={sxTooltipIcon}
            text="Your Database Cluster is currently provisioning."
          />
        </span>
      )}
    </>
  );

  return (
    <>
      <Typography className={classes.header} variant="h3">
        Connection Details
      </Typography>
      <Box className={classes.connectionDetailsCtn} data-qa-connection-details>
        <Typography>
          <span>username</span> = {username}
        </Typography>
        <Box display="flex">
          <Typography>
            <span>password</span> = {password}
          </Typography>
          {showCredentials && credentialsLoading ? (
            <div className={classes.progressCtn}>
              <CircleProgress noPadding size="xs" />
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
          {disableShowBtn && (
            <TooltipIcon
              text={
                database.status === 'provisioning'
                  ? 'Your Database Cluster is currently provisioning.'
                  : 'Your root password is unavailable when your Database Cluster has failed.'
              }
              status="help"
              sxTooltipIcon={sxTooltipIcon}
            />
          )}
          {showCredentials && credentials && (
            <CopyTooltip
              className={classes.inlineCopyToolTip}
              text={password}
            />
          )}
        </Box>
        <Box>
          <Box alignItems="center" display="flex" flexDirection="row">
            {database.hosts?.primary ? (
              <>
                <Typography>
                  <span>host</span> ={' '}
                  <span style={{ font: theme.font.normal }}>
                    {database.hosts?.primary}
                  </span>{' '}
                </Typography>
                <CopyTooltip
                  className={classes.inlineCopyToolTip}
                  text={database.hosts?.primary}
                />
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
        </Box>
        {readOnlyHost && (
          <Box alignItems="center" display="flex" flexDirection="row">
            <Typography>
              {database.platform === 'rdbms-default' ? (
                <span>read-only host</span>
              ) : (
                <span>private network host </span>
              )}
              = {readOnlyHost}
            </Typography>
            <CopyTooltip
              className={classes.inlineCopyToolTip}
              text={readOnlyHost}
            />
            {database.platform === 'rdbms-legacy' && (
              <TooltipIcon
                status="help"
                sxTooltipIcon={sxTooltipIcon}
                text={privateHostCopy}
              />
            )}
          </Box>
        )}
        <Typography>
          <span>port</span> = {database.port}
        </Typography>
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

export default DatabaseSummaryConnectionDetailsLegacy;
