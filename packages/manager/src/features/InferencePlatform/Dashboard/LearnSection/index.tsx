import React from 'react';

import { Box, Stack, Typography } from '../../components';
import { LearnCard } from './LearnCard';
import styles from './LearnSection.module.css';

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
    <Stack className={styles.stack}>
      <Typography className={styles.typography}>Learn</Typography>

      <Box className={styles.box}>
        {learnColumns.map((column, index) => (
          <LearnCard items={column} key={`learn-column-${index}`} />
        ))}
      </Box>
    </Stack>
  );
};
