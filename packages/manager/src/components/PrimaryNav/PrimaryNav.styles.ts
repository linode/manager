import { Theme } from '@mui/material/styles';
import { keyframes } from 'tss-react';
import { makeStyles } from 'tss-react/mui';

const SLIDE_IN_TRANSFORM = 'matrix(0.01471, 0, 0, 1, 123.982745, 0.000015)';
const SLIDE_OUT_TRANSFORM = 'translate(0)';

const slideIn = keyframes`
  from {
    transform: ${SLIDE_IN_TRANSFORM};
  }
  to {
    transform: ${SLIDE_OUT_TRANSFORM};
  }
`;

const slideOut = keyframes`
  from {
    transform: ${SLIDE_OUT_TRANSFORM};
  },
  to {
    transform: ${SLIDE_IN_TRANSFORM};
  },
`;

const useStyles = makeStyles<void, 'linkItem'>()(
  (theme: Theme, _params, classes) => ({
    active: {
      '& .icon': {
        opacity: 1,
      },
      '& svg': {
        color: theme.color.teal,
      },
      backgroundImage: 'linear-gradient(98deg, #38584B 1%, #3A5049 166%)',
      textDecoration: 'none',
    },
    chip: {
      '&.beta-chip-aglb': {
        bottom: -2,
        left: 70,
        position: 'absolute',
      },
      marginTop: 2,
    },
    divider: {
      backgroundColor: 'rgba(0, 0, 0, 0.12)',
      color: '#222',
    },
    fadeContainer: {
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100% - 90px)',
      width: '100%',
    },
    linkItem: {
      '&.hiddenWhenCollapsed': {
        maxHeight: 36,
        opacity: 0,
      },
      alignItems: 'center',
      color: '#fff',
      display: 'flex',
      fontFamily: 'LatoWebBold', // we keep this bold at all times
      opacity: 1,
      position: 'relative',
      transition: theme.transitions.create(['color']),
    },
    listItem: {
      '& .icon': {
        '& svg': {
          '&:not(.wBorder) circle, & .circle': {
            display: 'none',
          },
          alignItems: 'center',
          display: 'flex',
          height: 20,
          width: 20,
        },
        color: '#CFD0D2',
        marginRight: theme.spacing(2),
        opacity: 0.5,
      },
      '& p': {
        marginBottom: 0,
        marginTop: 0,
      },
      '&:focus': {
        textDecoration: 'none',
      },
      '&:hover': {
        '& .icon': {
          opacity: 1,
        },
        '& svg': {
          color: theme.color.teal,
          fill: theme.color.teal,
        },
        [`& .${classes.linkItem}`]: {
          color: 'white',
        },
        backgroundImage: 'linear-gradient(98deg, #38584B 1%, #3A5049 166%)',
        border: 'red',
        textDecoration: 'none',
      },
      alignItems: 'center',
      cursor: 'pointer',
      display: 'flex',
      padding: '8px 16px',
      position: 'relative',
      transition: theme.transitions.create(['background-color']),
    },
    logo: {
      // give the svg a transition so it smoothly resizes
      transition: 'width .1s linear',
    },
    logoAkamaiCollapsed: {
      '& path.akamai-clip-path': {
        animation: `${slideOut} 0s ease-in-out 0s forwards`,
      },
      background: theme.bg.primaryNavPaper,
      width: 96,
    },
    logoContainer: {
      // when the nav is collapsed, but hovered by the user, make the logo full sized
      'nav:hover & > svg ': {
        width: 128,
      },
    },
    logoItemAkamai: {
      '& path.akamai-clip-path': {
        animation: `${slideIn} .33s ease-in-out`,
      },
      paddingLeft: 12,
      paddingTop: 12,
      transition: 'padding-left .03s linear',
    },
    logoItemAkamaiCollapsed: {
      paddingLeft: 8,
    },
    logoSvgCollapsed: {
      // Hide 'Akamai' text when the navigation is collapsed and the nav is not hovered
      '& > g ': {
        display: 'none',
      },
      'nav:hover & > g ': {
        display: 'unset',
      },
      // Make the logo 115px so that the Akamai logo is centered when the navigation is collapsed
      width: 115,
    },
    menuGrid: {
      '&:hover': {
        '& path.akamai-clip-path': {
          animation: `${slideIn} .33s ease-in-out`,
        },
      },
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
    },
  })
);

// TODO jss-to-tss-react codemod: usages of this hook outside of this file will not be converted.
export default useStyles;
