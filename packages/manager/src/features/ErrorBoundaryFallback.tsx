import { Box, Button, Paper, Stack, Typography } from '@linode/ui';
import { ErrorBoundary } from '@sentry/react';
import { CatchBoundary } from '@tanstack/react-router';
import * as React from 'react';

import ZeroState from 'src/assets/icons/zero-state.svg';
import { CodeBlock } from 'src/components/CodeBlock/CodeBlock';

export const ErrorComponent = ({
  error,
  resetError,
}: {
  error: Error;
  eventId: string;
  resetError(): void;
}) => {
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
          maxWidth: 600,
          border: `1px solid ${theme.tokens.alias.Border.Normal}`,
        })}
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
        <Typography>
          <ul>
            <li>Update your browser version</li>
            <li>Clear your cookies</li>
            <li>Check your internet connection</li>
          </ul>
        </Typography>
        <Typography>
          <strong>Resources:</strong>{' '}
        </Typography>
        <Typography>
          <ul>
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
          </ul>
        </Typography>
        <Typography>
          <strong>Error details:</strong>{' '}
          <CodeBlock
            code={`${error.name}: ${error.message}`}
            language="typescript"
          />
        </Typography>
        <Stack
          direction="row"
          justifyContent="center"
          marginTop={3}
          spacing={2}
        >
          <Button buttonType="outlined" onClick={resetError}>
            Refresh the application
          </Button>
          <Button buttonType="primary" onClick={() => window.location.reload()}>
            Reload the page
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export const ErrorBoundaryFallback: React.FC<{
  children?: React.ReactNode;
  useTanStackRouterBoundary?: boolean;
}> = ({ children, useTanStackRouterBoundary = false }) => (
  <ErrorBoundary fallback={ErrorComponent}>
    {useTanStackRouterBoundary ? (
      <CatchBoundary getResetKey={() => 'error-boundary-fallback'}>
        {children}
      </CatchBoundary>
    ) : (
      children
    )}
  </ErrorBoundary>
);
