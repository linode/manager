import { styled } from '@mui/material/styles';
import { Button } from './Button';
import { latoWeb } from 'src/foundations/fonts';

/**
 * A button for our action menu's. Eventually this treatment will go away,
 * but the sake of the MUI migration we need to keep it around for now, and as a styled component in order to get rid of
 * spreading excessive styles for everywhere this is used.
 *
 */
export const StyledActionButton = styled(Button, {
  label: 'StyledActionButton',
})(({ theme }) => ({
  fontFamily: latoWeb.normal,
  fontSize: '14px',
  lineHeight: '16px',
  minWidth: 0,
  padding: '12px 10px',
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    color: theme.name === 'dark' ? theme.color.black : theme.color.white,
  },
}));
