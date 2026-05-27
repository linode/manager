import { Button, Icon, Tooltip } from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { useDatabaseCredentialsQuery } from '@linode/queries';
import { Typography } from '@linode/ui';
import { Box, Grid, styled } from '@mui/material';
import copy from 'copy-to-clipboard';
import { enqueueSnackbar } from 'notistack';
import React, { useState } from 'react';

import { Code } from 'src/components/Code/Code';
import {
  CLUSTER_PROVISIONING_TEXT,
  CREDENTIALS_ERROR_TEXT,
  DISABLE_CREDENTIAL_STATES,
  DISABLED_PASSWORD_BUTTON_TEXT,
} from 'src/features/Databases/constants';
import { StyledValueGrid } from 'src/features/Databases/DatabaseDetail/DatabaseSummary/DatabaseSummaryClusterConfiguration.style';

import { CopyTooltip } from '../shared/CopyTooltip/CopyTooltip';

import type { Database, DatabaseCredentials } from '@linode/api-v4';

interface ServiceURIProps {
  database: Database;
  isGeneralServiceURI?: boolean;
  showPrivateVPC?: boolean;
}

export const ServiceURI = (props: ServiceURIProps) => {
  const {
    database,
    isGeneralServiceURI = false,
    showPrivateVPC = false,
  } = props;

  const [hidePassword, setHidePassword] = useState(true);
  const [isCopying, setIsCopying] = useState(false);
  const engine =
    database.engine === 'postgresql' ? 'postgres' : database.engine;
  const generalSslmode =
    engine === 'mysql' ? 'ssl-mode=REQUIRED' : 'sslmode=require';

  const {
    data: credentials,
    error: credentialsError,
    isLoading: credentialsLoading,
    isFetching: credentialsFetching,
    refetch: getDatabaseCredentials,
  } = useDatabaseCredentialsQuery(database.engine, database.id, !hidePassword);

  const hasVPC = Boolean(database?.private_network?.vpc_id);
  const hasPublicVPC = hasVPC && database.private_network?.public_access;
  // If there is a VPC, use VPC public access unless we want to explicitly show private access, otherwise default to public
  const publicAccess =
    hasPublicVPC && showPrivateVPC
      ? false
      : hasVPC
        ? database.private_network?.public_access
        : true;

  const primaryHost = database.hosts?.endpoints.find(
    (endpoint) =>
      endpoint.role === 'primary' && endpoint.public_access === publicAccess
  );
  const primaryConnectionPoolHost = database.hosts?.endpoints.find(
    (endpoint) =>
      endpoint.role === 'primary-connection-pool' &&
      endpoint.public_access === publicAccess
  );

  const handleCopy = async () => {
    if (!credentials) {
      try {
        setIsCopying(true);
        const { data } = await getDatabaseCredentials();
        if (data) {
          // copy with revealed credentials
          copy(getServiceURIText(data, isGeneralServiceURI));
        } else {
          enqueueSnackbar(CREDENTIALS_ERROR_TEXT, { variant: 'error' });
        }
        setIsCopying(false);
      } catch {
        setIsCopying(false);
        enqueueSnackbar(CREDENTIALS_ERROR_TEXT, { variant: 'error' });
      }
    }
  };

  const getServiceURIText = (
    credentials: DatabaseCredentials | undefined,
    isGeneralServiceURI?: boolean
  ) => {
    if (isGeneralServiceURI) {
      return `${engine}://${credentials?.username}:${credentials?.password}@${primaryHost?.address}:${primaryHost?.port}/defaultdb?${generalSslmode}`;
    }
    return `postgres://${credentials?.username}:${credentials?.password}@${primaryConnectionPoolHost?.address}:${primaryConnectionPoolHost?.port}/{connection pool label}?sslmode=require`;
  };

  // hide loading state if the user clicks on the copy icon
  const showBtnLoading =
    !hidePassword && !isCopying && (credentialsLoading || credentialsFetching);

  const disablePasswordBtn = DISABLE_CREDENTIAL_STATES.includes(
    database.status
  );

  const disabledPasswordTooltipText =
    database.status === 'provisioning'
      ? CLUSTER_PROVISIONING_TEXT
      : DISABLED_PASSWORD_BUTTON_TEXT;

  React.useEffect(() => {
    if (!hidePassword && credentialsError) {
      setHidePassword(true);
      enqueueSnackbar(CREDENTIALS_ERROR_TEXT, { variant: 'error' });
    }
  }, [credentialsError, hidePassword]);

  const renderPassword = () => {
    if (hidePassword || credentialsError || !credentials) {
      return (
        <Tooltip
          disabled={!disablePasswordBtn}
          style={{ whiteSpace: 'normal' }}
          tooltipText={disabledPasswordTooltipText}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              disabled={disablePasswordBtn}
              onClick={() => {
                getDatabaseCredentials();
                setHidePassword(false);
              }}
              processing={showBtnLoading}
              style={{
                padding: 0,
                position: 'relative',
                display: 'flex',
              }}
              variant="link"
            >
              {`{Click To Reveal Password}`}
              {disablePasswordBtn ? (
                <Icon icon="info-outline" size="m" />
              ) : null}
            </Button>
          </Box>
        </Tooltip>
      );
    }

    return `${credentials?.username}:${credentials?.password}`;
  };

  if (
    (isGeneralServiceURI && !primaryHost) ||
    (engine === 'postgres' && !primaryConnectionPoolHost)
  ) {
    return (
      <Grid display="contents">
        <StyledValueGrid
          data-testid="service-uri"
          size="grow"
          sx={{
            overflowX: 'auto',
            overflowY: 'hidden',
            p: '0',
          }}
          whiteSpace="pre"
        >
          <Typography fontStyle="italic">
            Your Service URI will appear here once it is available.
          </Typography>
        </StyledValueGrid>
      </Grid>
    );
  }

  return (
    <Grid display="contents">
      <Box
        data-testid="service-uri"
        sx={{
          display: 'inline',
          overflowX: 'scroll',
          whiteSpace: 'nowrap',
        }}
      >
        {engine}://
        {renderPassword()}
        {isGeneralServiceURI ? (
          <>
            @{primaryHost?.address}:
            {`${primaryHost?.port}/defaultdb?${generalSslmode}`}
          </>
        ) : (
          <>
            @{primaryConnectionPoolHost?.address}:
            {primaryConnectionPoolHost?.port}/
            <StyledCode>{'{connection pool label}'}</StyledCode>
            ?sslmode=require
          </>
        )}
      </Box>
      {isCopying ? (
        <Box
          sx={(theme) => ({
            paddingX: theme.spacingFunction(8),
            position: 'relative',
            top: theme.spacingFunction(),
            backgroundColor: theme.palette.background.paper,
          })}
        >
          <Icon icon="spinner-gradient" size="s" />
        </Box>
      ) : (
        <Grid alignContent="center" size="auto">
          <CopyTooltip
            disabled={disablePasswordBtn}
            disabledReason={disabledPasswordTooltipText}
            onClickCallback={handleCopy}
            text={getServiceURIText(credentials, isGeneralServiceURI)}
          />
        </Grid>
      )}
      {hasPublicVPC && showPrivateVPC && (
        <Grid>
          <Tooltip
            style={{ marginLeft: Spacing.S4 }}
            tooltipPlacement="bottom"
            tooltipText="Private endpoints are resolvable only for resources within the VPC Subnet. Public endpoints are resolvable outside the VPC."
          >
            <Icon icon="info-outline" size="m" />
          </Tooltip>
        </Grid>
      )}
    </Grid>
  );
};

export const StyledCode = styled(Code, {
  label: 'StyledCode',
})(() => ({
  margin: 0,
}));
