import { styled } from '@mui/material/styles';
import React from 'react';

import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { Typography } from '../Typography';
import { SummaryItem as Props } from './CheckoutSummary';

export const SummaryItem = ({ details, title }: Props) => {
  return (
    <StyledGrid>
      {title ? (
        <>
          <Typography
            sx={(theme) => ({
              fontFamily: theme.font.bold,
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
