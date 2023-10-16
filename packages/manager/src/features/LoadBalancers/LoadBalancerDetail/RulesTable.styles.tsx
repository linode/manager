import { styled } from '@mui/material/styles';

import DragIndicator from 'src/assets/icons/drag-indicator.svg';
import { Box } from 'src/components/Box';

export const StyledDragIndicator = styled(DragIndicator, {
  label: 'StyledDragIndicator',
})(({ theme }) => ({
  color: theme.color.grey8,
  marginRight: theme.spacing(1.5),
  position: 'relative',
  top: 2,
}));

export const StyledUl = styled('ul', { label: 'StyledUl' })(({ theme }) => ({
  backgroundColor: theme.color.border3,
  listStyle: 'none',
  margin: 0,
  paddingLeft: 0,
  width: '100%',
}));

export const sxBox = {
  alignItems: 'center',
  display: 'flex',
  width: '100%',
};

export const StyledInnerBox = styled(Box, { label: 'StyledInnerBox' })(
  ({ theme }) => ({
    backgroundColor: theme.bg.tableHeader,
    color: theme.textColors.tableHeader,
    fontSize: '.875rem',
    fontWeight: 'bold',
    height: '46px',
  })
);

export const StyledRuleBox = styled(Box, {
  label: 'StyledRuleBox',
})(({ theme }) => ({
  borderBottom: `1px solid ${theme.borderColors.borderTable}`,
  color: theme.textColors.tableStatic,
  fontSize: '0.875rem',
  margin: 0,
  ...sxBox,
}));

export const sxItemSpacing = {
  padding: `0 8px`,
};
