import { Accordion, Box, Divider, omittedProps } from '@linode/ui';
import { Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
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
        left: SIDEBAR_WIDTH - 52,
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
        color: theme.tokens.sideNavigation.HoverMenuItem.Text,
      },
      backgroundColor: theme.tokens.sideNavigation.HoverMenuItem.Background,
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
  position: 'relative',
  ...(props.isActiveLink && {
    backgroundColor: theme.tokens.sideNavigation.SelectedMenuItem.Background,
  }),
}));

export const StyledPrimaryLinkBox = styled(Box, {
  label: 'StyledPrimaryLinkBox',
  shouldForwardProp: omittedProps(['isCollapsed', 'isActiveLink']),
})<{ isActiveLink: boolean; isCollapsed: boolean }>(({ theme, ...props }) => ({
  alignItems: 'center',
  color: props.isActiveLink
    ? theme.tokens.sideNavigation.SelectedMenuItem.Text
    : theme.tokens.sideNavigation.DefaultMenuItem.Text,
  display: 'flex',
  // TODO: Enable token once we have imported Nunito
  // font: theme.tokens.typography.Label.Semibold.S,
  fontFamily: 'LatoWeb',
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
        color: props.isActiveProductFamily
          ? theme.tokens.sideNavigation.SelectedMenuItem.Text
          : theme.tokens.sideNavigation.DefaultMenuItem.Text,
        transition: theme.transitions.create(['opacity']),
        ...(props.isCollapsed && {
          opacity: 0,
        }),
      },
      // product family icon
      '& svg': {
        color: props.isActiveProductFamily
          ? theme.tokens.sideNavigation.SelectedMenuItem.Icon
          : theme.tokens.sideNavigation.DefaultMenuItem.Icon,
        height: 20,
        marginRight: 12,
        transition: theme.transitions.create(['color']),
        width: 20,
      },
      alignItems: 'center',
      display: 'flex',
      // TODO: Enable token once we have imported Nunito
      // font: theme.tokens.typography.Label.Bold.S,
      fontFamily: 'LatoWebBold',
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
      backgroundColor: props.isActiveProductFamily
        ? theme.tokens.sideNavigation.SelectedMenuItem.Background
        : theme.tokens.sideNavigation.DefaultMenuItem.Background,
      maxHeight: '42px',
      minHeight: '42px',
      paddingLeft: 4,
      svg: {
        fill: theme.tokens.sideNavigation.Icon,
        stroke: 'transparent',
      },
    },
    backgroundColor: theme.tokens.sideNavigation.DefaultMenuItem.Background,
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
