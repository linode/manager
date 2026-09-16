import { useTheme } from '@linode/ui';
import React, { useContext, useEffect, useMemo, useState } from 'react';

import AkamaiWave from 'src/assets/logo/akamai-wave.svg';

import { Box, Paper, Stack, Typography } from '../components';
import { InferenceLogo } from '../InferenceLogo';
import { useInferencePlatform } from '../InferencePlatformContext';
import { mergeInferenceModel } from '../ModelLibrary/modelLibraryUtils';
import {
  ModelPlaygroundModelContext,
  ModelPlaygroundOutputContext,
} from './ModelPlaygroundContext';
import './PlaygroundEmptyState.css';

export const PlaygroundEmptyState = () => {
  const { selectedModel } = useContext(ModelPlaygroundModelContext);
  const { messages } = useContext(ModelPlaygroundOutputContext);
  const { models } = useInferencePlatform();
  const theme = useTheme();

  // Defer visibility by one tick so the CSS transition fires on mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isVisible = mounted && messages.length === 0 && Boolean(selectedModel);

  // Same merged `Model` shape used everywhere else (Model Library, Details).
  const merged = useMemo(() => {
    const apiModel = selectedModel
      ? models.find((m) => m.id === selectedModel)
      : undefined;
    return apiModel ? mergeInferenceModel(apiModel) : undefined;
  }, [models, selectedModel]);

  const providerLogo = merged?.modelLogo || merged?.providerLogo;
  const title = merged?.title ?? selectedModel;

  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      style={{
        bottom: 0,
        left: 0,
        pointerEvents: isVisible ? 'auto' : 'none',
        position: 'absolute',
        paddingLeft: '16px',
        paddingRight: '16px',
        right: 0,
        top: 0,
      }}
    >
      <Paper
        style={{
          backgroundColor:
            theme.palette.mode === 'light' ? theme.bg.white : theme.bg.offWhite,
          border: `1px solid ${theme.color.border2}`,
          borderRadius: '8px',
          boxShadow: `1px 1px 6px 0px ${theme.color.boxShadow}`,
          maxWidth: 560,
          opacity: isVisible ? 1 : 0,
          padding: '32px',
          transform: isVisible ? 'translateY(-8px)' : 'translateY(0)',
          transition: 'opacity 280ms ease, transform 280ms ease',
          width: '100%',
        }}
      >
        <Stack
          alignItems="center"
          direction="row"
          spacing="12px"
          style={{ marginBottom: '12px' }}
        >
          {providerLogo && (
            <InferenceLogo
              alt=""
              kind="model"
              style={{ flexShrink: 0, height: 16, width: 16 }}
              value={providerLogo}
            />
          )}
          <Typography
            component="strong"
            style={{
              display: 'block',
              font: theme.font.bold,
              fontSize: '1rem',
            }}
          >
            {title}
          </Typography>
        </Stack>
        {merged?.title && (
          <Typography
            style={{
              color: theme.palette.text.secondary,
              fontSize: theme.tokens.font.FontSize.Xs,
              lineHeight: 1.6,
            }}
          >
            <Box component="span" style={{ marginRight: '6px' }}>
              Experiment with{' '}
              <Box component="span" style={{ font: theme.font.semibold }}>
                {merged.title}
              </Box>{' '}
              running on
            </Box>
            <Box component="span" style={{ whiteSpace: 'nowrap' }}>
              <AkamaiWave
                className="ip-akamai-wave"
                style={{
                  color: theme.color.blue,
                  display: 'inline-block',
                  height: theme.tokens.font.FontSize.Xs,
                  marginRight: '2px',
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
