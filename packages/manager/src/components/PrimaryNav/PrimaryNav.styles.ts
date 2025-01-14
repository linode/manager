import { Global } from '@linode/design-language-system';
import { Accordion, Box, Divider, omittedProps } from '@linode/ui';
import { Chip, styled } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { Link } from 'react-router-dom';

import AkamaiLogo from 'src/assets/logo/akamai-logo.svg';
import { SIDEBAR_WIDTH } from 'src/components/PrimaryNav/constants';

export const StyledGrid = styled(Grid, {
  label: 'StyledGrid',
})(({ theme }) => ({
  height: '100%',
  margin: 0,
  minHeight: 64,
  padding: 0,
  [theme.breakpoints.up('md')]: {
    '&:hover': {
      '.primary-nav-toggle': {
        justifyContent: 'flex-end',
        width: SIDEBAR_WIDTH - 1,
      },
    },
  },
  width: '100%',
}));

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
        color: Global.Color.Neutrals['White'],
      },
      backgroundColor: Global.Color.Neutrals[100],
    },
  }),
  '&:hover, &:focus': {
    textDecoration: 'none',
  },
  alignItems: 'center',
  cursor: 'pointer',
  display: 'flex',
  minWidth: SIDEBAR_WIDTH,
  padding: '7px 16px',
  paddingLeft: 50,
  position: 'relative',
  ...(props.isActiveLink && {
    backgroundColor: Global.Color.Neutrals[100],
  }),
}));

export const StyledPrimaryLinkBox = styled(Box, {
  label: 'StyledPrimaryLinkBox',
  shouldForwardProp: omittedProps(['isCollapsed', 'isActiveLink']),
})<{ isActiveLink: boolean; isCollapsed: boolean }>(({ theme, ...props }) => ({
  alignItems: 'center',
  color: props.isActiveLink
    ? Global.Color.Brand[60]
    : Global.Color.Neutrals['White'],
  display: 'flex',
  font: theme.tokens.typography.Label.Semibold.S,
  justifyContent: 'space-between',
  transition: theme.transitions.create(['color', 'opacity']),
  width: '100%',
  ...(props.isCollapsed && {
    opacity: 0,
  }),
}));

export const StyledMenuGrid = styled(Grid, {
  label: 'StyledMenuGrid',
})(({ theme }) => ({
  flexGrow: 1,
  overflowX: 'hidden',
  overflowY: 'auto',
  scrollbarColor: `${theme.color.grey4} transparent `,
  [theme.breakpoints.down('md')]: {
    borderRight: `1px solid ${theme.tokens.border.Normal}`,
  },
  width: '100%',
}));

export const StyledAccordion = styled(Accordion, {
  label: 'StyledAccordion',
  shouldForwardProp: omittedProps(['isCollapsed', 'isActiveProductFamily']),
})<{ isActiveProductFamily: boolean; isCollapsed: boolean }>(
  ({ theme, ...props }) => ({
    '& h3': {
      '& p': {
        color: Global.Color.Neutrals['White'],
        font: props.isActiveProductFamily
          ? theme.tokens.typography.Label.Bold.S
          : theme.tokens.typography.Label.Semibold.S,
        transition: theme.transitions.create(['opacity']),
        ...(props.isCollapsed && {
          opacity: 0,
        }),
      },
      // product family icon
      '& svg': {
        color: props.isActiveProductFamily
          ? Global.Color.Brand[60]
          : Global.Color.Neutrals['White'],
        height: 24,
        marginRight: 11,
        transition: theme.transitions.create(['color']),
        width: 24,
      },
      alignItems: 'center',
      display: 'flex',
      font: theme.tokens.typography.Label.Bold.S,
      padding: '0 10px',
    },
    '.MuiAccordionDetails-root': {
      padding: 0,
    },
    '.MuiButtonBase-root, MuiAccordionSummary-root': {
      '.Mui-expanded': {
        alignItems: 'center',
        maxHeight: '42px',
        minHeight: '42px',
      },
      backgroundColor: Global.Color.Neutrals[90],
      maxHeight: '42px',
      minHeight: '42px',
      paddingLeft: 4,
      svg: {
        fill: Global.Color.Neutrals['White'],
        stroke: 'transparent',
      },
    },
    backgroundColor: Global.Color.Neutrals[90],
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
