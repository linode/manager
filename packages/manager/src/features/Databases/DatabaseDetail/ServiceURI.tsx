import { useDatabaseCredentialsQuery } from '@linode/queries';
import { Button } from '@linode/ui';
import { Grid, styled } from '@mui/material';
import copy from 'copy-to-clipboard';
import { enqueueSnackbar } from 'notistack';
import React, { useState } from 'react';

import { Code } from 'src/components/Code/Code';
import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { StyledValueGrid } from 'src/features/Databases/DatabaseDetail/DatabaseSummary/DatabaseSummaryClusterConfiguration.style';

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
          enqueueSnackbar(
            'There was an error retrieving cluster credentials. Please try again.',
            { variant: 'error' }
          );
        }
        setIsCopying(false);
      } catch {
        setIsCopying(false);
        enqueueSnackbar(
          'There was an error retrieving cluster credentials. Please try again.',
          { variant: 'error' }
        );
      }
    }
  };

  const getServiceURIText = (
    credentials: DatabaseCredentials | undefined,
    isGeneralServiceURI?: boolean
  ) => {
    if (isGeneralServiceURI) {
      return `${engine}://${credentials?.password}@${primaryHost?.address}:${primaryHost?.port}/defaultdb?sslmode=require`;
    }
    return `postgres://${credentials?.username}:${credentials?.password}@${primaryConnectionPoolHost?.address}:${primaryConnectionPoolHost?.port}/{connection pool label}?sslmode=require`;
  };

  const getCredentials = (isGeneralServiceURI: boolean) => {
    return !isGeneralServiceURI
      ? `${credentials?.username}:${credentials?.password}`
      : credentials?.password;
  };

  // hide loading state if the user clicks on the copy icon
  const showBtnLoading =
    !isCopying && (credentialsLoading || credentialsFetching);

  const ErrorButton = (
    <Button
      loading={showBtnLoading}
      onClick={() => getDatabaseCredentials()}
      sx={(theme) => ({
        p: 0,
        color: theme.tokens.alias.Content.Text.Negative,
        '&:hover, &:focus': {
          color: theme.tokens.alias.Content.Text.Negative,
        },
      })}
    >
      {`{error. click to retry}`}
    </Button>
  );

  const RevealPasswordButton = (
    <Button
      loading={showBtnLoading}
      onClick={() => {
        setHidePassword(false);
        getDatabaseCredentials();
      }}
      sx={{ p: 0 }}
    >
      {`{click to reveal password}`}
    </Button>
  );

  return (
    <Grid display="contents">
      <StyledValueGrid
        data-testid="service-uri"
        size="grow"
        sx={{
          overflowX: 'auto',
          overflowY: 'hidden',
          p: isGeneralServiceURI ? '0' : null,
        }}
        whiteSpace="pre"
      >
        {engine}://
        {credentialsError
          ? ErrorButton
          : hidePassword || (!credentialsError && !credentials)
            ? RevealPasswordButton
            : getCredentials(isGeneralServiceURI)}
        {isGeneralServiceURI ? (
          <>
            @{primaryHost?.address}:
            {`${primaryHost?.port}/defaultdb?sslmode=require`}
          </>
        ) : (
          <>
            @{primaryConnectionPoolHost?.address}:
            {primaryConnectionPoolHost?.port}/
            <StyledCode>{'{connection pool label}'}</StyledCode>
            ?sslmode=require
          </>
        )}
      </StyledValueGrid>
      {isCopying ? (
        <Button loading sx={{ paddingLeft: 2 }}>
          {' '}
        </Button>
      ) : (
        <Grid alignContent="center" size="auto">
          <StyledCopyTooltip
            onClickCallback={handleCopy}
            text={getServiceURIText(credentials, isGeneralServiceURI)}
          />
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

const StyledCopyTooltip = styled(CopyTooltip, {
  label: 'StyledCopyTooltip',
})(({ theme }) => ({
  alignSelf: 'center',
  '& svg': {
    height: theme.spacingFunction(16),
    width: theme.spacingFunction(16),
  },
  '&:hover': {
    backgroundColor: 'transparent',
  },
  display: 'flex',
  margin: `0 ${theme.spacingFunction(4)}`,
}));
