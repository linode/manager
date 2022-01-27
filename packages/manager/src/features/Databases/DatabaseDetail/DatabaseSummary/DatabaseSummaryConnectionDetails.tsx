import { getSSLFields } from '@linode/api-v4/lib/databases/databases';
import { Database, SSLFields } from '@linode/api-v4/lib/databases/types';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import DownloadIcon from 'src/assets/icons/lke-download.svg';
import CircleProgress from 'src/components/CircleProgress';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
// import CopyTooltip from 'src/components/CopyTooltip';
import Grid from 'src/components/Grid';
import { DB_ROOT_USERNAME } from 'src/constants';
import { useDatabaseCredentialsQuery } from 'src/queries/databases';
import { downloadFile } from 'src/utilities/downloadFile';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import Box from 'src/components/core/Box';
import HelpIcon from 'src/components/HelpIcon';

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
  progressCtn: {
    marginLeft: 22,
    marginBottom: 2,
    '& circle': {
      stroke: theme.color.blue,
    },
    alignSelf: 'flex-end',
  },
  credentialsCtn: {
    display: 'flex',
  },
  error: {
    color: theme.color.red,
    marginLeft: theme.spacing(2),
  },
  helpIcon: {
    padding: 0,
    marginLeft: theme.spacing(),
  },
}));

interface Props {
  database: Database;
}

const privateHostCopy =
  'A private network host and a private IP can only be used to access a database cluster from Linodes in the same data center and will not incur transfer costs.';

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
              <span>username</span> = {DB_ROOT_USERNAME}
            </Typography>
            <Typography>
              <span>password</span> = {password}
            </Typography>
          </div>
          {credentialsLoading ? (
            <div className={classes.progressCtn}>
              <CircleProgress mini tag />
            </div>
          ) : (
            <Typography style={{ alignSelf: 'flex-end' }}>
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
        {database.hosts.secondary ? (
          <Box display="flex" flexDirection="row" alignItems="center">
            <Typography>
              <span>private network host</span> = {database.hosts.secondary}
            </Typography>
            <HelpIcon className={classes.helpIcon} text={privateHostCopy} />
          </Box>
        ) : null}
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
