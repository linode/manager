import { Accordion, Box, Divider, omittedProps } from '@linode/ui';
import { Chip, styled } from '@mui/material';
import { Link } from 'react-router-dom';

import AkamaiLogo from 'src/assets/logo/akamai-logo.svg';
import { SIDEBAR_WIDTH } from 'src/components/PrimaryNav/constants';

export const StyledAkamaiLogo = styled(AkamaiLogo, {
  label: 'StyledAkamaiLogo',
})(({ theme }) => ({
  'path, polygon': {
    fill: theme.tokens.color.Neutrals.White,
  },
}));

export const StyledDivider = styled(Divider, {
  label: 'StyledDivider',
})(({ theme }) => ({
  borderColor: theme.tokens.border.Normal,
  margin: 0,
}));

export const StyledActiveLink = styled(Link, {
  label: 'StyledActiveLink',
  shouldForwardProp: omittedProps(['isActiveLink', 'isCollapsed']),
})<{ isActiveLink: boolean; isCollapsed: boolean }>(({ theme, ...props }) => ({
  ...(!props.isActiveLink && {
    '&:hover': {
      '.primaryNavLink': {
        color: theme.tokens.color.Neutrals['White'],
      },
      backgroundColor: theme.tokens.color.Neutrals[100],
    },
  }),
  '&:hover, &:focus': {
    textDecoration: 'none',
  },
  alignItems: 'center',
  cursor: 'pointer',
  display: 'flex',
  font: theme.tokens.typography.Body.Semibold,
  minHeight: 32,
  minWidth: SIDEBAR_WIDTH,
  padding: 0,
  paddingLeft: 48,
  position: 'relative',
  ...(props.isActiveLink && {
    backgroundColor: theme.tokens.color.Neutrals[100],
  }),
}));

export const StyledPrimaryLinkBox = styled(Box, {
  label: 'StyledPrimaryLinkBox',
  shouldForwardProp: omittedProps(['isCollapsed', 'isActiveLink']),
})<{ isActiveLink: boolean; isCollapsed: boolean }>(({ theme, ...props }) => ({
  alignItems: 'center',
  color: props.isActiveLink
    ? theme.tokens.color.Brand[60]
    : theme.tokens.color.Neutrals['White'],
  display: 'flex',
  font: theme.tokens.typography.Label.Semibold.S,
  transition: theme.transitions.create(['color', 'opacity']),
  width: '100%',
  ...(props.isActiveLink && {
    font: theme.tokens.typography.Body.Bold,
  }),
  ...(props.isCollapsed && {
    opacity: 0,
  }),
}));

export const StyledAccordion = styled(Accordion, {
  label: 'StyledAccordion',
  shouldForwardProp: omittedProps(['isCollapsed', 'isActiveProductFamily']),
})<{ isActiveProductFamily: boolean; isCollapsed: boolean }>(
  ({ theme, ...props }) => ({
    '& h3': {
      '& p': {
        color: theme.tokens.color.Neutrals['White'],
        font: props.isActiveProductFamily
          ? theme.tokens.typography.Label.Bold.S
          : theme.tokens.typography.Label.Semibold.S,
        paddingLeft: theme.tokens.spacing[50],
        paddingRight: theme.tokens.spacing[50],
        transition: theme.transitions.create(['opacity']),
        ...(props.isCollapsed && {
          opacity: 0,
        }),
      },
      // product family icon
      '& svg': {
        color: props.isActiveProductFamily
          ? theme.tokens.color.Brand[60]
          : theme.tokens.color.Neutrals['White'],
        height: 22,
        transition: theme.transitions.create(['color']),
        width: 22,
      },
      alignItems: 'center',
      display: 'flex',
      font: theme.tokens.typography.Label.Bold.S,
    },
    '.MuiAccordionDetails-root': {
      padding: 0,
    },
    '.MuiAccordionSummary-content': {
      margin: 0,
      padding: 0,
    },
    '.MuiAccordionSummary-expandIconWrapper svg': {
      color: theme.tokens.color.Neutrals['White'],
      height: 16,
      width: 16,
    },
    '.MuiButtonBase-root, MuiAccordionSummary-root': {
      '&:hover': {
        backgroundColor: theme.tokens.color.Neutrals[100],
      },
      '.Mui-expanded': {
        alignItems: 'center',
        maxHeight: '48px',
        minHeight: '48px',
      },
      backgroundColor: theme.tokens.color.Neutrals[90],
      maxHeight: '48px',
      minHeight: '48px',
      paddingLeft: theme.tokens.spacing[50],
      paddingRight: theme.tokens.spacing[40],
      svg: {
        fill: theme.tokens.color.Neutrals['White'],
        stroke: 'transparent',
      },
    },
    backgroundColor: theme.tokens.color.Neutrals[90],
  })
);

export const StyledChip = styled(Chip, {
  label: 'styledChip',
  shouldForwardProp: omittedProps(['isActiveLink']),
})<{ isActiveLink: boolean }>(({ theme, ...props }) => ({
  backgroundColor: props.isActiveLink
    ? theme.tokens.sideNavigation.SelectedMenuItem.Label.Background
    : theme.tokens.sideNavigation.DefaultMenuItem.Label.Background,
  border: !props.isActiveLink
    ? `1px solid ${theme.tokens.sideNavigation.DefaultMenuItem.Label.Border}`
    : 'none',
  borderRadius: '2px',
  color: props.isActiveLink
    ? theme.tokens.sideNavigation.SelectedMenuItem.Label.Text
    : theme.tokens.sideNavigation.DefaultMenuItem.Label.Text,
  marginRight: '12px',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  width: '30px',
}));
