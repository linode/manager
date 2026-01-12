import { useDatabaseCredentialsQuery } from '@linode/queries';
import { Button } from '@linode/ui';
import { Grid, styled } from '@mui/material';
import copy from 'copy-to-clipboard';
import { enqueueSnackbar } from 'notistack';
import React, { useState } from 'react';

import { Code } from 'src/components/Code/Code';
import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import {
  StyledGridContainer,
  StyledLabelTypography,
  StyledValueGrid,
} from 'src/features/Databases/DatabaseDetail/DatabaseSummary/DatabaseSummaryClusterConfiguration.style';

import type { Database, DatabaseCredentials } from '@linode/api-v4';

interface ServiceURIProps {
  database: Database;
  isGeneralServiceURI?: boolean;
}

export const ServiceURI = (props: ServiceURIProps) => {
  const { database, isGeneralServiceURI = false } = props;

  const [hidePassword, setHidePassword] = useState(true);
  const [isCopying, setIsCopying] = useState(false);

  const {
    data: credentials,
    error: credentialsError,
    isLoading: credentialsLoading,
    isFetching: credentialsFetching,
    refetch: getDatabaseCredentials,
  } = useDatabaseCredentialsQuery(database.engine, database.id, !hidePassword);

  const handleCopy = async () => {
    if (!credentials) {
      try {
        setIsCopying(true);
        const { data } = await getDatabaseCredentials();
        if (data) {
          // copy with revealed credentials
          copy(getServiceURIText(isGeneralServiceURI, data));
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
    isGeneralServiceURI: boolean,
    credentials: DatabaseCredentials | undefined
  ) => {
    if (isGeneralServiceURI) {
      return `${database.engine}://${credentials?.password}@${database.hosts?.primary}:${database.port}/defaultdb?sslmode=require`;
    }
    return `postgres://${credentials?.username}:${credentials?.password}@${database.hosts?.primary}{connection pool port}/{connection pool label}?sslmode=require`;
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

  const ServiceURIJSX = (isGeneralServiceURI: boolean) => (
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
        {database.engine}://
        {credentialsError
          ? ErrorButton
          : hidePassword || (!credentialsError && !credentials)
            ? RevealPasswordButton
            : getCredentials(isGeneralServiceURI)}
        {!isGeneralServiceURI ? (
          <>
            @{database.hosts?.primary}:
            <StyledCode>{'{connection pool port}'}</StyledCode>/
            <StyledCode>{'{connection pool label}'}</StyledCode>
            ?sslmode=require
          </>
        ) : (
          <>
            @{database.hosts?.primary}:
            {`${database.port}/defaultdb?sslmode=require`}
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
            text={getServiceURIText(isGeneralServiceURI, credentials)}
          />
        </Grid>
      )}
    </Grid>
  );

  if (isGeneralServiceURI) {
    return ServiceURIJSX(isGeneralServiceURI);
  }

  return (
    <StyledGridContainer display="flex">
      <Grid
        size={{
          md: 1.5,
          xs: 3,
        }}
      >
        <StyledLabelTypography>Service URI</StyledLabelTypography>
      </Grid>
      {ServiceURIJSX(isGeneralServiceURI)}
    </StyledGridContainer>
  );
};

export const StyledCode = styled(Code, {
  label: 'StyledCode',
})(() => ({
  margin: 0,
}));

export const StyledCopyTooltip = styled(CopyTooltip, {
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
