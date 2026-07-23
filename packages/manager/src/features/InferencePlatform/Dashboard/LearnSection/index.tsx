import { Box, Stack, Typography } from '@linode/ui';
import React from 'react';

import { LearnCard } from './LearnCard';

import type { LearnItem } from './LearnCard';

const LEARN_SECTION_ENABLED = false;

const learnColumns: LearnItem[][] = [
  [
    {
      href: 'https://techdocs.akamai.com/cloud-computing/docs/inference',
      label: 'Inference API overview',
    },
    {
      href: 'https://techdocs.akamai.com/cloud-computing/docs/authentication',
      label: 'Authentication guide',
    },
  ],
  [
    {
      href: 'https://techdocs.akamai.com/cloud-computing/docs/model-selection',
      label: 'Model selection best practices',
    },
    {
      href: 'https://techdocs.akamai.com/cloud-computing/docs/prompting',
      label: 'Prompt engineering tips',
    },
  ],
  [
    {
      href: 'https://techdocs.akamai.com/cloud-computing/docs/usage-and-billing',
      label: 'Usage and billing',
    },
    {
      href: 'https://techdocs.akamai.com/cloud-computing/docs/troubleshooting',
      label: 'Troubleshooting reference',
    },
  ],
];

export const LearnSection = () => {
  if (!LEARN_SECTION_ENABLED) {
    return null;
  }

  return (
    <Stack marginBottom={4}>
      <Typography sx={{ mb: 2 }} variant="h3">
        Learn
      </Typography>

      <Box
        sx={(theme) => ({
          display: 'grid',
          gap: 2,
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          [theme.breakpoints.down('md')]: {
            gridTemplateColumns: '1fr',
          },
        })}
      >
        {learnColumns.map((column, index) => (
          <LearnCard items={column} key={`learn-column-${index}`} />
        ))}
      </Box>
    </Stack>
  );
};
