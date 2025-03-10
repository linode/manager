import { Paper, Typography, omittedProps } from '@linode/ui';
import { MenuItem, MenuList, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';

import Add from 'src/assets/icons/add.svg';

export const StyledHeading = styled('h3', {
  label: 'StyledHeading',
  shouldForwardProp: omittedProps(['paddingTop']),
})<{ paddingTop?: boolean }>(({ theme, ...props }) => ({
  '& svg': {
    height: 20,
    marginRight: theme.spacing(1),
    width: 20,
  },
  alignItems: 'center',
  color: theme.tokens.content.Text.Secondary.Default,
  display: 'flex',
  font: theme.tokens.font.FontWeight.Extrabold,
  fontSize: theme.tokens.font.FontSize.Xxxs,
  letterSpacing: '1px',
  margin: 0,
  padding: '8px 14px',
  textTransform: theme.tokens.font.Textcase.Uppercase,
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
    padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
  },
})) as typeof MenuItem;

export const StyledPaper = styled(Paper, {
  label: 'StyledPaper',
})(({ theme }) => ({
  background: theme.tokens.background.Normal,
  maxHeight: 500,
  padding: `${theme.spacing(1)} 0`,
  [theme.breakpoints.down('lg')]: {
    padding: 0,
  },
}));

export const StyledStack = styled(Stack, {
  label: 'StyledStack',
})(({ theme }) => ({
  [theme.breakpoints.down('lg')]: {
    paddingTop: 4,
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
  color: theme.tokens.content.Text.Primary.Default,
  font: theme.tokens.font.FontWeight.Bold,
  fontSize: '1rem',
  lineHeight: '1.4rem',
}));

export const StyledAddIcon = styled(Add, {
  label: 'StyledAddIcon',
})(() => ({
  height: 16,
  width: 16,
}));
