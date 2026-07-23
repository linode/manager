import { Box, Paper, Stack, Typography } from '@linode/ui';
import React from 'react';

export interface SpeedrunStep {
  description: string;
  title: string;
}

interface SpeedrunSectionCardProps {
  step: SpeedrunStep;
  stepNumber: number;
}

export const SpeedrunSectionCard = ({
  step,
  stepNumber,
}: SpeedrunSectionCardProps) => {
  return (
    <Paper
      sx={{ border: 'none', borderRadius: 1, p: '12px' }}
      variant="outlined"
    >
      <Stack gap={0}>
        <Stack alignItems="flex-start" direction="row" gap={1.4}>
          <Box
            sx={(theme) => ({
              alignItems: 'center',
              backgroundColor: theme.palette.info.light,
              borderRadius: '50%',
              color: theme.tokens.color.Neutrals[90],
              display: 'inline-flex',
              font: theme.font.bold,
              height: '40px',
              justifyContent: 'center',
              width: '40px',
              flexShrink: 0,
            })}
          >
            {stepNumber}
          </Box>

          <Stack alignItems="flex-start" direction="column" gap={0}>
            <Typography
              sx={(theme) => ({
                fontSize: 14,
                color: theme.palette.primary.main,
                font: theme.font.bold,
                paddingTop: '2px',
              })}
            >
              {step.title}
            </Typography>

            <Typography
              sx={(theme) => ({
                fontSize: 12,
                lineHeight: '18px',
                color: theme.palette.text.secondary,
                font: theme.font.semibold,
              })}
            >
              {step.description}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
};
