import { Box, Chip, Notice } from '@linode/ui';
import { styled } from '@mui/material/styles';

export const ProductDetailsContainer = styled(Box)(() => ({
  alignItems: 'flex-start',
  alignSelf: 'stretch',
  display: 'flex',
  flexDirection: 'column',
  gap: '32px',
  paddingLeft: '8px',
  paddingRight: '8px',
  paddingTop: '8px',
}));

export const InfoBanner = styled(Notice)(() => ({
  alignItems: 'flex-start',
  display: 'flex',
  maxWidth: '630px',
  width: '100%',
  marginBottom: 0,
}));

export const ProductInfoSection = styled(Box)(() => ({
  alignItems: 'flex-start',
  alignSelf: 'stretch',
  display: 'flex',
  gap: '24px',
}));

export const LogoContainer = styled(Box)(() => ({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  height: '96px',
  justifyContent: 'center',
  width: '96px',
}));

export const ProductDetailsSection = styled(Box)(() => ({
  alignItems: 'flex-start',
  alignSelf: 'stretch',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
}));

export const ProductTitleSection = styled(Box)(() => ({
  alignItems: 'flex-start',
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
}));

export const TagsContainer = styled(Box)(() => ({
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
}));

export const StyledChip = styled(Chip)(({ theme }) => ({
  '& .MuiChip-label': {
    font: theme.font.bold,
    fontSize: theme.tokens.font.FontSize.Xxxs,
    letterSpacing: '0.12px',
    lineHeight: '12px',
    padding: `${theme.spacingFunction(4)} ${theme.spacingFunction(6)}`,
  },
  flexShrink: 0,
}));
