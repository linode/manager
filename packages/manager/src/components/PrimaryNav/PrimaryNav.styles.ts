import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import { Link } from 'react-router-dom';

import AkamaiLogo from 'src/assets/logo/akamai-logo.svg';
import { Accordion } from 'src/components/Accordion';
import { Box } from 'src/components/Box';
import { SIDEBAR_WIDTH } from 'src/components/PrimaryNav/SideMenu';
import { omittedProps } from 'src/utilities/omittedProps';

export const StyledGrid = styled(Grid, {
  label: 'StyledGrid',
  shouldForwardProp: omittedProps(['isCollapsed']),
})<{ isCollapsed: boolean }>(({ theme, ...props }) => ({
  '&:hover': {
    '& a[aria-current="true"]': {
      backgroundImage: 'linear-gradient(98deg, #38584B 1%, #3A5049 166%)',
    },
    '.MuiAccordion-region, div[class*="StyledSingleLinkBox"]': {
      height: 'auto',
    },
    '.MuiButtonBase-root, MuiAccordionSummary-root': {
      '& h3 > p': {
        opacity: 1,
      },
    },
  },
  // when the nav is collapsed, we want to visually hide expanded content and single links like Managed
  ...(props.isCollapsed && {
    '.MuiAccordion-region, div[class*="StyledSingleLinkBox"]': {
      height: 0,
    },
  }),
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
  shouldForwardProp: omittedProps(['isCollapsed']),
})<{ isCollapsed: boolean }>(({ theme, ...props }) => ({
  alignItems: 'center',
  backgroundColor: theme.name === 'dark' ? theme.bg.appBar : undefined,
  display: 'flex',
  height: 50,
  paddingLeft: 13,
  transition: 'padding-left .03s linear',
  ...(props.isCollapsed && {
    '& .akamai-logo-name': {
      opacity: 0,
    },
    paddingLeft: 8,
  }),
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

export const StyledLink = styled(Link, {
  label: 'StyledLink',
  shouldForwardProp: omittedProps(['isCollapsed']),
})<{ isCollapsed: boolean }>(({ ...props }) => ({
  lineHeight: 0,
  ...(props.isCollapsed && {
    // when the nav is collapsed, but hovered by the user, make the logo full sized
    'nav:hover & > svg ': {
      '& .akamai-logo-name': {
        opacity: 1,
      },
      width: 83,
    },
  }),
}));

export const StyledActiveLink = styled(Link, {
  label: 'StyledActiveLink',
  shouldForwardProp: omittedProps(['isActiveLink', 'isCollapsed']),
})<{ isActiveLink: boolean; isCollapsed: boolean }>(({ ...props }) => ({
  '& p': {
    marginBottom: 0,
    marginTop: 0,
  },
  '&:focus': {
    textDecoration: 'none',
  },
  '&:hover': {
    backgroundImage: 'linear-gradient(98deg, #38584B 1%, #3A5049 166%)',
    textDecoration: 'none',
  },
  alignItems: 'center',
  cursor: 'pointer',
  display: 'flex',
  minWidth: SIDEBAR_WIDTH,
  padding: '7px 16px',
  position: 'relative',
  ...(props.isActiveLink && {
    backgroundImage: 'linear-gradient(98deg, #38584B 1%, #3A5049 166%)',
    textDecoration: 'none',
  }),
  ...(props.isCollapsed && {
    backgroundImage: 'none',
  }),
}));

export const StyledPrimaryLinkBox = styled(Box, {
  label: 'StyledPrimaryLinkBox',
  shouldForwardProp: omittedProps(['isCollapsed']),
})<{ isCollapsed: boolean }>(({ theme, ...props }) => ({
  alignItems: 'center',
  color: '#fff',
  display: 'flex',
  fontFamily: 'LatoWebBold',
  fontSize: '0.875rem',
  justifyContent: 'space-between',
  opacity: 1,
  position: 'relative',
  transition: theme.transitions.create(['color', 'opacity']),
  width: '100%',
  ...(props.isCollapsed && {
    maxHeight: 36,
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
        color: '#B8B8B8',
        transition: theme.transitions.create(['opacity']),
        ...(props.isCollapsed && {
          opacity: 0,
        }),
      },
      // product family icon
      '& svg': {
        color: props.isActiveProductFamily ? '#00B159' : '#8E9195',
        height: 20,
        marginRight: 14,
        transition: theme.transitions.create(['color']),
        width: 20,
      },
      alignItems: 'center',
      color: '#B8B8B8',
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
      '.MuiAccordionSummary-contentGutters, .Mui-expanded': {
        margin: '0 !important',
      },
      minHeight: '40px !important',
      paddingLeft: 4,
      // accordion arrow
      svg: {
        fill: '#fff',
        stroke: 'transparent !important',
      },
    },
    backgroundColor: theme.name === 'dark' ? theme.bg.appBar : 'transparent',
    minHeight: '40px',
  })
);
