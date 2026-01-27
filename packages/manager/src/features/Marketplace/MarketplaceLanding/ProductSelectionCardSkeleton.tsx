import { Box } from '@linode/ui';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';
import { Skeleton } from 'src/components/Skeleton';

import { StyledLogoBox } from './ProductSelectionCard';
import { PRODUCT_CARD_GRID_SIZE, PRODUCT_CARD_STYLES } from './styles';

const StyledSkeleton = styled(Skeleton)({
  borderRadius: '4px',
});

export const ProductSelectionCardSkeleton = React.memo(() => {
  const renderIcon = React.useCallback(
    () => (
      <Box
        sx={{
          alignItems: 'flex-start',
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <StyledLogoBox>
          <Skeleton height="48px" variant="rounded" width="48px" />
        </StyledLogoBox>
      </Box>
    ),
    []
  );

  const heading = React.useMemo(() => <StyledSkeleton width="60%" />, []);

  const subheadings = React.useMemo(
    () => [
      <StyledSkeleton key="company" width="40%" />,
      <Box
        key="description"
        sx={(theme) => ({
          marginTop: theme.spacingFunction(12),
          paddingBottom: theme.spacingFunction(36),
        })}
      >
        <StyledSkeleton />
        <StyledSkeleton />
        <StyledSkeleton width="50%" />
      </Box>,
      <Box
        key="category"
        sx={(theme) => ({
          bottom: theme.spacingFunction(16),
          left: theme.spacingFunction(20),
          position: 'absolute',
        })}
      >
        <StyledSkeleton height={20} width={80} />
      </Box>,
    ],
    []
  );

  return (
    <SelectionCard
      data-testid="marketplace-skeleton-card"
      gridSize={PRODUCT_CARD_GRID_SIZE}
      heading={heading}
      renderIcon={renderIcon}
      subheadings={subheadings}
      sxCardBase={PRODUCT_CARD_STYLES.cardBase}
      sxCardBaseHeading={{ width: '100%' }}
      sxCardBaseIcon={PRODUCT_CARD_STYLES.cardBaseIcon}
    />
  );
});
