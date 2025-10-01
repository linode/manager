import { getSSLFields } from '@linode/api-v4/lib/databases/databases';
import { useDatabaseCredentialsQuery } from '@linode/queries';
import { Box, CircleProgress, TooltipIcon, Typography } from '@linode/ui';
import { downloadFile } from '@linode/utilities';
import { Button } from 'akamai-cds-react-components';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import DownloadIcon from 'src/assets/icons/lke-download.svg';
import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { Link } from 'src/components/Link';
import { DB_ROOT_USERNAME } from 'src/constants';
import { useFlags } from 'src/hooks/useFlags';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

import { isDefaultDatabase } from '../../utilities';
import { ConnectionDetailsHostRows } from '../ConnectionDetailsHostRows';
import { ConnectionDetailsRow } from '../ConnectionDetailsRow';
import { StyledGridContainer } from './DatabaseSummaryClusterConfiguration.style';
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

export const DatabaseSummaryConnectionDetails = (props: Props) => {
  const { database } = props;
  const { classes } = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const flags = useFlags();
  const isLegacy = database.platform !== 'rdbms-default';
  const hasVPC = Boolean(database?.private_network?.vpc_id);
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

  const getConnectionTypeContent = () => {
    return (
      <>
        <Box
          sx={(theme: Theme) => ({
            marginRight: theme.spacingFunction(20),
          })}
        >
          {hasVPC ? 'VPC' : 'Public'}
        </Box>
        <Link to={`/databases/${database?.engine}/${database?.id}/networking`}>
          View Details
        </Link>
      </>
    );
  };

  const getCredentialsContent = () => {
    return (
      <>
        {password}
        {showCredentials && credentialsLoading ? (
          <div className={classes.progressCtn}>
            <CircleProgress noPadding size="xs" />
          </div>
        ) : credentialsError ? (
          <>
            <span className={classes.error}>Error retrieving credentials.</span>
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
          <CopyTooltip className={classes.inlineCopyToolTip} text={password} />
        )}
      </>
    );
  };

  return (
    <>
      <Typography className={classes.header} variant="h3">
        Connection Details
      </Typography>
      <StyledGridContainer container size={{ lg: 7, md: 10 }} spacing={0}>
        <ConnectionDetailsRow label="Username">{username}</ConnectionDetailsRow>
        <ConnectionDetailsRow label="Password">
          {getCredentialsContent()}
        </ConnectionDetailsRow>
        <ConnectionDetailsRow label="Database name">
          {isLegacy ? database.engine : 'defaultdb'}
        </ConnectionDetailsRow>
        <ConnectionDetailsHostRows database={database} />
        <ConnectionDetailsRow label="Port">
          {database.port}
        </ConnectionDetailsRow>
        <ConnectionDetailsRow label="SSL">
          {database.ssl_connection ? 'ENABLED' : 'DISABLED'}
        </ConnectionDetailsRow>
        {displayConnectionType && (
          <ConnectionDetailsRow label="Connection Type">
            {getConnectionTypeContent()}
          </ConnectionDetailsRow>
        )}
      </StyledGridContainer>
      <div className={classes.actionBtnsCtn}>
        {database.ssl_connection ? caCertificateJSX : null}
      </div>
    </>
  );
};

export default DatabaseSummaryConnectionDetails;
