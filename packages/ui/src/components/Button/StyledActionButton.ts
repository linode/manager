import { styled } from '@mui/material/styles';

import { Button } from './Button';

/**
 * A button for our action menu's. Eventually this treatment will go away,
 * but the sake of the MUI migration we need to keep it around for now, and as a styled component in order to get rid of
 * spreading excessive styles for everywhere this is used.
 *
 */
export const StyledActionButton = styled(Button, {
  label: 'StyledActionButton',
})(({ theme, ...props }) => ({
  ...(!props.disabled && {
    '&:hover': {
      backgroundColor: theme.color.buttonPrimaryHover,
      color: theme.color.white,
    },
  }),
  background: 'transparent',
  color: theme.textColors.linkActiveLight,
  font: theme.font.normal,
  fontSize: '14px',
  lineHeight: '16px',
  minWidth: 0,
  padding: '12px 10px',
  ...(props.disabled && {
    color:
      theme.palette.mode === 'dark'
        ? `${theme.color.grey6} !important`
        : theme.color.disabledText,
    cursor: 'default',
  }),
}));
