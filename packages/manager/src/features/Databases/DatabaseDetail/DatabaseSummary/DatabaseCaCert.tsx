import { Button } from '@akamai/cds-components/react';
import { getSSLFields } from '@linode/api-v4/lib/databases/databases';
import { TooltipIcon } from '@linode/ui';
import { downloadFile } from '@linode/utilities';
import { styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import DownloadIcon from 'src/assets/icons/lke-download.svg';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

import { sxTooltipIcon } from './DatabaseSummaryConnectionDetails';

import type { Database, SSLFields } from '@linode/api-v4';

interface Props {
  database: Database;
}

export const DatabaseCaCert = (props: Props) => {
  const { database } = props;
  const { enqueueSnackbar } = useSnackbar();
  const [isCACertDownloading, setIsCACertDownloading] =
    React.useState<boolean>(false);

  const handleDownloadCACertificate = () => {
    setIsCACertDownloading(true);
    getSSLFields(database.engine, database.id)
      .then((response: SSLFields) => {
        // Convert to utf-8 from base64
        try {
          const decodedFile = window.atob(response.ca_certificate);
          downloadFile(`${database.label}-ca-certificate.crt`, decodedFile);
          setIsCACertDownloading(false);
        } catch {
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

  const disableDownloadCACertificateBtn = database.status === 'provisioning';

  return (
    <>
      <StyledCaCertButton
        data-testid="download-ca-certificate"
        disabled={disableDownloadCACertificateBtn}
        onClick={handleDownloadCACertificate}
        processing={isCACertDownloading}
        variant="link"
      >
        <DownloadIcon />
        Download CA Certificate
      </StyledCaCertButton>
      {disableDownloadCACertificateBtn && (
        <span style={{ alignContent: 'center' }}>
          <TooltipIcon
            status="info"
            sxTooltipIcon={sxTooltipIcon}
            text="Your Database Cluster is currently provisioning."
          />
        </span>
      )}
    </>
  );
};

export const StyledCaCertButton = styled(Button, {
  label: 'StyledCaCertButton',
})(({ theme }) => ({
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
  minHeight: 'auto',
  minWidth: 'auto',
  padding: 0,
}));
