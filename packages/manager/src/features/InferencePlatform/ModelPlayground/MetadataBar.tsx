import {
  Checkmark,
  StatusAlertFilled,
  StatusFailureErrorOutline,
} from '@akamai/cds-icons/react';
import { useTheme } from '@linode/ui';
import React, { memo } from 'react';

import './animations.css';
import { Box, Stack } from '../components';
import { InferenceLoader } from './InferenceLoader';

import type { MessageMetadata } from './ModelPlaygroundContext';

interface MetadataBarProps {
  error?: string;
  metadata?: MessageMetadata;
  timeToFirstTokenMs?: number;
}

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
  ({ error, metadata, timeToFirstTokenMs }: MetadataBarProps) => {
    const theme = useTheme();
    const errored = Boolean(error);
    const pending = !metadata && !errored;
    const cancelled = metadata?.cancelled ?? false;
    const finishMessage = getFinishMessage(
      metadata?.finishReason,
      metadata?.stopReason
    );
    const warned = Boolean(!errored && !cancelled && !pending && finishMessage);
    const complete = !pending && !cancelled && !errored && !warned;

    const ttft =
      timeToFirstTokenMs !== undefined
        ? `${(timeToFirstTokenMs / 1000).toFixed(2)}s`
        : null;
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
      ...(metadata
        ? [
            {
              label: 'Response Time',
              value: `${(metadata.durationMs / 1000).toFixed(1)}s`,
            },
          ]
        : []),
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
        flexWrap="wrap"
        style={{
          backgroundColor: complete
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
          gap: '4px 20px',
          minHeight: 32,
          padding: '6px 12px',
        }}
      >
        {/* Icon + error text grouped so they never split across rows */}
        <Stack
          alignItems="center"
          direction="row"
          spacing="8px"
          style={{
            flex: errored || cancelled || warned ? '1 1 auto' : '0 0 auto',
            minWidth: 0,
          }}
        >
          {pending ? (
            <>
              <Box
                style={{
                  animation: `pulse 1.2s ease-out infinite`,
                  backgroundColor: theme.palette.text.disabled,
                  borderRadius: '50%',
                  flexShrink: 0,
                  height: 11,
                  width: 11,
                }}
              />
              <InferenceLoader color="hsla(173, 80%, 36%, 0.6)" />
            </>
          ) : errored ? (
            <StatusFailureErrorOutline
              aria-label="Error"
              height={16}
              role="img"
              style={{ color: theme.palette.error.dark, flexShrink: 0 }}
              width={16}
            />
          ) : cancelled || warned ? (
            <StatusAlertFilled
              aria-label="Warning"
              height={16}
              role="img"
              style={{
                color: theme.tokens.alias.Content.Icon.Warning,
                flexShrink: 0,
              }}
              width={16}
            />
          ) : (
            <Checkmark
              aria-label="Success"
              height={16}
              role="img"
              style={{
                color: theme.tokens.alias.Content.Icon.Recommendation,
                flexShrink: 0,
              }}
              width={16}
            />
          )}
          {(errored || cancelled || warned) && (
            <Box
              style={{
                color: errored
                  ? theme.palette.error.dark
                  : theme.palette.text.secondary,
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
          flexWrap="wrap"
          justifyContent="flex-end"
          spacing="16px"
          style={{
            color: complete
              ? theme.palette.text.primary
              : theme.palette.text.secondary,
            flex: '1 1 auto',
            fontSize: theme.tokens.font.FontSize.Xs,
            minWidth: 0,
          }}
        >
          {stats
            .filter(({ value }) => value !== null)
            .map(({ label, value }) => (
              <Box
                component="span"
                key={label}
                style={{ animation: `statSlideIn 0.3s ease-in-out both` }}
              >
                <Box component="span" style={{ font: theme.font.semibold }}>
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
