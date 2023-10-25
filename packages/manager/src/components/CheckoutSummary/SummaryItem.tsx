import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/styles';
import React from 'react';

import { Grid } from '../Grid';
import { Typography } from '../Typography';
import { SummaryItem as Props } from './CheckoutSummary';

export const SummaryItem = ({ details, title }: Props) => {
  const theme = useTheme();

  return (
    <StyledGrid item>
      {title ? (
        <>
          <Typography component="span" fontFamily={theme.font.bold}>
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
