import createBreakpoints from '@material-ui/core/styles/createBreakpoints';
import createTheme from './themeFactory';

const breakpoints = createBreakpoints({});

export const light = createTheme({
  name: 'lightTheme',
});

const primaryColors = {
  main: '#3683DC',
  light: '#4D99F1',
  dark: '#2466B3',
  text: '#ffffff',
  headline: '#f4f4f4',
  divider: '#222222',
  offBlack: '#fff',
}

export const dark = createTheme({
  name: 'darkTheme',
  breakpoints,
  '@keyframes rotate': {
    from: {
      transform: 'rotate(0deg)',
    },
    to: {
      transform: 'rotate(360deg)',
    },
  },
  bg: {
    main: '#2F3236',
    offWhite: '#111111',
    offWhiteDT: '#444', // better handing for dark theme
    navy: '#32363C',
    lightBlue: '#444',
    white: '#32363C',
    pureWhite: '#000',
  },
  color: {
    headline: primaryColors.headline,
    red: '#CA0813',
    green: '#00B159',
    yellow: '#FECF2F',
    border1: '#000',
    border2: '#111',
    border3: '#222',
    borderPagination: '#222222',
    grey1: '#abadaf',
    grey2: 'rgba(0, 0, 0, 0.2)',
    grey3: '#999',
    white: '#32363C',
    black: '#fff',
    boxShadow: '#222',
    focusBorder: '#999',
    absWhite: '#000',
    blueDTwhite: '#fff',
    borderRow: 'rgba(0, 0, 0, 0.15)',
  },
  notificationList: {
    borderBottom: '1px solid #f4f4f4',
    '&:hover': {
      backgroundColor: '#111111',
    },
  },
  palette: {
    divider: primaryColors.divider,
    primary: primaryColors,
    text: {
      primary: primaryColors.text,
    },
  },
  typography: {
    headline: {
      color: primaryColors.headline,
    },
    title: {
      color: primaryColors.headline,
    },
    subheading: {
      color: primaryColors.headline,
    },
    caption: {
      color: primaryColors.text,
    },
    display2: {
      color: primaryColors.text,
    },
  },
  overrides: {
    MuiAppBar: {
      colorDefault: {
        backgroundColor: 'transparent',
      },
    },
    MuiBackdrop: {
      root: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      },
    },
    MuiButton: {
      root: {
        color: primaryColors.main,
        '&:hover': {
          backgroundColor: '#000',
        },
        '&[aria-expanded="true"]': {
          backgroundColor: primaryColors.dark,
        },
        '&$disabled': {
          color: '#888',
        },
      },
      raisedPrimary: {
        '&:hover, &:focus': {
          backgroundColor: primaryColors.light,
        },
        '&:active': {
          backgroundColor: primaryColors.dark,
        },
        '&$disabled': {
          color: '#888',
        },
        '&.cancel': {
          '&:hover, &:focus': {
            borderColor: '#fff',
          },
        },
      },
      raisedSecondary: {
        color: primaryColors.main,
        border: `1px solid ${primaryColors.main}`,
        '&:hover, &:focus': {
          color: primaryColors.light,
          borderColor: primaryColors.light,
        },
        '&:active': {
          color: primaryColors.dark,
          borderColor: primaryColors.dark,
        },
        '&$disabled': {
          borderColor: '#C9CACB',
          color: '#C9CACB',
        },
        '&.cancel': {
          borderColor: 'transparent',
          '&:hover, &:focus': {
            borderColor: primaryColors.light,
          },
        },
        '&.destructive': {
          borderColor: '#C44742',
          color: '#C44742',
          '&:hover, &:focus': {
            color: '#DF6560',
            borderColor: '#DF6560',
            backgroundColor: 'transparent',
          },
          '&:active': {
            color: '#963530',
            borderColor: '#963530',
          },
        },
      },
    },
    MuiCardHeader: {
      root: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
      },
    },
    MuiCardActions: {
      root: {
        backgroundColor: 'rgba(0, 0, 0, 0.2) !important',
      },
    },
    MuiChip: {
      root: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        color: '#fff',
        '&:hover': {
          '& $deleteIcon': {
            color: '#fff',
          },
        },
      },
    },
    MuiDialog: {
      paper: {
        boxShadow: '0 0 5px #222',
        background: '#000',
      },
    },
    MuiDialogTitle: {
      root: {
        borderBottom: '1px solid #222',
        '& h2': {
          color: primaryColors.headline,
        },
      },
    },
    MuiDrawer: {
      paper: {
        boxShadow: '0 0 5px #222',
      },
    },
    MuiExpansionPanel: {
      root: {
        '& table': {
          border: `1px solid ${primaryColors.divider}`,
        },
      },
    },
    MuiExpansionPanelDetails: {
      root: {
        backgroundColor: '#32363C',
      },
    },
    MuiExpansionPanelSummary: {
      root: {
        backgroundColor: '#32363C',
        '&:hover': {
          '& h3': {
            color: primaryColors.light,
          },
          '& $expandIcon': {
            '& svg': {
              fill: primaryColors.light,
            },
          },
        },
      },
      expandIcon: {
        color: primaryColors.main,
        '& svg': {
          fill: 'transparent',
        },
        '& .border': {
          stroke: `${primaryColors.light} !important`,
        },
      },
      focused: {
        backgroundColor: '#111111',
      },
    },
    MuiFormControl: {
      root: {
        '&.copy > div': {
          backgroundColor: '#2F3236',
        },
      },
    },
    MuiFormControlLabel: {
      disabled: {
        color: '#aaa !important',
      },
    },
    MuiFormLabel: {
      root: {
        color: '#C9CACB',
        '&$focused': {
          color: '#C9CACB',
        },
        '&$error': {
          color: '#C9CACB',
        },
      },
    },
    MuiFormHelperText: {
      root: {
        color: '#C9CACB',
        '&$error': {
          color: '#CA0813',
        },
      },
    },
    MuiIconButton: {
      root: {
        color: primaryColors.main,
        '&:hover': {
          color: primaryColors.light,
        },
      },
    },
    MuiInput: {
      root: {
        border: '1px solid #222',
        color: primaryColors.text,
        backgroundColor: '#444',
        '& svg': {
          color: primaryColors.main,
        },
      },
      focused: {
        borderColor: '#606469',
      },
      disabled: {
        borderColor: '#606469',
        color: '#eee !important',
      },
    },
    MuiInputAdornment: {
      root: {
        color: '#eee',
        '& p': {
          color: '#eee',
        },
      },
    },
    MuiListItem: {
      root: {
        color: primaryColors.text,
        '&.selectHeader': {
          color: primaryColors.text,
        },
      },
    },
    MuiMenu: {
      paper: {
        '&.selectMenuDropdown': {
          border: '1px solid #606469',
        },
        '& .selectMenuList': {
          '& li': {
            color: primaryColors.text,
          },
        },
      },
    },
    MuiMenuItem: {
      root: {
        color: primaryColors.main,
        '&:hover, &:focus': {
          backgroundColor: '#444',
          color: '#fff',
        },
      },
      selected: {
        backgroundColor: '#444 !important',
        color: `${primaryColors.text} !important`,
        opacity: 1,
        '&:focus': {
          backgroundColor: '#444 !important',
        },
      },
    },
    MuiPaper: {
      root: {
        backgroundColor: '#32363C',
      },
    },
    MuiPopover: {
      paper: {
        boxShadow: '0 0 5px #222',
      },
    },
    MuiSelect: {
      selectMenu: {
        color: primaryColors.text,
        backgroundColor: '#444',
        '&:focus': {
          backgroundColor: '#444',
        },
      },
    },
    MuiSnackbarContent: {
      root: {
        boxShadow: '0 0 5px #222',
      },
    },
    MuiSwitch: {
      root: {
        '& .icon': {
          transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
          position: 'relative',
          left: 0,
          width: 16,
          height: 16,
          borderRadius: 0,
        },
        '& .square': {
          transition: 'fill 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
        },
        '&:hover, &:focus, & [class*="MuiButtonBase-keyboardFocused"]': {
          '& $bar, & + $bar': {
            borderColor: '#606469',
          },
          '& .square': {
            fill: '#aaa',
          },
        },
      },
      checked: {
        transform: 'translateX(20px)',
        color: `${primaryColors.main} !important`,
        '& input': {
          left: -20,
        },
        '& .square': {
          fill: 'white !important',
        },
        '& + $bar': {
          opacity: 1,
          backgroundColor: `${primaryColors.main} !important`,
          borderColor: '#2967B1',
        },
      },
      bar: {
        top: 12,
        left: 12,
        marginLeft: 0,
        marginTop: 0,
        width: 42,
        height: 22,
        borderRadius: 0,
        backgroundColor: '#F4F4F4',
        border: '1px solid #999',
        boxSizing: 'content-box',
      },
      switchBase: {
        color: primaryColors.main,
      },
    },
    MuiTab: {
      root: {
        color: '#fff',
        '&:hover': {
          color: primaryColors.main,
        },
      },
      textColorPrimary: {
        color: primaryColors.text,
        '&$selected': {
          color: primaryColors.text,
        },
        '&$disabled': {
          color: '#666',
          cursor: 'not-allowed',
          pointerEvents: 'all !important',
        },
      },
    },
    MuiTableCell: {
      root: {
        borderBottom: `1px solid ${primaryColors.divider}`,
      },
      head: {
        color: primaryColors.text,
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
      },
    },
    MuiTabs: {
      root: {
        boxShadow: 'inset 0 -1px 0 #222',
      },
    },
    MuiTableRow: {
      root: {
        '&:before': {
          borderLeftColor: '#32363C',
        },
        '&:hover': {
          '&$hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            '&:before': {
              borderLeftColor: primaryColors.main,
            },
          },
        },
      },
      head: {
        backgroundColor: '#32363C',
        '&:before': {
          borderLeftColor: 'rgba(0, 0, 0, 0.15)',
        },
      },
      hover: {
        '& > td:first-child': {
          paddingLeft: 13,
        },
        '& a': {
          color: primaryColors.offBlack,
        },
      },
    },
    MuiTooltip: {
      tooltip: {
        backgroundColor: '#444',
        boxShadow: '0 0 5px #222',
        color: '#fff',
      },
    },
    MuiTypography: {
      root: {
        '& a.black': {
          color: primaryColors.text,
        },
        '& a.black:visited': {
          color: primaryColors.text,
        },
        '& a.black:hover': {
          color: primaryColors.text,
          textDecoration: 'underline',
        },
      },
    },
  },
});


