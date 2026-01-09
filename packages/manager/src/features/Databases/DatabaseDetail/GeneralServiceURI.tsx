import { useDatabaseCredentialsQuery } from '@linode/queries';
import { Button } from '@linode/ui';
import { Grid, styled } from '@mui/material';
import copy from 'copy-to-clipboard';
import { enqueueSnackbar } from 'notistack';
import React, { useState } from 'react';

import { Code } from 'src/components/Code/Code';
import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { StyledValueGrid } from 'src/features/Databases/DatabaseDetail/DatabaseSummary/DatabaseSummaryClusterConfiguration.style';

import type { Database } from '@linode/api-v4';

interface GeneralServiceURIProps {
  database: Database;
}

export const GeneralServiceURI = (props: GeneralServiceURIProps) => {
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
          // copy with password data
          copy(
            `${database.engine}://${data?.password}@${database.hosts?.primary}:${database.port}/defaultdb?sslmode=require`
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

  // hide loading state if the user clicks on the copy icon
  const showBtnLoading =
    !isCopying && (credentialsLoading || credentialsFetching);

  const generalServiceURI = `${database.engine}://${credentials?.password}@${database.hosts?.primary}:${database.port}/defaultdb?sslmode=require`;

  return (
    <Grid display="contents">
      <StyledValueGrid
        data-testid="service-uri"
        size="grow"
        sx={{ overflowX: 'auto', overflowY: 'hidden', p: 0 }}
        whiteSpace="pre"
      >
        {database.engine}://
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
          credentials?.password
        )}
        @{database.hosts?.primary}:
        {`${database.port}/defaultdb?sslmode=require`}
      </StyledValueGrid>
      {isCopying ? (
        <Button loading sx={{ paddingLeft: 2 }}>
          {' '}
        </Button>
      ) : (
        <Grid alignContent="center" size="auto">
          <StyledCopyTooltip
            onClickCallback={handleCopy}
            text={generalServiceURI}
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
