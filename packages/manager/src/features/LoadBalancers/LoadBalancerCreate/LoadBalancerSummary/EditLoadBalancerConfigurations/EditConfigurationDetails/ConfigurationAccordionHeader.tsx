import React from 'react';

import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
import { pluralize } from 'src/utilities/pluralize';

import {
  EditActionButton,
  StyledPaper,
} from '../../LoadBalancerSummary.styles';

import type { LoadBalancerCreateFormData } from '../../../LoadBalancerCreateFormWrapper';

interface Props {
  configuration: LoadBalancerCreateFormData['configurations'][number];
  editClickHandler: () => void;
}

export const ConfigurationAccordionHeader = ({
  configuration,
  editClickHandler,
}: Props) => {
  return (
    <Stack
      alignItems="center"
      direction="row"
      flexWrap="wrap"
      gap={1}
      justifyContent="space-between"
    >
      <Stack alignItems="center" direction="row" spacing={1}>
        <Typography variant="h3">
          Configuration &mdash; {configuration.label}
        </Typography>
        <Typography>|</Typography>
        <Typography fontSize="1rem">
          {pluralize('Route', 'Routes', configuration.routes?.length ?? 0)}
        </Typography>
      </Stack>
      <StyledPaper>
        <EditActionButton onClick={editClickHandler}>Edit</EditActionButton>
      </StyledPaper>
    </Stack>
  );
};
