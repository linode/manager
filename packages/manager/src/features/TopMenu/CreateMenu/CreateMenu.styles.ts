import { Paper, omittedProps } from '@linode/ui';
import { MenuItem, MenuList, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledHeading = styled('h3', {
  label: 'StyledHeading',
  shouldForwardProp: omittedProps(['paddingTop']),
})<{ paddingTop?: boolean }>(({ theme, ...props }) => ({
  '& svg': {
    height: 16,
    marginRight: theme.spacing(1),
    width: 16,
  },
  alignItems: 'center',
  background: 'rgb(247, 247, 250)',
  display: 'flex',
  fontFamily: 'LatoWebBold',
  fontSize: '0.75rem',
  letterSpacing: '0.25px',
  margin: 0,
  padding: '8px 12px',
  textTransform: 'uppercase',
  [theme.breakpoints.up('lg')]: {
    background: 'inherit',
    padding: `${props.paddingTop ? '16px' : '8px'} 16px 6px 16px`,
  },
}));

export const StyledMenuItem = styled(MenuItem, {
  label: 'StyledMenuItem',
})(({ theme }) => ({
  padding: '8px 14px',
  // We have to do this because in packages/manager/src/index.css we force underline links
  textDecoration: 'none !important',
  [theme.breakpoints.up('md')]: {
    padding: '8px 16px',
  },
})) as typeof MenuItem;

export const StyledPaper = styled(Paper, {
  label: 'StyledPaper',
})(({ theme }) => ({
  padding: `${theme.spacing(1)} 0`,
  [theme.breakpoints.down('lg')]: {
    padding: 0,
  },
}));

export const StyledMenuList = styled(MenuList, {
  label: 'StyledMenuList',
})(({ theme }) => ({
  [theme.breakpoints.up('lg')]: {
    display: 'flex',
  },
}));

export const StyledLinkTypography = styled(Typography, {
  label: 'StyledLinkTypography',
})(({ theme }) => ({
  color: theme.color.offBlack,
  fontFamily: theme.font.bold,
  fontSize: '1rem',
  lineHeight: '1.4rem',
}));
