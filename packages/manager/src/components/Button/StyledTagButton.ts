import { styled } from '@mui/material/styles';

import Plus from 'src/assets/icons/plusSign.svg';
import { omittedProps } from 'src/utilities/omittedProps';

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
  fontSize: '0.875rem',
  minHeight: 30,
  whiteSpace: 'nowrap',
  ...(props.panel && {
    height: 34,
  }),
  ...(!props.disabled && {
    '&:hover, &:focus': {
      backgroundColor: theme.color.tagButton,
      border: 'none',
    },
    backgroundColor: theme.color.tagButton,
    color: theme.textColors.linkActiveLight,
  }),
}));

export const StyledPlusIcon = styled(Plus, {
  label: 'StyledPlusIcon',
})(({ theme, ...props }) => ({
  color: props.disabled
    ? theme.name === 'dark'
      ? '#5c6470'
      : theme.color.disabledText
    : theme.color.tagIcon,
  height: '10px',
  width: '10px',
}));
