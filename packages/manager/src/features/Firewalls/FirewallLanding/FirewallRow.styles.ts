import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';

export const StyledDiv = styled('div', {
  label: 'StyledDiv',
})(() => ({
  maxHeight: '3rem',
}));

export const StyledDevicesLink = styled(Link, {
  label: 'StyledDevicesLink',
})(() => ({
  display: 'inline-block',
}));

export const StyledFirewallLink = styled(Link, { label: 'StyledFirewallLink' })(
  () => ({
    '&:hover, &:focus': {
      textDecoration: 'underline',
    },
    display: 'block',
    fontSize: '.875rem',
    lineHeight: '1.125rem',
  })
);
