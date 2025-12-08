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

import type { Database } from '@linode/api-v4';

interface ServiceURIProps {
  database: Database;
}

export const ServiceURI = (props: ServiceURIProps) => {
  const { database } = props;

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
          copy(
            `postgres://${data?.username}:${data?.password}@${database.hosts?.primary}`
          );
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

  const serviceURI = `postgres://${credentials?.username}:${credentials?.password}@${database.hosts?.primary}`;

  // hide loading state if the user clicks on the copy icon
  const showBtnLoading =
    !isCopying && (credentialsLoading || credentialsFetching);

  return (
    <StyledGridContainer display="flex">
      <Grid
        size={{
          md: 1.5,
          xs: 1.5,
        }}
      >
        <StyledLabelTypography>Service URI</StyledLabelTypography>
      </Grid>
      <StyledValueGrid>
        postgres://
        {credentialsError ? (
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
        ) : hidePassword || (!credentialsError && !credentials) ? (
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
        ) : (
          `${credentials?.username}:${credentials?.password}`
        )}
        @{database.hosts?.primary}:<Code>{'{connection pool port}'}</Code>/
        <Code>{'{connection pool label}'}</Code>
        <StyledCopyTooltip
          loading={isCopying}
          onClickCallback={handleCopy}
          text={serviceURI}
        />
      </StyledValueGrid>
    </StyledGridContainer>
  );
};

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
  marginLeft: theme.spacingFunction(4),
}));
