import { styled } from '@mui/material/styles';

import { PlusSignIcon } from '../../assets/icons';
import { omittedProps } from '../../utilities';
import { Button } from './Button';

/**
 * A button for Tags. Eventually this treatment will go away,
 * but the sake of the MUI migration we need to keep it around for now, and as a styled component in order to get rid of
 * spreading excessive styles for everywhere this is used.
 *
 */
export const StyledTagButton = styled(Button, {
  label: 'StyledTagButton',
  shouldForwardProp: omittedProps(['panel']),
})<{ panel?: boolean }>(({ theme, ...props }) => ({
  border: 'none',
  color: theme.tokens.action.Neutral,
  fontSize: '0.875rem',
  minHeight: 30,
  whiteSpace: 'nowrap',
  ...(props.panel && {
    height: 34,
  }),
  ...(!props.disabled && {
    '&:hover, &:focus': {
      '& svg': {
        color: theme.color.white,
      },
      backgroundColor: theme.color.buttonPrimaryHover,
      border: 'none',
      color: theme.color.white,
    },
    backgroundColor: theme.color.tagButtonBg,
    color: theme.color.tagButtonText,
  }),
}));

export const StyledPlusIcon = styled(PlusSignIcon, {
  label: 'StyledPlusIcon',
})(({ theme, ...props }) => ({
  color: props.disabled
    ? theme.name === 'dark'
      ? theme.tokens.color.Neutrals[70]
      : theme.color.disabledText
    : theme.color.tagButtonText,
  height: '10px',
  width: '10px',
}));
