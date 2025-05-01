import { Typography } from '@linode/ui';
import Grid2 from '@mui/material/Grid2';
import { styled } from '@mui/material/styles';
import React from 'react';

import type { SummaryItem as Props } from './CheckoutSummary';

export const SummaryItem = ({ details, title }: Props) => {
  return (
    <StyledGrid>
      {title ? (
        <>
          <Typography
            component="span"
            sx={(theme) => ({
              font: theme.font.bold,
            })}
          >
            {title}
          </Typography>{' '}
        </>
      ) : null}
      <Typography component="span" data-qa-details={details}>
        {details}
      </Typography>
    </StyledGrid>
  );
};

const StyledGrid = styled(Grid2)(({ theme }) => ({
  marginBottom: `${theme.spacing()} !important`,
  marginTop: `${theme.spacing()} !important`,
  paddingBottom: '0 !important',
  paddingTop: '0 !important',
}));
