import { Box } from '@linode/ui';
import { styled } from '@mui/material/styles';

/**
 * Styled components for Overview tab layout
 */
export const OverviewContainer = styled(Box)(({ theme }) => ({
  alignItems: 'flex-start',
  alignSelf: 'stretch',
  display: 'flex',
  gap: '24px',
  justifyContent: 'space-between',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    gap: '48px',
  },
}));

export const VideoPlaceholder = styled(Box)(({ theme }) => ({
  alignItems: 'center',
  alignSelf: 'stretch',
  aspectRatio: '3/2',
  backgroundColor: theme.bg.bgPaper,
  border: `1px dashed ${theme.tokens.alias.Border.Normal}`,
  borderRadius: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacingFunction(8),
  height: '202px',
  justifyContent: 'center',
  padding: '10px',
  svg: {
    fill: theme.tokens.alias.Content.Icon.Primary.Default,
    opacity: 0.25,
  },
  [theme.breakpoints.down('md')]: {
    order: -1,
  },
}));

export const ContentSection = styled(Box)(() => ({
  flex: 1,
  minWidth: 0,
}));

export const TabContentContainer = styled(Box)(() => ({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  minHeight: 0,
  '& [data-reach-tabs]': {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  '& [data-reach-tab-panels]': {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
  },
}));
