import { styled } from '@mui/material/styles';
import React from 'react';
import Typography from '../core/Typography';
import Grid from '../Grid';
import { SummaryItem as Props } from './CheckoutSummary';

export const SummaryItem = ({ details, title }: Props) => {
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
  marginBottom: `${theme.spacing()} !important`,
  marginTop: `${theme.spacing()} !important`,
  paddingBottom: '0 !important',
  paddingTop: '0 !important',
}));
