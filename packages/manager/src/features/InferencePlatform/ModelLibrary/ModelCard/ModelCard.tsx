import { Box, Paper, Stack, Typography } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import React from 'react';

import { Skeleton } from 'src/components/Skeleton';

import { providerIcon, providerIconStyles } from '../../utils';
import { InfoChip } from './InfoChip';
import { PlaygroundLink } from './PlaygroundLink';

import type { Model } from '../modelLibrary.types';

interface ModelCardProps {
  model: Model;
}

export const ModelCard = ({ model }: ModelCardProps) => {
  const cmTheme = useTheme();

  return (
    <Paper
      sx={(theme) => ({
        borderRadius: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        paddingTop: 3.5,
        paddingRight: 3.5,
        paddingLeft: 3.5,
        paddingBottom: 3,
        '&:hover': {
          boxShadow: 3,
        },
      })}
    >
      {/* Header: logo + title + provider + Playground link */}
      <Stack
        alignItems="flex-start"
        direction="row"
        justifyContent="space-between"
      >
        <Stack alignItems="flex-start" direction="row" gap={1.5}>
          {model.providerLogo ? (
            <Box
              component={providerIcon(model.providerLogo)!}
              height={36}
              style={providerIconStyles(model.providerLogo, cmTheme)}
              width={36}
            />
          ) : (
            <Box
              sx={(theme) => ({
                alignItems: 'center',
                bgcolor: theme.palette.primary.main,
                borderRadius: '50%',
                color: theme.palette.primary.contrastText,
                display: 'flex',
                flexShrink: 0,
                fontSize: 14,
                fontFamily: theme.font.bold,
                height: 36,
                justifyContent: 'center',
                width: 36,
              })}
            >
              {model.providerName.charAt(0).toUpperCase()}
            </Box>
          )}
          <Stack>
            <Typography
              sx={(theme) => ({
                color: theme.palette.primary.main,
                font: theme.font.bold,
              })}
              variant="h3"
            >
              {model.title}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {model.providerName}
            </Typography>
          </Stack>
        </Stack>

        {/* Playground link */}
        {model.isServerless && <PlaygroundLink modelId={model.id} />}
      </Stack>

      {/* Description */}
      {model.description && (
        <Typography
          sx={(theme) => ({
            lineHeight: 1.5,
            font: theme.font.semibold,
            minHeight: 58,
          })}
          variant="body2"
        >
          {model.descriptionShort}
        </Typography>
      )}

      {/* Use-case tags */}
      {model.useCaseTags.length > 0 && (
        <Stack direction="row" flexWrap="wrap" gap={0.4}>
          {model.useCaseTags.slice(0, 3).map((tag, index) => (
            <InfoChip
              description={tag.description}
              key={`tag-${index}`}
              type="useCase"
              value={tag.label}
            />
          ))}
        </Stack>
      )}

      {/* Stats row */}
      <Stack direction="row" gap={0.4} sx={{ mt: 0.5 }}>
        <InfoChip
          title="Parameters"
          titlePosition="after"
          type="metric"
          value={`${model.parametersB} B`}
        />
        <InfoChip
          title="Context Length"
          titlePosition="after"
          type="metric"
          value={`${model.contextLengthK} K`}
        />
      </Stack>

      {/* Pricing */}
      <Typography variant="body2">
        Price:{' '}
        <Box
          component="span"
          sx={(theme) => ({
            font: theme.font.bold,
          })}
        >
          ${model.priceInputPerMillion.toFixed(2)} input / $
          {model.priceOutputPerMillion.toFixed(2)} output
        </Box>{' '}
        per 1 million tokens
      </Typography>

      {/* Footer: capabilities + Serverless badge */}
      {/* <Stack alignItems="center" direction="row" justifyContent="space-between">
        {model.isServerless && <IsServerlessChip />}
      </Stack> */}
    </Paper>
  );
};

export const ModelCardSkeleton = () => {
  return (
    <Paper
      sx={(theme) => ({
        border: `1px solid ${theme.borderColors.divider}`,
        borderRadius: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        p: 2,
      })}
      variant="outlined"
    >
      {/* Header skeleton */}
      <Stack alignItems="center" direction="row" gap={1.5}>
        <Skeleton height={36} variant="circular" width={36} />
        <Stack gap={0.5} sx={{ flex: 1 }}>
          <Skeleton height={20} width="40%" />
          <Skeleton height={16} width="25%" />
        </Stack>
        <Skeleton height={16} width={90} />
      </Stack>
      {/* Description skeleton */}
      <Stack gap={0.5}>
        <Skeleton height={14} width="100%" />
        <Skeleton height={14} width="90%" />
        <Skeleton height={14} width="75%" />
      </Stack>
      {/* Tags skeleton */}
      <Stack direction="row" gap={1}>
        <Skeleton height={24} width={90} />
        <Skeleton height={24} width={110} />
        <Skeleton height={24} width={80} />
      </Stack>
      {/* Stats skeleton */}
      <Stack direction="row" gap={0}>
        <Skeleton height={40} sx={{ flex: 1 }} />
        <Skeleton height={40} sx={{ flex: 1, ml: '1px' }} />
      </Stack>
      {/* Price skeleton */}
      <Skeleton height={16} width="60%" />
      {/* Footer skeleton */}
      <Stack direction="row" gap={1}>
        <Skeleton height={24} width={60} />
        <Skeleton height={24} width={65} />
        <Skeleton height={24} width={80} />
      </Stack>
    </Paper>
  );
};
