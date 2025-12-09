import { Box, Typography } from '@linode/ui';
import { isNumber } from '@linode/utilities';
import { useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { DisplayPrice } from 'src/components/DisplayPrice';

import { StyledSpan } from './ConfigureForm.styles';

import type { MigratePricePanelType } from './ConfigureForm';
import type { PriceObject } from '@linode/api-v4';

export interface MigrationPricingProps {
  backups: 'disabled' | PriceObject | undefined;
  hourly: null | number | undefined;
  monthly: null | number | undefined;
  panelType: MigratePricePanelType;
}

export const MigrationPricing = (props: MigrationPricingProps) => {
  const { backups, hourly, monthly, panelType } = props;
  const currentPanel = panelType === 'current';
  const theme = useTheme();
  const priceFontSize = `${theme.typography.body1.fontSize}`;

  const shouldShowPrice =
    isNumber(monthly) && isNumber(hourly) && backups !== undefined;

  const shouldShowBackupsPrice =
    backups && backups !== 'disabled' && backups.monthly !== null;

  return shouldShowPrice ? (
    <StyledMigrationPricingContainer
      data-testid="migration-pricing"
      panelType={panelType}
    >
      <StyledSpan>{currentPanel ? 'Current' : 'New'} Price</StyledSpan>
      <Box
        alignItems="baseline"
        data-testid={`${panelType}-price-panel`}
        display="inline-flex"
      >
        <DisplayPrice
          fontSize={priceFontSize}
          interval="month"
          price={monthly}
        />
        ,&nbsp;
        <DisplayPrice
          decimalPlaces={3}
          fontSize={priceFontSize}
          interval="hour"
          price={hourly}
        />
        {shouldShowBackupsPrice && (
          <>
            &nbsp;
            <Typography fontSize={priceFontSize} sx={{ font: theme.font.bold }}>
              | Backups&nbsp;
            </Typography>
            <DisplayPrice
              fontSize={priceFontSize}
              interval="month"
              price={backups.monthly ?? '--.--'}
            />
          </>
        )}
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
        marginTop: 24,
      },
    }),
  })
);
