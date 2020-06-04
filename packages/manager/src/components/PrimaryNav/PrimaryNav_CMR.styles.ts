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
    overflowX: 'scroll',
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
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
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
    // temporary:
    padding: `0 18px 0 18px`,
    fontSize: '1rem'
  },
  listItemCollapsed: {},
  collapsible: {
    fontSize: '0.9rem'
  },
  linkItem: {
    height: '100%',
    transition: theme.transitions.create(['color']),
    color: theme.color.primaryNavText,
    opacity: 1,
    whiteSpace: 'nowrap',
    fontFamily: 'LatoWebBold', // we keep this bold at all times
    '&.hiddenWhenCollapsed': {
      opacity: 0
    }
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
  button: {
    '&[data-reach-menu-button]': {
      textTransform: 'inherit',
      borderRadius: 0,
      fontSize: '1rem',
      lineHeight: 1,
      fontFamily: theme.spacing() === 4 ? theme.font.normal : theme.font.bold,
      backgroundColor: theme.bg.primaryNavPaper,
      color: theme.color.primaryNavText,
      paddingRight: 8,
      position: 'relative',

      cursor: 'pointer',
      border: 'none',
      [theme.breakpoints.down('sm')]: {
        padding: '6px 34px 7px 11px',
        maxHeight: 50,
        minWidth: 105
      },
      '&:hover': {
        backgroundColor: theme.bg.primaryNavActiveBG
      },
      '&:focus': {
        backgroundColor: theme.bg.primaryNavActiveBG
      },
      '&[aria-expanded="true"]': {
        backgroundColor: theme.bg.primaryNavActiveBG,
        '& $caret': {
          transform: 'rotate(180deg)'
        }
      }
    }
  },
  menuItemLink: {
    '&[data-reach-menu-item]': {
      height: '100%',
      transition: theme.transitions.create(['color']),
      color: theme.color.primaryNavText,
      opacity: 1,
      whiteSpace: 'nowrap',
      fontFamily: 'LatoWebBold', // we keep this bold at all times
      '&.hiddenWhenCollapsed': {
        opacity: 0
      },
      cursor: 'pointer'
    },
    '&[data-reach-menu-item] [data-selected]': {
      background: theme.bg.main
      // '& svg': {
      //   ...theme.addCircleHoverEffect,
      //   backgroundColor: theme.bg.primaryNavPaper,
      //   color: theme.color.primaryNavText
      // }
    }
  },
  menuItemList: {
    '&[data-reach-menu-items]': {
      zIndex: 10000,
      padding: 0,
      border: 'none',
      whiteSpace: 'normal',
      boxShadow: `0 0 5px ${theme.color.boxShadow}`,
      backgroundColor: theme.bg.primaryNavPaper
    }
  },
  menuPopover: {
    '&[data-reach-menu], &[data-reach-menu-popover]': {
      width: 350,
      [theme.breakpoints.up('md')]: {
        top: 12,
        right: 0
      }
    }
  },
  caret: {
    color: theme.bg.primaryNavActiveBG,
    fontSize: 24
    // position: 'absolute',
    // right: theme.spacing(2) + 2,
    // top: theme.spacing(1) + 5,
    // [theme.breakpoints.down('sm')]: {
    //   right: 5
    // }
  },
  menuWrapper: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
    // order: 3,
    // marginRight: theme.spacing(1),
    // [theme.breakpoints.down('sm')]: {
    // flex: 1
    // }
  }
}));

export default useStyles;
