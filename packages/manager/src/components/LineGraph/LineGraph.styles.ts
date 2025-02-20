import { Button, omittedProps } from '@linode/ui';
import { styled } from '@mui/material/styles';

export const StyledWrapper = styled('div')(() => ({
  display: 'flex',
  flex: 1,
  flexDirection: 'column-reverse',
  width: '100%',
}));

export const StyledContainer = styled('div', {
  label: 'StyledContainer',
})(({ theme }) => ({
  borderTop: `1px solid ${theme.borderColors.divider}`,
  fontSize: '0.875rem',
  marginLeft: theme.spacing(4),
  marginRight: 0,
  marginTop: theme.spacing(0.5),
  paddingTop: theme.spacing(0.5),
}));

export const StyledCanvasContainer = styled('div', {
  label: 'StyledCanvasContainer',
})({
  position: 'relative',
  width: '100%',
});

export const StyledButton = styled(Button, {
  label: 'StyledButton',
})(({ theme }) => ({
  '&:focus': {
    outline: `1px dotted ${theme.color.grey3}`,
  },
  '&:hover': {
    backgroundColor: 'transparent',
    color: theme.color.headline,
  },
  color: theme.color.headline,
  font: theme.font.normal,
  fontSize: '0.75rem',
  justifyContent: 'flex-start',
  margin: 0,
  marginLeft: -2,
  padding: 0,
}));

export const StyledButtonElement = styled('span', {
  label: 'StyledButtonElement',
  shouldForwardProp: omittedProps(['hidden', 'sx']),
})(({ ...props }) => ({
  ...(props.hidden && {
    textDecoration: 'line-through',
  }),
}));
