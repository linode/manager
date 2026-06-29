import { toast } from '@akamai/cds-components/notification-toast';
import { Button, Icon, Tooltip } from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { getErrorStringOrDefault } from '@akamai/compute-ui-core/api';
import { downloadFile } from '@akamai/compute-ui-core/browser';
import { getSSLFields } from '@linode/api-v4/lib/databases/databases';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import DownloadIcon from 'src/assets/icons/lke-download.svg';

import type { Database, SSLFields } from '@linode/api-v4';

interface Props {
  database: Database;
}

export const DatabaseCaCert = (props: Props) => {
  const { database } = props;
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
          toast.open({
            text: 'Error parsing your CA Certificate file',
            type: 'error',
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
        toast.open({ text: error, type: 'error' });
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
          <Tooltip
            style={{ marginLeft: Spacing.S4 }}
            tooltipText="Your Database Cluster is currently provisioning."
          >
            <Icon
              icon="info-outline"
              size="m"
              style={{ position: 'relative', top: -2 }}
            />
          </Tooltip>
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
