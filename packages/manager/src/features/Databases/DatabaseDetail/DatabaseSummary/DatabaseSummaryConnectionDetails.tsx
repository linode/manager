import { getSSLFields } from '@linode/api-v4/lib/databases/databases';
import { Database, SSLFields } from '@linode/api-v4/lib/databases/types';
import * as React from 'react';
import DownloadIcon from 'src/assets/icons/lke-download.svg';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import CircleProgress from 'src/components/CircleProgress';
// import CopyTooltip from 'src/components/CopyTooltip';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import { useDatabaseCredentialsQuery } from 'src/queries/databases';
import { downloadFile } from 'src/utilities/downloadFile';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import { useSnackbar } from 'notistack';

const useStyles = makeStyles((theme: Theme) => ({
  header: {
    fontFamily: theme.font.bold,
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
    padding: theme.spacing(),
    background: '#f4f4f4',
    border: '1px solid #ccc',
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
    marginLeft: theme.spacing(),
  },
}));

interface Props {
  database: Database;
}

export const DatabaseSummaryConnectionDetails: React.FC<Props> = (props) => {
  const { database } = props;
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [showPassword, setShowPassword] = React.useState<boolean>(false);

  const {
    data: credentials,
    isLoading: credentialsLoading,
    error: credentialsError,
  } = useDatabaseCredentialsQuery(database.engine, database.id);

  const password = showPassword
    ? credentials?.password
    : credentials?.password.replace(/./g, '•');

  const handleShowPasswordClick = () => {
    setShowPassword((showPassword) => !showPassword);
  };

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

  if (credentialsLoading) {
    return (
      <>
        <Typography className={classes.header}>Connection Details</Typography>
        <CircleProgress noTopMargin />
      </>
    );
  }

  if (credentialsError) {
    return (
      <>
        <Typography className={classes.header}>Connection Details</Typography>
        <ErrorState errorText="An unexpected error occurred." />
      </>
    );
  }

  const sslMode = database.ssl_connection ? 'REQUIRED' : 'NOT REQUIRED';
  // const connectionDetailsCopy = `username = ${credentials?.username}\npassword = ${credentials?.password}\nhost = ${database.host}\nport = ${database.port}\nsslmode = ${sslMode}`;

  return (
    <>
      <Typography className={classes.header}>Connection Details</Typography>
      <Grid className={classes.connectionDetailsCtn}>
        <Typography>
          <span>username</span> = {credentials?.username}
        </Typography>
        <Typography>
          <span>password</span> = {password}
          <span
            onClick={handleShowPasswordClick}
            className={classes.showBtn}
            role="button"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleShowPasswordClick();
              }
            }}
            tabIndex={0}
          >
            show
          </span>
        </Typography>
        <Typography>
          <span>host</span> = {database.host}
        </Typography>
        <Typography>
          <span>port</span> = {database.port}
        </Typography>
        <Typography>
          <span>sslmode</span> = {sslMode}
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
