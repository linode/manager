import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { isPropValid } from 'src/utilities/isPropValid';
import { StyledTopMenuSvgWrapper } from '../TopMenuIcon';

export const NotificationIconWrapper = styled(StyledTopMenuSvgWrapper, {
  label: 'NotificationIconWrapper',
  shouldForwardProp: (prop) => isPropValid(['isMenuOpen'], prop),
})<{
  isMenuOpen: boolean;
}>(({ ...props }) => ({
  color: props.isMenuOpen ? '#606469' : '#c9c7c7',
}));

export const StyledButton = styled(Button)(({ theme }) => ({
  margin: 0,
  padding: 0,
  minWidth: 'unset',
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
