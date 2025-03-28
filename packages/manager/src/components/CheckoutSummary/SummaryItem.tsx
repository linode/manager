import { Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import Grid2 from '@mui/material/Grid';
import React from 'react';

import type { SummaryItem as Props } from './CheckoutSummary';

export const SummaryItem = ({ details, title }: Props) => {
  return (
    <StyledGrid>
      {title ? (
        <>
          <Typography
            sx={(theme) => ({
              font: theme.font.bold,
            })}
            component="span"
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
