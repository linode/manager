import { Box, Chip, Notice } from '@linode/ui';
import { styled } from '@mui/material/styles';

export const ProductDetailsContainer = styled(Box)(({ theme }) => ({
  alignItems: 'flex-start',
  alignSelf: 'stretch',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacingFunction(32),
}));

export const InfoBanner = styled(Notice)(() => ({
  alignItems: 'flex-start',
  display: 'flex',
  maxWidth: '630px',
  width: '100%',
  marginBottom: 0,
}));

export const ProductInfoSection = styled(Box)(({ theme }) => ({
  alignItems: 'flex-start',
  alignSelf: 'stretch',
  display: 'flex',
  gap: theme.spacingFunction(24),
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    gap: theme.spacingFunction(8),
  },
}));

export const LogoContainer = styled(Box)(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  height: theme.spacingFunction(96),
  justifyContent: 'center',
  width: theme.spacingFunction(96),
}));

export const ProductDetailsSection = styled(Box)(({ theme }) => ({
  alignItems: 'flex-start',
  alignSelf: 'stretch',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacingFunction(16),
}));

export const ProductTitleSection = styled(Box)(({ theme }) => ({
  alignItems: 'flex-start',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacingFunction(2),
}));

export const TagsContainer = styled(Box)(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacingFunction(8),
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
