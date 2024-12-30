import { Accordion, Box, Divider, IconButton, omittedProps } from '@linode/ui';
import { Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import { Link } from 'react-router-dom';

import AkamaiLogo from 'src/assets/logo/akamai-logo.svg';
import { SIDEBAR_WIDTH } from 'src/components/PrimaryNav/SideMenu';

export const StyledGrid = styled(Grid, {
  label: 'StyledGrid',
})(({ theme }) => ({
  height: '100%',
  margin: 0,
  minHeight: 64,
  padding: 0,
  [theme.breakpoints.up('md')]: {
    minHeight: 80,
  },
  [theme.breakpoints.up('sm')]: {
    minHeight: 72,
  },
  width: '100%',
}));

export const StyledLogoBox = styled(Box, {
  label: 'StyledLogoBox',
})(() => ({
  alignItems: 'center',
  display: 'flex',
  height: 50,
  paddingBottom: 16,
  paddingLeft: 12,
  paddingRight: 24,
  paddingTop: 16,
  transition: 'padding-left .03s linear',
}));

export const StyledAkamaiLogo = styled(AkamaiLogo, {
  label: 'StyledAkamaiLogo',
})(({ theme }) => ({
  '& .akamai-logo-name': {
    transition: theme.transitions.create(['opacity']),
  },
  // give the svg a transition so it smoothly resizes
  transition: 'width .1s linear',
}));

export const StyledDivider = styled(Divider, {
  label: 'StyledDivider',
})(({ theme }) => ({
  borderColor:
    theme.name === 'light'
      ? theme.borderColors.dividerDark
      : 'rgba(0, 0, 0, 0.19)',
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
  paddingLeft: '10px',
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
  fontFamily: 'LatoWebBold',
  fontSize: '0.875rem',
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
  flex: '1 1 0%',
  overflowX: 'hidden',
  overflowY: 'auto',
  scrollbarColor:
    theme.name === 'dark'
      ? `${theme.color.grey4} transparent `
      : `${theme.color.grey9} transparent`,
  width: '100%',
}));

export const StyledAccordion = styled(Accordion, {
  label: 'StyledAccordion',
  shouldForwardProp: omittedProps(['isCollapsed', 'isActiveProductFamily']),
})<{ isActiveProductFamily: boolean; isCollapsed: boolean }>(
  ({ theme, ...props }) => ({
    '& h3': {
      '& p': {
        color: theme.tokens.sideNavigation.DefaultMenuItem.Text,
        transition: theme.transitions.create(['opacity']),
        ...(props.isCollapsed && {
          opacity: 0,
        }),
      },
      // product family icon
      '& svg': {
        color: theme.tokens.sideNavigation.DefaultMenuItem.Icon,
        height: 20,
        marginRight: 14,
        transition: theme.transitions.create(['color']),
        width: 20,
      },
      alignItems: 'center',
      display: 'flex',
      fontSize: '0.7rem',
      letterSpacing: '1px',
      lineheight: 20,
      padding: '0 10px',
      textTransform: 'uppercase',
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
      backgroundColor: theme.tokens.sideNavigation.DefaultMenuItem.Background,
      maxHeight: '42px',
      minHeight: '42px',
      paddingLeft: 4,
      svg: {
        fill: theme.tokens.sideNavigation.Icon,
        stroke: 'transparent',
      },
    },
    ...(props.isCollapsed &&
      props.isActiveProductFamily && {
        [theme.breakpoints.up('md')]: {
          '.MuiAccordion-region, div[class*="StyledSingleLinkBox"]': {
            maxHeight: 'fit-content',
          },
        },
      }),
    backgroundColor: theme.tokens.sideNavigation.DefaultMenuItem.Background,
  })
);

export const StyledIconButton = styled(IconButton, {
  label: 'styledIconButton',
})(({ theme }) => ({
  '& svg': {
    color: theme.tokens.sideNavigation.Icon,
    transition: theme.transitions.create(['color']),
  },
}));

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
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  width: '30px',
}));
