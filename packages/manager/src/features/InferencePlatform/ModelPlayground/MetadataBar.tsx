import { Box, keyframes, Stack, useTheme } from '@linode/ui';
import { useInterval } from '@linode/utilities';
import Check from '@mui/icons-material/Check';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import Warning from '@mui/icons-material/Warning';
import React, { memo, useCallback, useState } from 'react';

import { pulse } from './animations';

import type { MessageMetadata } from './ModelPlaygroundContext';

interface MetadataBarProps {
  error?: string;
  metadata?: MessageMetadata;
  startedAt: number;
  timeToFirstTokenMs?: number;
}

const statSlideIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/**
 * Returns a human-readable warning message for non-normal finish reasons,
 * or null when the response completed normally (no message needed).
 */
const getFinishMessage = (
  finishReason?: string,
  stopReason?: number | string
): null | string => {
  if (!finishReason) {
    return null;
  }

  if (finishReason === 'stop') {
    if (typeof stopReason === 'string') {
      return `Stopped at stop sequence: ${JSON.stringify(stopReason)}`;
    }

    // A numeric stop reason is a token ID, not a stop sequence.
    return null;
  }

  switch (finishReason) {
    case 'content_filter':
      return 'Response was filtered by a content policy';

    case 'function_call':
    case 'tool_calls':
      return 'Model attempted to make a tool call, but tool calling is not yet supported in the playground';

    case 'length':
      return 'Max output tokens reached — response may be incomplete';

    default:
      return `Response ended: ${finishReason}`;
  }
};

export const MetadataBar = memo(
  ({ error, metadata, startedAt, timeToFirstTokenMs }: MetadataBarProps) => {
    const theme = useTheme();
    const [elapsed, setElapsed] = useState(() => Date.now() - startedAt);
    const errored = Boolean(error);
    const pending = !metadata && !errored;
    const cancelled = metadata?.cancelled ?? false;
    const finishMessage = getFinishMessage(
      metadata?.finishReason,
      metadata?.stopReason
    );
    const warned = Boolean(!errored && !cancelled && !pending && finishMessage);
    const complete = !pending && !cancelled && !errored && !warned;

    const tickElapsed = useCallback(
      () => setElapsed(Date.now() - startedAt),
      [startedAt]
    );

    useInterval({
      callback: tickElapsed,
      delay: 100,
      when: !metadata && !errored,
    });

    const ttft =
      timeToFirstTokenMs !== undefined
        ? `${(timeToFirstTokenMs / 1000).toFixed(2)}s`
        : null;
    const displayMs = metadata ? metadata.durationMs : elapsed;
    const decodeMs =
      metadata && timeToFirstTokenMs !== undefined
        ? metadata.durationMs - timeToFirstTokenMs
        : null;
    const tps =
      metadata?.completionTokens && decodeMs !== null && decodeMs > 0
        ? (metadata.completionTokens / (decodeMs / 1000)).toFixed(1)
        : null;

    const stats = [
      { label: 'TTFT', value: ttft },
      { label: 'Response Time', value: `${(displayMs / 1000).toFixed(1)}s` },
      { label: 'Tokens/s', value: tps },
      { label: 'In Tokens', value: metadata?.promptTokens?.toString() ?? null },
      {
        label: 'Out Tokens',
        value: metadata?.completionTokens?.toString() ?? null,
      },
    ];

    return (
      <Stack
        alignItems="center"
        direction="row"
        sx={{
          bgcolor: complete
            ? theme.palette.mode === 'dark'
              ? theme.tokens.alias.Background.Recommendationsubtle
              : theme.tokens.color.Green[10]
            : errored
              ? theme.palette.mode === 'dark'
                ? theme.tokens.alias.Background.Negativesubtle
                : theme.tokens.color.Red[10]
              : warned || cancelled
                ? theme.palette.mode === 'dark'
                  ? theme.tokens.alias.Background.Warningsubtle
                  : theme.tokens.color.Yellow[10]
                : 'transparent',
          border:
            complete || errored || warned || cancelled
              ? 'none'
              : `1px solid ${theme.tokens.alias.Border.Normal}`,
          borderRadius: '8px',
          columnGap: 2.5,
          flexWrap: 'wrap',
          px: 1.5,
          py: 0.75,
          rowGap: 0.5,
        }}
      >
        {/* Icon + error text grouped so they never split across rows */}
        <Stack
          alignItems="center"
          direction="row"
          gap={1}
          sx={{
            flex: errored || cancelled || warned ? '1 1 auto' : '0 0 auto',
            minWidth: 0,
          }}
        >
          {pending ? (
            <Box
              sx={{
                animation: `${pulse} 1.2s ease-out infinite`,
                bgcolor: 'text.disabled',
                borderRadius: '50%',
                flexShrink: 0,
                height: 11,
                width: 11,
              }}
            />
          ) : errored ? (
            <ErrorOutline
              sx={{
                color: theme.palette.error.dark,
                flexShrink: 0,
                fontSize: '16px',
              }}
            />
          ) : cancelled || warned ? (
            <Warning
              sx={{
                color: theme.tokens.alias.Content.Icon.Warning,
                flexShrink: 0,
                fontSize: '16px',
              }}
            />
          ) : (
            <Check
              sx={{
                color: theme.tokens.alias.Content.Icon.Recommendation,
                flexShrink: 0,
                fontSize: '16px',
              }}
            />
          )}
          {(errored || cancelled || warned) && (
            <Box
              sx={{
                color: errored ? theme.palette.error.dark : 'text.secondary',
                flex: 1,
                fontSize: theme.tokens.font.FontSize.Xs,
                minWidth: 0,
                overflowWrap: 'break-word',
              }}
            >
              {errored
                ? error
                : cancelled
                  ? 'Response was cancelled'
                  : finishMessage}
            </Box>
          )}
        </Stack>
        <Stack
          alignItems="center"
          direction="row"
          gap={2}
          sx={{
            color: complete ? 'text.primary' : 'text.secondary',
            flex: '1 1 auto',
            flexWrap: 'wrap',
            fontSize: theme.tokens.font.FontSize.Xs,
            justifyContent: 'flex-end',
            minWidth: 0,
          }}
        >
          {stats
            .filter(({ value }) => value !== null)
            .map(({ label, value }) => (
              <Box
                component="span"
                key={label}
                sx={{ animation: `${statSlideIn} 0.3s ease-in-out both` }}
              >
                <Box component="span" sx={{ font: theme.font.semibold }}>
                  {value}
                </Box>{' '}
                {label}
              </Box>
            ))}
        </Stack>
      </Stack>
    );
  }
);
