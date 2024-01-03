import React from 'react';

import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
import { pluralize } from 'src/utilities/pluralize';

import {
  EditActionButton,
  StyledPaper,
} from '../../LoadBalancerSummary.styles';

import type { RoutePayload } from '@linode/api-v4';

interface Props {
  onEditClick: () => void;
  route: RoutePayload;
}

export const RouteAccordionHeader = ({ onEditClick, route }: Props) => {
  return (
    <Stack
      alignItems="center"
      direction="row"
      flexWrap="wrap"
      gap={1}
      justifyContent="space-between"
    >
      <Stack alignItems="center" direction="row" spacing={1}>
        <Typography variant="h3">{route.label}</Typography>
        <Typography>|</Typography>
        <Typography fontSize="1rem">
          {pluralize('Rule', 'Rules', route.rules?.length ?? 0)}
        </Typography>
      </Stack>
      <StyledPaper sx={{ backgroundColor: 'transparent' }}>
        <EditActionButton onClick={onEditClick}>Edit</EditActionButton>
      </StyledPaper>
    </Stack>
  );
};
