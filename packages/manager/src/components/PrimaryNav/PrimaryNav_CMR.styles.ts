import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  menuGrid: {
    minHeight: 50,
    width: '100%',
    height: '100%',
    margin: 0,
    padding: 0,
    backgroundColor: theme.bg.primaryNavPaper,
    borderColor: theme.bg.primaryNavBorder,
    left: 'inherit',
    boxShadow: 'none',
    transition: 'width linear .1s',
    overflowX: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
    [theme.breakpoints.down('md')]: {
      justifyContent: 'left'
    }
  },
  // @todo: better name for this container
  fadeContainer: {
    marginLeft: 8,
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
    '& .logoLetters': {
      opacity: 0
    }
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    cursor: 'pointer',
    height: 50,
    fontSize: '1rem',
    paddingRight: 15,
    paddingLeft: 15,
    '&:hover': {
      backgroundColor: theme.bg.primaryNavActiveBG
    },
    '&:focus': {
      backgroundColor: theme.bg.primaryNavActiveBG
    }
  },
  listItemCollapsed: {},
  collapsible: {
    fontSize: '0.9rem'
  },
  linkItem: {
    transition: theme.transitions.create(['color']),
    color: theme.color.primaryNavText,
    opacity: 1,
    whiteSpace: 'nowrap',
    fontFamily: theme.font.normal
  },
  divider: {
    backgroundColor: 'rgba(0, 0, 0, 0.12)'
  },
  settings: {
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
    color: '#e7e7e7',
    transition: theme.transitions.create(['color']),
    '& svg': {
      transition: theme.transitions.create(['transform'])
    },
    '&:hover': {
      color: theme.color.green
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
  menu: {},
  paper: {
    maxWidth: 350,
    padding: 8,
    position: 'absolute',
    backgroundColor: theme.bg.navy,
    border: '1px solid #999',
    outline: 0,
    boxShadow: 'none',
    minWidth: 185
  },
  settingsBackdrop: {
    backgroundColor: 'rgba(0,0,0,.3)'
  },
  menuButton: {
    display: 'flex',
    alignItems: 'center',
    padding: 0,
    '&[data-reach-menu-button]': {
      textTransform: 'inherit',
      borderRadius: 0,
      fontSize: '1rem',
      backgroundColor: theme.bg.primaryNavPaper,
      color: theme.color.primaryNavText,
      cursor: 'pointer',
      border: 'none',
      '&[aria-expanded="true"]': {
        backgroundColor: theme.bg.primaryNavActiveBG,
        '& $caret': {
          transform: 'rotate(180deg)'
        }
      },
      height: 50,
      paddingRight: 8,
      paddingLeft: 15
    },
    '&:hover': {
      backgroundColor: theme.bg.primaryNavActiveBG
    },
    '&:focus': {
      backgroundColor: theme.bg.primaryNavActiveBG
    }
  },
  menuItemLink: {
    '&[data-reach-menu-item]': {
      cursor: 'pointer',
      height: 50,
      fontSize: '1rem',
      paddingTop: 12,
      paddingRight: 40,
      paddingBottom: 12,
      '&:hover': {
        backgroundColor: theme.bg.primaryNavActiveBG
      },
      '&:focus': {
        backgroundColor: theme.bg.primaryNavActiveBG
      },
      display: 'flex',
      alignItems: 'center',
      color: theme.color.primaryNavText
    },
    '&[data-reach-menu-item][data-selected]': {
      backgroundColor: theme.bg.primaryNavActiveBG
    },
    lineHeight: 1
  },
  menuItemList: {
    '&[data-reach-menu-items]': {
      padding: 0,
      border: 'none',
      whiteSpace: 'normal',
      backgroundColor: theme.bg.primaryNavPaper
    },
    '& :last-child': {
      height: 54
    }
  },
  menuPopover: {
    '&[data-reach-menu], &[data-reach-menu-popover]': {
      zIndex: 3000,
      position: 'absolute',
      top: 50,
      // Hack solution to have something semi-working on mobile.
      [theme.breakpoints.down('md')]: {
        left: 0
      }
    }
  },
  caret: {
    fontSize: 26,
    marginTop: 4,
    color: '#9ea4ae',
    marginLeft: 2
  },
  menuWrapper: {
    display: 'flex',
    alignItems: 'center',
    '&:hover': {
      backgroundColor: theme.bg.primaryNavActiveBG
    },
    '&:focus': {
      backgroundColor: theme.bg.primaryNavActiveBG
    }
  }
}));

export default useStyles;
