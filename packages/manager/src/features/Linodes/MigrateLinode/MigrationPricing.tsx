import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/styles';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { DisplayPrice } from 'src/components/DisplayPrice';
import { Typography } from 'src/components/Typography';

import { StyledFormLabel } from './ConfigureForm.styles';

export interface MigrationPricingProps {
  backups: null | number | undefined;
  hourly: null | number | undefined;
  monthly: null | number | undefined;
  panelType: 'current' | 'new';
}

export const MigrationPricing = (props: MigrationPricingProps) => {
  const { backups, hourly, monthly, panelType } = props;
  const currentPanel = panelType === 'current';
  const theme = useTheme();

  const priceFontSize = `${theme.typography.body1.fontSize}`;

  return monthly && hourly && backups ? (
    <StyledMigrationPricingContainer panelType={panelType}>
      <StyledFormLabel htmlFor={`${panelType}-price`}>
        {currentPanel ? 'Current' : 'New'} Price
      </StyledFormLabel>
      <Box
        alignItems="baseline"
        display="inline-flex"
        id={`${panelType}-price`}
      >
        <DisplayPrice
          fontSize={priceFontSize}
          interval="month"
          price={monthly}
        />
        ,&nbsp;
        <DisplayPrice fontSize={priceFontSize} interval="hour" price={hourly} />
        &nbsp;
        <Typography fontSize={priceFontSize} fontWeight="bold">
          | Backups&nbsp;
        </Typography>
        <DisplayPrice
          fontSize={priceFontSize}
          interval="month"
          price={backups}
        />
      </Box>
    </StyledMigrationPricingContainer>
  ) : null;
};

const StyledMigrationPricingContainer = styled(Box, {
  label: 'MigrationPricingContainer',
  shouldForwardProp: (prop) => prop !== 'panelType',
})<{ panelType: MigrationPricingProps['panelType'] }>(
  ({ panelType, theme }) => ({
    marginBottom: theme.spacing(2),
    ...(panelType === 'current' && {
      [theme.breakpoints.up('md')]: {
        marginTop: 26,
      },
    }),
  })
);
