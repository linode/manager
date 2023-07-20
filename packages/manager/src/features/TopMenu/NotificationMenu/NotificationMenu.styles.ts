import { styled } from '@mui/material/styles';

import { Button } from 'src/components/Button/Button';
import { isPropValid } from 'src/utilities/isPropValid';

import { StyledTopMenuIconWrapper } from '../TopMenuIcon';

export const NotificationIconWrapper = styled(StyledTopMenuIconWrapper, {
  label: 'NotificationIconWrapper',
  shouldForwardProp: (prop) => isPropValid(['isMenuOpen'], prop),
})<{
  isMenuOpen: boolean;
}>(({ ...props }) => ({
  color: props.isMenuOpen ? '#606469' : '#c9c7c7',
}));

export const StyledButton = styled(Button)(({ theme }) => ({
  margin: 0,
  minWidth: 'unset',
  padding: 0,
  ...(theme.name === 'light'
    ? {
        '&:hover': {
          backgroundColor: 'unset',
        },
      }
    : {
        '&:hover:not([aria-expanded="true"])': {
          backgroundColor: 'unset',
        },
      }),
}));
