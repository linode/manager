import { Box, Paper, Stack, Typography } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import React from 'react';

import { providerIcon, providerIconStyles } from '../../utils';
import { InfoChip } from './InfoChip';
import { PlaygroundLink } from './PlaygroundLink';

import type { Model } from '../modelLibrary.types';

interface ModelRowProps {
  model: Model;
}

export const ModelRow = ({ model }: ModelRowProps) => {
  const cmTheme = useTheme();

  return (
    <Paper
      sx={(theme) => ({
        borderRadius: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.2,
        paddingTop: 1.75,
        paddingRight: 1.75,
        paddingLeft: 1.75,
        paddingBottom: 1.15,
        border: `1px solid ${theme.palette.mode === 'light' ? 'hsl(220,40%,93%)' : 'hsl(220,5%,28%)'}`,
        '&:hover': {
          borderColor: `${theme.palette.mode === 'light' ? 'hsl(220,40%,85%)' : 'hsl(220,5%,35%)'}`,
          cursor: 'pointer',
        },
        '&:active': {
          borderColor: `${theme.palette.mode === 'light' ? 'hsl(220,40%,70%)' : 'hsl(220,5%,40%)'}`,
        },
      })}
    >
      {/* Header: logo + title + provider + Playground link */}
      <Stack
        alignItems="flex-start"
        direction="row"
        justifyContent="space-between"
      >
        <Stack alignContent="flex-start" direction="row" gap={1.5}>
          <Box
            component={providerIcon(model.providerLogo)!}
            height={22}
            style={providerIconStyles(model.providerLogo, cmTheme)}
            width={22}
          />

          <Stack>
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              <Typography
                sx={(theme) => ({
                  color: theme.palette.primary.dark,
                  font: theme.font.semibold,
                  fontSize: 14,
                  flexGrow: 1,
                })}
              >
                {`${model.providerName} / `}
              </Typography>
              <Typography
                sx={(theme) => ({
                  color: theme.palette.primary.main,
                  font: theme.font.bold,
                  fontSize: 14,
                  flexGrow: 1,
                })}
              >
                {model.title}
              </Typography>
            </Box>
          </Stack>
        </Stack>

        {/* Playground link */}
        {model.isServerless && <PlaygroundLink modelId={model.id} />}
      </Stack>

      {/* Stats row */}
      {/* <Stack direction="row" gap={0.4} sx={{ mt: 0.5 }}>
        <MetricChip label="Parameters" metric={`${model.parametersB} B`} />
        <MetricChip
          label="Context Length"
          metric={`${model.contextLengthK} K`}
        />
      </Stack> */}

      {/* Pricing */}
      {/* <Typography variant="body2">
        Price:{' '}
        <Box component="span" sx={(theme) => ({ font: theme.font.bold })}>
          ${model.priceInputPerMillion.toFixed(2)} input / $
          {model.priceOutputPerMillion.toFixed(2)} output
        </Box>{' '}
        per 1 million tokens
      </Typography> */}

      {/* Footer: capabilities + Serverless badge */}
      <Stack
        alignItems="center"
        direction="row"
        justifyContent="space-between"
        paddingTop={0.5}
      >
        {model.useCaseTags.length > 0 && (
          <Stack
            alignItems="flex-start"
            direction="row"
            gap={0.4}
            justifyContent="space-between"
          >
            {model.useCaseTags.slice(0, 5).map((tag, index) => (
              <InfoChip key={`tag-${index}`} type="useCase" value={tag.label} />
            ))}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};
