import { Box, Button, Paper, Stack, Typography } from '@linode/ui';
import * as React from 'react';

import ZeroState from 'src/assets/icons/zero-state.svg';
import { CodeBlock } from 'src/components/CodeBlock/CodeBlock';

export const ErrorComponent = ({
  error,
  resetError,
}: {
  error: unknown;
  eventId: string;
  resetError(): void;
}) => {
  const normalizedError = normalizeError(error);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      }}
    >
      <Paper
        sx={(theme) => ({
          [theme.breakpoints.down('md')]: {
            maxWidth: 380,
          },
          [theme.breakpoints.up('md')]: {
            maxWidth: 600,
          },
        })}
        variant="outlined"
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ZeroState />
        </Box>
        <Typography sx={{ mb: 2, textAlign: 'center' }} variant="h1">
          Something went wrong{' '}
        </Typography>
        <Typography style={{ marginBottom: 8 }}>
          Please try the following steps that may help resolve the issue:
        </Typography>
        <Typography component="ul">
          <li>Update your browser version</li>
          <li>Clear your cookies</li>
          <li>Check your internet connection</li>
        </Typography>
        <Typography sx={{ my: 1 }}>
          <strong>Resources:</strong>{' '}
        </Typography>
        <Typography component="ul">
          <li>
            <a
              href="https://www.linode.com/docs/guides/clear-cache-shortguide"
              rel="noopener noreferrer"
              target="_blank"
            >
              Clearing cache and cookies in a browser
            </a>
          </li>
          <li>
            <a
              href="https://www.linode.com/support"
              rel="noopener noreferrer"
              target="_blank"
            >
              Akamai Compute Support
            </a>
          </li>
        </Typography>
        <Typography component="div" sx={{ mt: 2 }}>
          <strong>Error details:</strong>{' '}
          <CodeBlock
            code={`${normalizedError.name}: ${normalizedError.message}`}
            language="typescript"
          />
        </Typography>
        <Stack
          direction="row"
          justifyContent="center"
          marginTop={3}
          spacing={2}
          sx={{
            '& .MuiButton-root': {
              width: 175,
            },
          }}
        >
          <Button buttonType="outlined" onClick={resetError}>
            Refresh application
          </Button>
          <Button buttonType="primary" onClick={() => window.location.reload()}>
            Reload page
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

const normalizeError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === 'string') {
    return new Error(error);
  }

  if (Array.isArray(error) && error.length === 1 && error[0]?.reason) {
    return new Error(error[0].reason);
  }

  if (typeof error === 'function' || error === undefined) {
    return new Error('Unknown error');
  }

  return new Error(JSON.stringify(error));
};
