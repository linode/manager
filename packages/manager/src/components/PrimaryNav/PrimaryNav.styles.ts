import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  menuGrid: {
    minHeight: 64,
    height: '100%',
    width: '100%',
    margin: 0,
    padding: 0,
    [theme.breakpoints.up('sm')]: {
      minHeight: 72,
    },
    [theme.breakpoints.up('md')]: {
      minHeight: 80,
    },
    '&:hover': {
      '& svg': {
        '& path.st0': {
          fill: '#f93',
        },
      },
    },
  },
  fadeContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100% - 90px)',
    width: '100%',
  },
  logoItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 12px 0 14px',
    position: 'relative',
  },
  logoItemAkamai: {
    paddingTop: 10,
  },
  logoItemAkamaiWave: {
    display: 'flex',
    alignItems: 'center',
    padding: '54px 54px 0 58px',
    position: 'relative',
  },
  logoCollapsed: {
    background: theme.bg.primaryNavPaper,
    height: 48,
    width: 100,
    position: 'absolute',
    top: 12,
    left: 48,
  },
  logoAkamaiCollapsed: {
    background: theme.bg.primaryNavPaper,
    height: 38,
    width: 128,
    position: 'absolute',
    top: 12,
    left: -8,
    '& path.st0': {
      fill: 'none',
    },
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    height: 36,
    lineHeight: 0,
    padding: '12px 16px',
    position: 'relative',
    transition: theme.transitions.create(['background-color']),
    '& p': {
      marginTop: 0,
      marginBottom: 0,
    },
    '&:focus': {
      textDecoration: 'none',
    },
    '&:hover': {
      border: 'red',
      backgroundImage: 'linear-gradient(98deg, #38584B 1%, #3A5049 166%)',
      textDecoration: 'none',
      '& $linkItem': {
        color: 'white',
      },
      '& .icon': {
        opacity: 1,
      },
      '& svg': {
        color: theme.color.teal,
        fill: theme.color.teal,
      },
    },
    '& .icon': {
      color: '#CFD0D2',
      marginRight: theme.spacing(2),
      opacity: 0.5,
      '& svg': {
        display: 'flex',
        alignItems: 'center',
        height: 20,
        width: 20,
        '&:not(.wBorder) circle, & .circle': {
          display: 'none',
        },
      },
    },
  },
  linkItem: {
    display: 'flex',
    alignItems: 'center',
    color: '#fff',
    fontFamily: 'LatoWebBold', // we keep this bold at all times
    opacity: 1,
    transition: theme.transitions.create(['color']),
    whiteSpace: 'nowrap',
    '&.hiddenWhenCollapsed': {
      opacity: 0,
    },
  },
  active: {
    backgroundImage: 'linear-gradient(98deg, #38584B 1%, #3A5049 166%)',
    textDecoration: 'none',
    '& .icon': {
      opacity: 1,
    },
    '& svg': {
      color: theme.color.teal,
    },
  },
  divider: {
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    color: '#222',
  },
  chip: {
    marginTop: 2,
  },
  logoSvgCollapsed: {
    // Hide 'Akamai Cloud Computing' when the navigation is collapsed and the nav is not hovered
    '& > g ': {
      display: 'none',
    },
    'nav:hover & > g ': {
      display: 'unset',
    },
    // Make the logo 115px so that the Linode 'bug' is centered when the navigation is collapsed
    width: 115,
  },
  logoContainer: {
    // when the nav is collapsed, but hovered by the user, make the logo full sized
    'nav:hover & > svg ': {
      width: 128,
    },
  },
  logo: {
    // give the svg a transition so it smoothly resizes
    transition: 'all .03s linear',
  },
}));

export default useStyles;
