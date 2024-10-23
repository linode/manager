import { getSSLFields } from '@linode/api-v4/lib/databases/databases';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import DownloadIcon from 'src/assets/icons/lke-download.svg';
import { Button } from 'src/components/Button/Button';
import { CircleProgress } from 'src/components/CircleProgress';
import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
import { DB_ROOT_USERNAME } from 'src/constants';
import { useDatabaseCredentialsQuery } from 'src/queries/databases/databases';
import { downloadFile } from 'src/utilities/downloadFile';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

import {
  StyledGridContainer,
  StyledLabelTypography,
  StyledValueGrid,
} from './DatabaseSummaryClusterConfiguration.style';
import { useStyles } from './DatabaseSummaryConnectionDetails.style';

import type { Database, SSLFields } from '@linode/api-v4/lib/databases/types';

interface Props {
  database: Database;
}

const sxTooltipIcon = {
  marginLeft: '4px',
  padding: '0px',
};

const privateHostCopy =
  'A private network host and a private IP can only be used to access a Database Cluster from Linodes in the same data center and will not incur transfer costs.';

export const DatabaseSummaryConnectionDetails = (props: Props) => {
  const { database } = props;
  const { classes } = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const isLegacy = database.platform !== 'rdbms-default';

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
  const readOnlyHostValue =
    database?.hosts?.standby ?? database?.hosts?.secondary ?? '';

  const readOnlyHost = () => {
    const defaultValue = isLegacy ? '-' : 'not available';
    const value = readOnlyHostValue ?? defaultValue;
    return (
      <>
        {value}
        {value && (
          <CopyTooltip
            className={classes.inlineCopyToolTip}
            text={readOnlyHostValue}
          />
        )}
        {isLegacy && (
          <TooltipIcon
            status="help"
            sxTooltipIcon={sxTooltipIcon}
            text={privateHostCopy}
          />
        )}
      </>
    );
  };

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
      <StyledGridContainer container lg={7} md={10} spacing={0}>
        <Grid md={4} xs={3}>
          <StyledLabelTypography>Username</StyledLabelTypography>
        </Grid>
        <StyledValueGrid md={8} xs={9}>
          {username}
        </StyledValueGrid>
        <Grid md={4} xs={3}>
          <StyledLabelTypography>Password</StyledLabelTypography>
        </Grid>
        <StyledValueGrid md={8} xs={9}>
          {password}
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
        </StyledValueGrid>
        <Grid md={4} xs={3}>
          <StyledLabelTypography>Host</StyledLabelTypography>
        </Grid>
        <StyledValueGrid md={8} xs={9}>
          {database.hosts?.primary ? (
            <>
              {database.hosts?.primary}
              <CopyTooltip
                className={classes.inlineCopyToolTip}
                text={database.hosts?.primary}
              />
            </>
          ) : (
            <Typography>
              <span className={classes.provisioningText}>
                Your hostname will appear here once it is available.
              </span>
            </Typography>
          )}
        </StyledValueGrid>
        <Grid md={4} xs={3}>
          <StyledLabelTypography>
            {isLegacy ? 'Private Network Host' : 'Read-only Host'}
          </StyledLabelTypography>
        </Grid>
        <StyledValueGrid md={8} xs={9}>
          {readOnlyHost()}
        </StyledValueGrid>
        <Grid md={4} xs={3}>
          <StyledLabelTypography>Port</StyledLabelTypography>
        </Grid>
        <StyledValueGrid md={8} xs={9}>
          {database.port}
        </StyledValueGrid>
        <Grid md={4} xs={3}>
          <StyledLabelTypography>SSL</StyledLabelTypography>
        </Grid>
        <StyledValueGrid md={8} xs={9}>
          {database.ssl_connection ? 'ENABLED' : 'DISABLED'}
        </StyledValueGrid>
      </StyledGridContainer>
      <div className={classes.actionBtnsCtn}>
        {database.ssl_connection ? caCertificateJSX : null}
      </div>
    </>
  );
};

export default DatabaseSummaryConnectionDetails;
