import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  menuGrid: {
    minHeight: 64,
    width: '100%',
    height: '100%',
    margin: 0,
    padding: 0,
    [theme.breakpoints.up('sm')]: {
      minHeight: 72
    },
    [theme.breakpoints.up('md')]: {
      minHeight: 80
    }
  },
  fadeContainer: {
    width: '100%',
    height: 'calc(100% - 90px)',
    display: 'flex',
    flexDirection: 'column'
  },
  logoItem: {
    minHeight: 64,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    padding: `
        ${theme.spacing(2) - 2}px
        0
        ${theme.spacing(1) + theme.spacing(1) / 2}px
        ${theme.spacing(4)}px
      `,
    '& svg': {
      maxWidth: theme.spacing(3) + 91
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
    maxHeight: 42,
    transition: theme.transitions.create(['background-color']),
    padding: `
        ${theme.spacing(1.5)}px
        ${theme.spacing(4) - 2}px
        ${theme.spacing(1.5) - 1}px
        ${theme.spacing(4) + 1}px
      `,
    '&:hover, &:focus': {
      backgroundColor: theme.bg.primaryNavActiveBG,
      textDecoration: 'none',
      '& $linkItem': {
        color: 'white'
      },
      '& svg': {
        fill: 'white',
        '& *': {
          stroke: 'white'
        }
      }
    },
    '& .icon': {
      marginRight: theme.spacing(2),
      '& svg': {
        width: 26,
        height: 26,
        transform: 'scale(1.75)',
        fill: theme.color.primaryNavText,
        transition: theme.transitions.create(['fill']),
        '&.small': {
          transform: 'scale(1)'
        },
        '&:not(.wBorder) circle, & .circle': {
          display: 'none'
        },
        '& *': {
          transition: theme.transitions.create(['stroke']),
          stroke: theme.color.primaryNavText
        }
      }
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
    fontFamily: 'LatoWebBold', // we keep this bold at all times
    '&.hiddenWhenCollapsed': {
      opacity: 0
    }
  },
  active: {
    backgroundColor: theme.bg.primaryNavActiveBG,
    '&:before': {
      content: "''",
      borderStyle: 'solid',
      borderWidth: `
          ${theme.spacing(1) + 11}px
          ${theme.spacing(1) + 6}px
          ${theme.spacing(1) + 11}px
          0
        `,
      borderColor: `transparent ${theme.bg.primaryNavActive} transparent transparent`,
      position: 'absolute',
      right: 0,
      top: theme.spacing(1) === 8 ? 2 : 0
    },
    '&:hover': {
      textDecoration: 'none',
      '&:before': {
        content: "''",
        borderColor: `transparent ${theme.bg.primaryNavActive} transparent transparent`
      }
    },
    [theme.breakpoints.down('sm')]: {
      '&:before': {
        display: 'none'
      }
    },
    '&.listItemCollapsed': {
      '&:before': {
        top: theme.spacing(1) === 8 ? 2 : 4
      }
    }
  },
  spacer: {
    padding: 25
  },
  divider: {
    backgroundColor: 'rgba(0, 0, 0, 0.12)'
  },
  settings: {
    width: 30,
    margin: `auto auto 16px`,
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
  }
}));

export default useStyles;
