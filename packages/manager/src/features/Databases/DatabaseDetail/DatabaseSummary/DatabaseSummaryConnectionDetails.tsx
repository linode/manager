import { getSSLFields } from '@linode/api-v4/lib/databases/databases';
import { useDatabaseCredentialsQuery } from '@linode/queries';
import { Box, CircleProgress, TooltipIcon, Typography } from '@linode/ui';
import { downloadFile } from '@linode/utilities';
import Grid from '@mui/material/Grid';
import { Button } from 'akamai-cds-react-components';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import DownloadIcon from 'src/assets/icons/lke-download.svg';
import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { Link } from 'src/components/Link';
import { DB_ROOT_USERNAME } from 'src/constants';
import { useFlags } from 'src/hooks/useFlags';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

import { getReadOnlyHost, isDefaultDatabase } from '../../utilities';
import {
  StyledGridContainer,
  StyledLabelTypography,
  StyledValueGrid,
} from './DatabaseSummaryClusterConfiguration.style';
import { useStyles } from './DatabaseSummaryConnectionDetails.style';

import type { Database, SSLFields } from '@linode/api-v4/lib/databases/types';
import type { Theme } from '@mui/material/styles';

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
  const flags = useFlags();
  const isLegacy = database.platform !== 'rdbms-default';
  const displayConnectionType =
    flags.databaseVpc && isDefaultDatabase(database);

  const [showCredentials, setShowPassword] = React.useState<boolean>(false);
  const [isCACertDownloading, setIsCACertDownloading] =
    React.useState<boolean>(false);

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

  const hostTooltipComponentProps = {
    tooltip: {
      style: {
        minWidth: 285,
      },
    },
  };
  const HOST_TOOLTIP_COPY =
    'Use the IPv6 address (AAAA record) for this hostname to avoid network transfer charges when connecting to this database from Linodes within the same region.';

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

  const readOnlyHost = () => {
    const defaultValue = isLegacy ? '-' : 'N/A';
    const value = getReadOnlyHost(database) || defaultValue;
    const hasHost = value !== '-' && value !== 'N/A';
    return (
      <>
        {value}
        {value && hasHost && (
          <CopyTooltip className={classes.inlineCopyToolTip} text={value} />
        )}
        {isLegacy && (
          <TooltipIcon
            status="info"
            sxTooltipIcon={sxTooltipIcon}
            text={privateHostCopy}
          />
        )}
        {!isLegacy && hasHost && (
          <TooltipIcon
            componentsProps={hostTooltipComponentProps}
            status="info"
            sxTooltipIcon={sxTooltipIcon}
            text={HOST_TOOLTIP_COPY}
          />
        )}
      </>
    );
  };

  const credentialsBtn = (handleClick: () => void, btnText: string) => {
    return (
      <Button
        className={classes.showBtn}
        data-testid="show-hide-credentials"
        disabled={disableShowBtn}
        onClick={handleClick}
        variant="link"
      >
        {btnText}
      </Button>
    );
  };

  const caCertificateJSX = (
    <>
      <Button
        className={classes.caCertBtn}
        data-testid="download-ca-certificate"
        disabled={disableDownloadCACertificateBtn}
        onClick={handleDownloadCACertificate}
        processing={isCACertDownloading}
        variant="link"
      >
        <DownloadIcon />
        Download CA Certificate
      </Button>
      {disableDownloadCACertificateBtn && (
        <span className={classes.tooltipIcon}>
          <TooltipIcon
            status="info"
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
      <StyledGridContainer container size={{ lg: 7, md: 10 }} spacing={0}>
        <Grid
          size={{
            md: 4,
            xs: 3,
          }}
        >
          <StyledLabelTypography>Username</StyledLabelTypography>
        </Grid>
        <StyledValueGrid size={{ md: 8, xs: 9 }}>{username}</StyledValueGrid>
        <Grid
          size={{
            md: 4,
            xs: 3,
          }}
        >
          <StyledLabelTypography>Password</StyledLabelTypography>
        </Grid>
        <StyledValueGrid size={{ md: 8, xs: 9 }}>
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
              status="info"
              sxTooltipIcon={sxTooltipIcon}
              text={
                database.status === 'provisioning'
                  ? 'Your Database Cluster is currently provisioning.'
                  : 'Your root password is unavailable when your Database Cluster has failed.'
              }
            />
          )}
          {showCredentials && credentials && (
            <CopyTooltip
              className={classes.inlineCopyToolTip}
              text={password}
            />
          )}
        </StyledValueGrid>
        <Grid
          size={{
            md: 4,
            xs: 3,
          }}
        >
          <StyledLabelTypography>Database name</StyledLabelTypography>
        </Grid>
        <StyledValueGrid size={{ md: 8, xs: 9 }}>
          {isLegacy ? database.engine : 'defaultdb'}
        </StyledValueGrid>
        <Grid
          size={{
            md: 4,
            xs: 3,
          }}
        >
          <StyledLabelTypography>Host</StyledLabelTypography>
        </Grid>
        <StyledValueGrid size={{ md: 8, xs: 9 }}>
          {database.hosts?.primary ? (
            <>
              {database.hosts?.primary}
              <CopyTooltip
                className={classes.inlineCopyToolTip}
                text={database.hosts?.primary}
              />
              {!isLegacy && (
                <TooltipIcon
                  componentsProps={hostTooltipComponentProps}
                  status="info"
                  sxTooltipIcon={sxTooltipIcon}
                  text={HOST_TOOLTIP_COPY}
                />
              )}
            </>
          ) : (
            <Typography>
              <span className={classes.provisioningText}>
                Your hostname will appear here once it is available.
              </span>
            </Typography>
          )}
        </StyledValueGrid>
        <Grid
          size={{
            md: 4,
            xs: 3,
          }}
        >
          <StyledLabelTypography>
            {isLegacy ? 'Private Network Host' : 'Read-only Host'}
          </StyledLabelTypography>
        </Grid>
        <StyledValueGrid size={{ md: 8, xs: 9 }}>
          {readOnlyHost()}
        </StyledValueGrid>
        <Grid
          size={{
            md: 4,
            xs: 3,
          }}
        >
          <StyledLabelTypography>Port</StyledLabelTypography>
        </Grid>
        <StyledValueGrid size={{ md: 8, xs: 9 }}>
          {database.port}
        </StyledValueGrid>
        <Grid
          size={{
            md: 4,
            xs: 3,
          }}
        >
          <StyledLabelTypography>SSL</StyledLabelTypography>
        </Grid>
        <StyledValueGrid size={{ md: 8, xs: 9 }}>
          {database.ssl_connection ? 'ENABLED' : 'DISABLED'}
        </StyledValueGrid>
        {displayConnectionType && (
          <>
            <Grid
              size={{
                md: 4,
                xs: 3,
              }}
            >
              <StyledLabelTypography>Connection Type</StyledLabelTypography>
            </Grid>
            <StyledValueGrid size={{ md: 8, xs: 9 }}>
              <Box
                sx={(theme: Theme) => ({
                  marginRight: theme.spacingFunction(20),
                })}
              >
                {database?.private_network?.vpc_id ? 'VPC' : 'Public'}
              </Box>
              <Link
                to={`/databases/${database?.engine}/${database?.id}/networking`}
              >
                View Details
              </Link>
            </StyledValueGrid>
          </>
        )}
      </StyledGridContainer>
      <div className={classes.actionBtnsCtn}>
        {database.ssl_connection ? caCertificateJSX : null}
      </div>
    </>
  );
};

export default DatabaseSummaryConnectionDetails;
