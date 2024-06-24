import { makeStyles } from 'tss-react/mui';

import { SIDEBAR_WIDTH } from 'src/components/PrimaryNav/SideMenu';

import type { Theme } from '@mui/material/styles';

const useStyles = makeStyles<void, 'linkItem'>()(
  (theme: Theme, _params, classes) => ({
    active: {
      '& div.icon': {
        opacity: 1,
      },
      '& svg': {
        color: theme.palette.success.dark,
      },
      backgroundImage: 'linear-gradient(98deg, #38584B 1%, #3A5049 166%)',
      textDecoration: 'none',
    },
    chip: {
      marginTop: 2,
    },
    divider: {
      backgroundColor: 'rgba(0, 0, 0, 0.12)',
      color: '#222',
    },
    linkItem: {
      '&.hiddenWhenCollapsed': {
        maxHeight: 36,
        opacity: 0,
      },
      alignItems: 'center',
      color: '#fff',
      display: 'flex',
      fontFamily: 'LatoWebBold',
      fontSize: '0.875rem',
      opacity: 1,
      position: 'relative',
      transition: theme.transitions.create(['color', 'opacity']),
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
        marginRight: theme.spacing(1.5),
        opacity: 0.5,
        transition: 'max-height 1s linear, width .1s linear',
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
          color: theme.palette.success.dark,
          fill: theme.palette.success.dark,
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
      minWidth: SIDEBAR_WIDTH,
      padding: '8px 13px',
      position: 'relative',
    },
    logo: {
      '& .akamai-logo-name': {
        transition: theme.transitions.create(['opacity']),
      },
      // give the svg a transition so it smoothly resizes
      transition: 'width .1s linear',
    },
    logoAkamaiCollapsed: {
      background: theme.bg.appBar,
      width: 83,
    },
    logoContainer: {
      lineHeight: 0,
      // when the nav is collapsed, but hovered by the user, make the logo full sized
      'nav:hover & > svg ': {
        '& .akamai-logo-name': {
          opacity: 1,
        },
        width: 83,
      },
    },
    logoItemAkamai: {
      alignItems: 'center',
      backgroundColor: theme.name === 'dark' ? theme.bg.appBar : undefined,
      display: 'flex',
      height: 50,
      paddingLeft: 13,
      transition: 'padding-left .03s linear',
    },
    logoItemAkamaiCollapsed: {
      '& .akamai-logo-name': {
        opacity: 0,
      },
      paddingLeft: 8,
    },
    menuGrid: {
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
    navLinkItem: {
      lineHeight: 0,
    },
  })
);

// TODO jss-to-tss-react codemod: usages of this hook outside of this file will not be converted.
export default useStyles;
