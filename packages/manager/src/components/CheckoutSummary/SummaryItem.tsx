import { styled } from '@mui/material/styles';
import React from 'react';
import Typography from '../core/Typography';
import Grid from '../Grid';
import { SummaryItem as Props } from './CheckoutSummary';

export const SummaryItem = ({ title, details }: Props) => {
  return (
    <StyledGrid item>
      {title ? (
        <>
          <Typography sx={{ fontWeight: 'bold' }} component="span">
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

const StyledGrid = styled(Grid)(({ theme }) => ({
  paddingTop: '0 !important',
  paddingBottom: '0 !important',
  marginTop: `${theme.spacing()} !important`,
  marginBottom: `${theme.spacing()} !important`,
}));
