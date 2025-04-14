import { Box, Paper, StyledLinkButton, Typography } from '@linode/ui';
import { ErrorBoundary } from '@sentry/react';
import { CatchBoundary } from '@tanstack/react-router';
import * as React from 'react';

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
        sx={{
          maxWidth: 600,
          boxShadow: `0 2px 6px 0 rgba(0, 0, 0, 0.18)`,
        }}
      >
        <Typography sx={{ mb: 2 }} variant="h1">
          Oh snap!{' '}
        </Typography>
        <Typography style={{ marginBottom: 8 }}>
          Something went wrong. Please try the following steps that may help
          resolve the issue.
        </Typography>
        <Typography>
          <ul>
            <li>
              <StyledLinkButton onClick={resetError}>
                Refresh the application
              </StyledLinkButton>{' '}
              or{' '}
              <StyledLinkButton onClick={() => window.location.reload()}>
                reload the page
              </StyledLinkButton>
            </li>
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
                href="https://techdocs.akamai.com/eaa/docs/app-response-codes-login-events-err"
                rel="noopener noreferrer"
                target="_blank"
              >
                Application response codes, login events, and errors
              </a>
            </li>
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
          {error.stack && (
            <details>
              <summary>
                <strong>Stack Trace</strong>
              </summary>
              <CodeBlock code={error.stack} language="typescript" />
            </details>
          )}
        </Typography>
      </Paper>
    </Box>
  );
};

export const ErrorBoundaryFallback: React.FC<{
  children?: React.ReactNode;
  useTanStackBoundary?: boolean;
}> = ({ children, useTanStackBoundary = false }) => (
  <ErrorBoundary fallback={ErrorComponent}>
    {useTanStackBoundary ? (
      <CatchBoundary getResetKey={() => 'error-boundary-fallback'}>
        {children}
      </CatchBoundary>
    ) : (
      children
    )}
  </ErrorBoundary>
);
