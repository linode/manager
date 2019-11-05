import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
  WithTheme
} from 'src/components/core/styles';

export type ClassNames =
  | 'menuGrid'
  | 'fadeContainer'
  | 'logoItem'
  | 'logoCollapsed'
  | 'logoItemCompact'
  | 'listItem'
  | 'collapsible'
  | 'linkItem'
  | 'active'
  | 'activeLink'
  | 'sublink'
  | 'sublinkActive'
  | 'arrow'
  | 'sublinkPanel'
  | 'spacer'
  | 'listItemAccount'
  | 'divider'
  | 'menu'
  | 'paper'
  | 'settings'
  | 'activeSettings'
  | 'settingsBackdrop';

export type StyleProps = WithStyles<ClassNames> & WithTheme;

const styles = (theme: Theme) =>
  createStyles({
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
      '&:hover': {
        backgroundColor: theme.bg.primaryNavActiveBG,
        '& $linkItem': {
          color: 'white'
        },
        '& svg': {
          fill: theme.color.white,
          '& *': {
            stroke: theme.color.white
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
          '&:not(.wBorder) circle': {
            display: 'none'
          },
          '& *': {
            transition: theme.transitions.create(['stroke']),
            stroke: theme.color.primaryNavText
          }
        }
      }
    },
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
          ${theme.spacing(2) + 3}px
          ${theme.spacing(2) - 2}px 
          ${theme.spacing(2) + 3}px 
          0
        `,
        borderColor: `transparent ${
          theme.bg.primaryNavActive
        } transparent transparent`,
        position: 'absolute',
        right: 0,
        top: 'calc(8% - 1px)'
      },
      '&:hover': {
        '&:before': {
          content: "''",
          borderColor: `transparent ${
            theme.bg.primaryNavActive
          } transparent transparent`
        }
      },
      [theme.breakpoints.down('sm')]: {
        '&:before': {
          display: 'none'
        }
      }
    },
    sublinkPanel: {
      paddingLeft: theme.spacing(6),
      paddingRight: theme.spacing(2),
      fontSize: '.9rem',
      flexShrink: 0,
      listStyleType: 'none'
    },
    sublink: {
      padding: `${theme.spacing(1) / 2}px 0 ${theme.spacing(1) /
        2}px ${theme.spacing(1)}px`,
      color: 'white',
      display: 'block',
      fontSize: '.8rem',
      '&:hover, &:focus': {
        textDecoration: 'underline',
        outline: 0
      }
    },
    activeLink: {
      color: 'white',
      '& $arrow': {
        transform: 'rotate(90deg)'
      }
    },
    sublinkActive: {
      textDecoration: 'underline'
    },
    arrow: {
      position: 'relative',
      top: 4,
      fontSize: '1.2rem',
      margin: '0 4px 0 -7px',
      transition: theme.transitions.create(['transform'])
    },
    spacer: {
      padding: 25
    },
    divider: {
      backgroundColor: 'rgba(0, 0, 0, 0.12)'
    },
    settings: {
      width: 30,
      margin: '24px auto 16px',
      alignItems: 'center',
      marginTop: 'auto',
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
  });

export default withStyles(styles, { withTheme: true });
