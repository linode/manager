import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  menuGrid: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.cmrBGColors.bgPrimaryNav,
    borderColor: theme.bg.primaryNavBorder,
    boxShadow: 'none',
    height: '100%',
    width: '100%',
    left: 'inherit',
    margin: 0,
    padding: 0,
    minHeight: 50,
    overflowX: 'auto',
    transition: 'width linear .1s'
  },
  menuGridInner: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',

    [theme.breakpoints.up('lg')]: {
      width: 1100
    }
  },
  primaryLinksContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  logoItem: {
    '& > a': {
      display: 'flex',
      alignItems: 'center'
    }
  },
  logoCollapsed: {
    marginLeft: 7.5,
    marginRight: 7.5
  },
  navIcon: {
    display: 'flex',
    backgroundColor: 'transparent',
    border: 'none',
    color: theme.color.white,
    fontSize: '1.125rem',
    lineHeight: '20px',
    '& svg': {
      marginTop: -2,
      marginRight: 10
    },
    [theme.breakpoints.up(750)]: {
      display: 'none'
    }
  },
  hideOnMobile: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',

    [theme.breakpoints.down(750)]: {
      display: 'none'
    }
  },
  secondaryLinksContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',

    '&  > a': {
      [theme.breakpoints.down('sm')]: {
        paddingLeft: 7.5,
        paddingRight: 7.5
      },
      [theme.breakpoints.down(750)]: {
        paddingLeft: 12.5,
        paddingRight: 12.5
      }
    }
  },
  primaryNavLinkIcon: {
    display: 'flex',
    alignItems: 'center',
    marginRight: 10
  },
  linkItem: {
    color: theme.color.primaryNavText,
    fontFamily: theme.font.normal,
    opacity: 1,
    transition: theme.transitions.create(['color']),
    whiteSpace: 'nowrap'
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '1rem',
    height: 50,
    lineHeight: 1,
    paddingLeft: 15,
    paddingRight: 15,
    position: 'relative',
    '&:hover': {
      backgroundColor: theme.cmrBGColors.bgPrimaryNavActive,
      textDecoration: 'none'
    },
    '&:focus': {
      backgroundColor: theme.cmrBGColors.bgPrimaryNavActive,
      textDecoration: 'none'
    },
    '& .icon': {
      [theme.breakpoints.down('md')]: {
        margin: 0
      }
    },
    [theme.breakpoints.down('sm')]: {
      paddingLeft: 7.5,
      paddingRight: 7.5
    }
  },
  listItemCollapsed: {},
  settings: {
    display: 'flex',
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'center',
    borderRadius: 0,
    color: '#e7e7e7',
    paddingLeft: 15,
    paddingRight: 15,
    transition: theme.transitions.create(['color']),
    '&:focus': {
      borderRadius: 0
    },
    '&:hover': {
      backgroundColor: theme.cmrBGColors.bgPrimaryNavActive
    },
    [theme.breakpoints.down('sm')]: {
      paddingLeft: 7.5,
      paddingRight: 7.5
    },
    [theme.breakpoints.down(750)]: {
      paddingLeft: 12.5,
      paddingRight: 12.5
    }
  },
  settingsCollapsed: {
    margin: `auto 16px 16px ${theme.spacing(4) - 1}px`
  },
  activeSettings: {
    color: theme.color.green,
    '& svg': {
      transform: 'rotate(90deg)'
    }
  },
  paper: {
    backgroundColor: theme.bg.navy,
    boxShadow: 'none',
    maxWidth: 350,
    minWidth: 185,
    outline: 0,
    padding: 8,
    position: 'absolute',
    top: 25
  },
  menuWrapper: {
    display: 'flex',
    alignItems: 'center',
    '&:hover': {
      backgroundColor: theme.cmrBGColors.bgPrimaryNavActive
    },
    '&:focus': {
      backgroundColor: theme.cmrBGColors.bgPrimaryNavActive
    }
  },
  menuButton: {
    display: 'flex',
    alignItems: 'center',
    lineHeight: 1,
    padding: 0,
    '&[data-reach-menu-button]': {
      backgroundColor: theme.cmrBGColors.bgPrimaryNav,
      border: 'none',
      borderRadius: 0,
      color: theme.color.primaryNavText,
      cursor: 'pointer',
      fontSize: '1rem',
      height: 50,
      paddingLeft: 15,
      paddingRight: 6,
      textTransform: 'inherit',
      '&[aria-expanded="true"]': {
        backgroundColor: theme.cmrBGColors.bgPrimaryNavActive,
        '& $caret': {
          transform: 'rotate(180deg)'
        }
      },
      [theme.breakpoints.down('sm')]: {
        paddingLeft: 7.5,
        paddingRight: 7.5
      }
    },
    '&:hover': {
      backgroundColor: theme.cmrBGColors.bgPrimaryNavActive
    },
    '&:focus': {
      backgroundColor: theme.cmrBGColors.bgPrimaryNavActive
    }
  },
  caret: {
    color: '#9ea4ae',
    marginTop: 4,
    marginLeft: 2
  },
  menuPopover: {
    '&[data-reach-menu], &[data-reach-menu-popover]': {
      position: 'absolute',
      top: 50,
      zIndex: 3000
    }
  },
  menuItemList: {
    '&[data-reach-menu-items]': {
      backgroundColor: theme.cmrBGColors.bgPrimaryNav,
      border: 'none',
      padding: 0,
      whiteSpace: 'normal'
    }
  },
  menuItemLink: {
    '&[data-reach-menu-item]': {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: theme.cmrBGColors.bgPrimaryNav,
      color: theme.color.primaryNavText,
      fontSize: '1rem',
      paddingTop: 12,
      paddingBottom: 12,
      paddingLeft: 15,
      paddingRight: 40,
      '&:hover': {
        backgroundColor: theme.cmrBGColors.bgPrimaryNavActive,
        textDecoration: 'none'
      },
      '&:focus': {
        backgroundColor: theme.cmrBGColors.bgPrimaryNavActive,
        textDecoration: 'none'
      },
      [theme.breakpoints.down('sm')]: {
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 7.5
      }
    },
    '&[data-reach-menu-item][data-selected]': {
      backgroundColor: theme.cmrBGColors.bgPrimaryNavActive
    }
  },
  mobileNav: {
    position: 'absolute',
    top: 0,
    left: theme.spacing(4),
    zIndex: 1200
  }
}));

export default useStyles;
