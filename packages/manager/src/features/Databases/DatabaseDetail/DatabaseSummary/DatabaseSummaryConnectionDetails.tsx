import { getSSLFields } from '@linode/api-v4/lib/databases/databases';
import { Database, SSLFields } from '@linode/api-v4/lib/databases/types';
import * as React from 'react';
import DownloadIcon from 'src/assets/icons/lke-download.svg';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import CircleProgress from 'src/components/CircleProgress';
// import CopyTooltip from 'src/components/CopyTooltip';
import Grid from 'src/components/Grid';
import { useDatabaseCredentialsQuery } from 'src/queries/databases';
import { downloadFile } from 'src/utilities/downloadFile';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import { useSnackbar } from 'notistack';

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
    color: theme.cmrTextColors.linkActiveLight,
    whiteSpace: 'nowrap',
  },
  connectionDetailsCtn: {
    padding: '8px 15px',
    background: theme.cmrBGColors.bgAccessRow,
    border: `1px solid ${theme.color.borderPagination}`,
    '& p': {
      lineHeight: '1.5rem',
      '& span': {
        fontWeight: 'bold',
      },
    },
  },
  showBtn: {
    color: theme.color.blue,
    cursor: 'pointer',
    marginLeft: theme.spacing(2),
  },
  credentialsCtn: {
    display: 'flex',
  },
  error: {
    color: theme.color.red,
    marginLeft: theme.spacing(2),
  },
}));

interface Props {
  database: Database;
}

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

  const username =
    showCredentials && credentials ? credentials?.username : '••••••••';
  const password =
    showCredentials && credentials ? credentials?.password : '••••••••';

  const handleShowPasswordClick = () => {
    setShowPassword((showCredentials) => !showCredentials);
  };

  React.useEffect(() => {
    if (showCredentials && !credentials) {
      getDatabaseCredentials();
    }
  }, [credentials, getDatabaseCredentials, showCredentials]);

  const handleDownloadCACertificate = () => {
    getSSLFields(database.engine, database.id)
      .then((response: SSLFields) => {
        // Convert to utf-8 from base64
        try {
          const decodedFile = window.atob(response.certificate);
          downloadFile(
            `${response.public_key}-ca-certificate.crt`,
            decodedFile
          );
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
  // const connectionDetailsCopy = `username = ${credentials?.username}\npassword = ${credentials?.password}\nhost = ${database.host}\nport = ${database.port}\ssl = ${ssl}`;
  const credentialsBtn = (handleClick: () => void, btnText: string) => {
    return (
      <span
        onClick={handleClick}
        className={classes.showBtn}
        role="button"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleClick();
          }
        }}
        tabIndex={0}
      >
        {btnText}
      </span>
    );
  };

  return (
    <>
      <Typography className={classes.header} variant="h3">
        Connection Details
      </Typography>
      <Grid className={classes.connectionDetailsCtn}>
        <div className={classes.credentialsCtn}>
          <div>
            <Typography>
              <span>username</span> = {username}
            </Typography>
            <Typography>
              <span>password</span> = {password}
            </Typography>
          </div>
          {credentialsLoading ? (
            <div style={{ marginLeft: 4, marginTop: 4 }}>
              <CircleProgress mini />
            </div>
          ) : (
            <Typography style={{ alignSelf: 'center' }}>
              {credentialsError ? (
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
            </Typography>
          )}
        </div>
        <Typography>
          <span>host</span> = {database.hosts?.primary}
        </Typography>
        <Typography>
          <span>port</span> = {database.port}
        </Typography>
        <Typography>
          <span>ssl</span> = {ssl}
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

export default DatabaseSummaryConnectionDetails;
