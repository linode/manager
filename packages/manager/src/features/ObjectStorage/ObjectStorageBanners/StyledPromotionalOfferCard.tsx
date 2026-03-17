import { styled } from '@mui/material/styles';

import { PromotionalOfferCard } from 'src/components/PromotionalOfferCard/PromotionalOfferCard';

export const StyledPromotionalOfferCard = styled(PromotionalOfferCard, {
  label: 'StyledPromotionalOfferCard',
})(({ theme }) => ({
  marginBottom: theme.spacingFunction(0.5),
}));
