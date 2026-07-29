import { Box, Paper, Stack, Typography, useTheme } from '@linode/ui';
import React, { useContext, useEffect, useState } from 'react';

import AkamaiWave from 'src/assets/logo/akamai-wave.svg';

import { MODEL_SUPPLEMENTARY } from '../ModelLibrary/modelLibrary.supplementary';
import { providerIcon, providerIconStyles } from '../utils';
import {
  ModelPlaygroundModelContext,
  ModelPlaygroundOutputContext,
} from './ModelPlaygroundContext';

export const PlaygroundEmptyState = () => {
  const { selectedModel } = useContext(ModelPlaygroundModelContext);
  const { messages } = useContext(ModelPlaygroundOutputContext);
  const theme = useTheme();

  // Defer visibility by one tick so the CSS transition fires on mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isVisible = mounted && messages.length === 0 && Boolean(selectedModel);

  const supp = selectedModel ? MODEL_SUPPLEMENTARY[selectedModel] : undefined;
  const ProviderIcon = supp?.providerLogo
    ? providerIcon(supp.providerLogo)
    : null;

  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      sx={{
        bottom: 0,
        left: 0,
        pointerEvents: isVisible ? 'auto' : 'none',
        position: 'absolute',
        px: 2,
        right: 0,
        top: 0,
      }}
    >
      <Paper
        sx={{
          border: `1px solid ${theme.color.border2}`,
          borderRadius: 2,
          boxShadow: `1px 1px 6px 0px ${theme.color.boxShadow}`,
          maxWidth: 560,
          opacity: isVisible ? 1 : 0,
          p: 4,
          transform: isVisible ? 'translateY(-8px)' : 'translateY(0)',
          transition: 'opacity 280ms ease, transform 280ms ease',
          width: '100%',
        }}
      >
        <Stack alignItems="center" direction="row" gap={1.5} sx={{ mb: 1.5 }}>
          {ProviderIcon && (
            <Box
              component={ProviderIcon}
              height={16}
              style={providerIconStyles(supp!.providerLogo!, theme)}
              sx={{ flexShrink: 0 }}
              width={16}
            />
          )}
          <Typography
            component="strong"
            sx={{
              display: 'block',
              font: theme.font.bold,
              fontSize: '1rem',
            }}
          >
            {supp?.title ?? selectedModel}
          </Typography>
        </Stack>
        {supp?.title && (
          <Typography
            sx={{
              color: 'text.secondary',
              fontSize: theme.tokens.font.FontSize.Xs,
              lineHeight: 1.6,
            }}
          >
            <Box component="span" sx={{ mr: 0.8 }}>
              Experiment with{' '}
              <Box component="span" sx={{ font: theme.font.semibold }}>
                {supp.title}
              </Box>{' '}
              running on
            </Box>
            <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
              <Box
                component={AkamaiWave}
                sx={{
                  '& path': { fill: theme.color.blue },
                  display: 'inline-block',
                  height: theme.tokens.font.FontSize.Xs,
                  mr: 0.2,
                  position: 'relative',
                  top: '-3px',
                  verticalAlign: 'middle',
                  width: 'auto',
                }}
              />
              Akamai Inference Cloud
            </Box>
          </Typography>
        )}
      </Paper>
    </Stack>
  );
};
