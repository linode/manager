import { Accordion, Box, Divider, IconButton, omittedProps } from '@linode/ui';
import { Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import { Link } from 'react-router-dom';

import AkamaiLogo from 'src/assets/logo/akamai-logo.svg';
import { SIDEBAR_WIDTH } from 'src/components/PrimaryNav/constants';
import { FOOTER_HEIGHT } from 'src/features/Footer';

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
})(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  height: 50,
  paddingBottom: 16,
  paddingLeft: 12,
  paddingRight: 24,
  paddingTop: 16,
  [theme.breakpoints.down('md')]: {
    borderRight: `1px solid ${theme.tokens.border.Normal}`,
  },
  transition: 'padding-left .03s linear',
}));

export const StyledAkamaiLogo = styled(AkamaiLogo, {
  label: 'StyledAkamaiLogo',
})(({ theme }) => ({
  '& .akamai-logo-name': {
    transition: theme.transitions.create(['opacity']),
  },
  'path, polygon': {
    fill: theme.tokens.color.Neutrals.White,
    [theme.breakpoints.down('md')]: {
      fill: theme.tokens.sideNavigation.Icon,
    },
  },
  // give the svg a transition so it smoothly resizes
  transition: 'width .1s linear',
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
  flex: '1 1 0%',
  overflowX: 'hidden',
  overflowY: 'auto',
  paddingBottom: FOOTER_HEIGHT,
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
  marginRight: '12px',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  width: '30px',
}));
