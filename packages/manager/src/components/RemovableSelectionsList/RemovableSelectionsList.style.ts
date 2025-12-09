import { Box, List, ListItem, omittedProps, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';

import type { RemovableSelectionsListProps } from './RemovableSelectionsList';

export const StyledNoAssignedLinodesBox = styled(Box, {
  label: 'StyledNoAssignedLinodesBox',
  shouldForwardProp: omittedProps(['maxWidth']),
})(({ maxWidth, theme }) => ({
  background: theme.name === 'light' ? theme.bg.main : theme.bg.app,
  display: 'flex',
  flexDirection: 'column',
  height: '52px',
  justifyContent: 'center',
  maxWidth: maxWidth ? `${maxWidth}px` : '416px',
  paddingLeft: theme.spacing(2),
  width: '100%',
}));

export const SelectedOptionsHeader = styled(Typography, {
  label: 'SelectedOptionsHeader',
})(({ theme }) => ({
  color: theme.color.headline,
  font: theme.font.bold,
  marginBottom: theme.spacing(2),
}));

export const SelectedOptionsList = styled(List, {
  label: 'SelectedOptionsList',
  shouldForwardProp: omittedProps(['isRemovable']),
})<{ isRemovable?: boolean }>(({ isRemovable, theme }) => ({
  background: theme.name === 'light' ? theme.bg.main : theme.bg.app,
  padding: !isRemovable ? `${theme.spacing(2)} 0` : '5px 0',
  width: '100%',
}));

export const SelectedOptionsListItem = styled(ListItem, {
  label: 'SelectedOptionsListItem',
})(() => ({
  justifyContent: 'space-between',
  paddingBottom: 0,
  paddingRight: 4,
  paddingTop: 0,
}));

export const StyledLabel = styled('span', { label: 'StyledLabel' })(
  ({ theme }) => ({
    color: theme.color.label,
    fontSize: '14px',
  })
);

type StyledBoxShadowWrapperBoxProps = Pick<
  RemovableSelectionsListProps,
  'maxHeight' | 'maxWidth'
>;

export const StyledBoxShadowWrapper = styled(Box, {
  label: 'StyledBoxShadowWrapper',
  shouldForwardProp: omittedProps(['displayShadow']),
})<{ displayShadow: boolean; maxWidth: number }>(
  ({ displayShadow, maxWidth, theme }) => ({
    '&:after': {
      bottom: 0,
      content: '""',
      height: '15px',
      position: 'absolute',
      width: '100%',
      ...(displayShadow && {
        boxShadow: `${theme.color.boxShadow} 0px -15px 10px -10px inset`,
      }),
    },
    maxWidth: `${maxWidth}px`,
    position: 'relative',
  })
);

export const StyledScrollBox = styled(Box, {
  label: 'StyledScrollBox',
})<StyledBoxShadowWrapperBoxProps>(({ maxHeight, maxWidth }) => ({
  maxHeight: `${maxHeight}px`,
  maxWidth: `${maxWidth}px`,
  overflow: 'auto',
}));

export const StyledItemWithPlusChip = styled('span', {
  label: 'ItemWithPlusChip',
})({
  alignItems: 'center',
  display: 'inline-flex',
});
