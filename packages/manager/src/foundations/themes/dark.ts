import { ThemeOptions } from '@mui/material/styles';

import { breakpoints } from 'src/foundations/breakpoints';

const primaryColors = {
  dark: '#2466b3',
  divider: '#222222',
  headline: '#f4f4f4',
  light: '#4d99f1',
  main: '#3683dc',
  text: '#ffffff',
  white: '#222',
};

export const customDarkModeOptions = {
  bg: {
    app: '#3a3f46',
    bgAccessRow: '#454b54',
    bgAccessRowTransparentGradient: 'rgb(69, 75, 84, .001)',
    bgPaper: '#2e3238',
    lightBlue1: '#222',
    lightBlue2: '#364863',
    main: '#2f3236',
    mainContentBanner: '#23272b',
    offWhite: '#444',
    primaryNavPaper: '#2e3238',
    tableHeader: '#33373e',
    white: '#32363c',
  },
  borderColors: {
    borderTable: '#3a3f46',
    borderTypography: '#454b54',
    divider: '#222',
  },
  color: {
    black: '#ffffff',
    blueDTwhite: '#fff',
    border2: '#111',
    border3: '#222',
    boxShadow: '#222',
    boxShadowDark: '#000',
    drawerBackdrop: 'rgba(0, 0, 0, 0.5)',
    grey1: '#abadaf',
    grey2: 'rgba(0, 0, 0, 0.2)',
    grey3: '#999',
    grey5: 'rgba(0, 0, 0, 0.2)',
    grey6: '#606469',
    grey7: '#2e3238',
    grey9: primaryColors.divider,
    headline: primaryColors.headline,
    label: '#c9cacb',
    offBlack: '#ffffff',
    red: '#fb6d6d',
    tableHeaderText: '#fff',
    tagButton: '#364863',
    tagIcon: '#9caec9',
    white: '#32363c',
  },
  textColors: {
    headlineStatic: '#e6e6e6',
    linkActiveLight: '#74aae6',
    tableHeader: '#888F91',
    tableStatic: '#e6e6e6',
    textAccessTable: '#acb0b4',
  },
} as const;

const iconCircleAnimation = {
  '& .circle': {
    fill: primaryColors.main,
    transition: 'fill .2s ease-in-out .2s',
  },
  '& .insidePath *': {
    stroke: 'white',
    transition: 'fill .2s ease-in-out .2s, stroke .2s ease-in-out .2s',
  },
  '& .outerCircle': {
    animation: '$dash 2s linear forwards',
    stroke: primaryColors.dark,
    strokeDasharray: 1000,
    strokeDashoffset: 1000,
  },
};

// Used for styling html buttons to look like our generic links
const genericLinkStyle = {
  '&:hover': {
    color: primaryColors.main,
    textDecoration: 'underline',
  },
  background: 'none',
  border: 'none',
  color: customDarkModeOptions.textColors.linkActiveLight,
  cursor: 'pointer',
  font: 'inherit',
  padding: 0,
};

// Used for styling status pills as seen on Linodes
const genericStatusPillStyle = {
  '&:before': {
    borderRadius: '50%',
    content: '""',
    display: 'inline-block',
    height: 16,
    marginRight: 8,
    minWidth: 16,
    width: 16,
  },
  backgroundColor: 'transparent',
  [breakpoints.down('sm')]: {
    fontSize: 14,
  },
  color: customDarkModeOptions.textColors.tableStatic,
  fontSize: '1rem',
  padding: 0,
};

const genericTableHeaderStyle = {
  '&:hover': {
    '& span': {
      color: customDarkModeOptions.textColors.linkActiveLight,
    },
    cursor: 'pointer',
  },
};

export const darkTheme: ThemeOptions = {
  animateCircleIcon: {
    ...iconCircleAnimation,
  },
  applyLinkStyles: {
    ...genericLinkStyle,
  },
  applyStatusPillStyles: {
    ...genericStatusPillStyle,
  },
  applyTableHeaderStyles: {
    ...genericTableHeaderStyle,
  },
  bg: customDarkModeOptions.bg,
  borderColors: customDarkModeOptions.borderColors,
  breakpoints,
  color: customDarkModeOptions.color,
  components: {
    MuiAppBar: {
      styleOverrides: {
        colorDefault: {
          backgroundColor: 'transparent',
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        listbox: {
          backgroundColor: customDarkModeOptions.bg.white,
          border: `1px solid ${primaryColors.main}`,
        },
        loading: {
          color: '#fff',
        },
        noOptions: {
          color: '#fff',
        },
        tag: {
          '.MuiChip-deleteIcon': { color: primaryColors.text },
          backgroundColor: customDarkModeOptions.bg.lightBlue1,
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: customDarkModeOptions.color.drawerBackdrop,
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          '&.loading': {
            color: primaryColors.text,
          },
          '&:active': {
            backgroundColor: primaryColors.dark,
          },
          '&:disabled': {
            backgroundColor: '#454b54',
            color: '#5c6470',
          },
          '&:hover, &:focus': {
            backgroundColor: '#226dc3',
          },
        },
        outlined: {
          '&:hover, &:focus': {
            backgroundColor: 'transparent !important',
            border: '1px solid #fff',
            color: '#fff',
          },
          color: customDarkModeOptions.textColors.linkActiveLight,
        },
        root: {
          '&.loading': {
            color: primaryColors.text,
          },
          '&:disabled': {
            backgroundColor: '#454b54',
            color: '#5c6470',
          },
          '&:hover': {
            backgroundColor: '#000',
          },
          color: primaryColors.main,
        },
      },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: {
          fontSize: '1rem',
        },
      },
    },
    MuiCardActions: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(0, 0, 0, 0.2) !important',
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
        },
      },
    },
    MuiChip: {
      defaultProps: {
        // In dark mode, we decided our Chips will be our primary color by default.
        color: 'primary',
      },
      styleOverrides: {
        clickable: {
          '&:focus': {
            backgroundColor: '#374863',
          },
          '&:hover': {
            backgroundColor: '#374863',
          },
          backgroundColor: '#415d81',
        },
        colorInfo: {
          color: primaryColors.dark,
        },
        outlined: {
          backgroundColor: 'transparent',
          borderRadius: 1,
        },
        root: {
          color: primaryColors.text,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          boxShadow: '0 0 5px #222',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #222',
          color: primaryColors.headline,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          boxShadow: '0 0 5px #222',
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          '&.copy > div': {
            backgroundColor: '#2f3236',
          },
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        disabled: {},
        label: {
          '&.Mui-disabled': {
            color: '#aaa !important',
          },
          color: primaryColors.text,
        },
        root: {},
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          '&$error': {
            color: '#fb6d6d',
          },
          color: '#c9cacb',
          lineHeight: 1.25,
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          '&$disabled': {
            color: '#c9cacb',
          },
          '&$error': {
            color: '#c9cacb',
          },
          '&.Mui-focused': {
            color: '#c9cacb',
          },
          color: '#c9cacb',
        },
      },
    },
    MuiInput: {
      styleOverrides: {
        disabled: {},
        focused: {},
        input: {
          '&.Mui-disabled': {
            '-webkit-text-fill-color': 'unset !important',
            borderColor: '#606469',
            color: '#ccc !important',
            opacity: 0.5,
          },
        },
        root: {
          '& svg': {
            color: primaryColors.main,
          },
          '&.Mui-disabled': {
            borderColor: '#606469',
            color: '#ccc !important',
            opacity: 0.5,
          },
          '&.Mui-error': {
            borderColor: '#fb6d6d',
          },
          '&.Mui-focused': {
            borderColor: primaryColors.main,
            boxShadow: '0 0 2px 1px #222',
          },
          backgroundColor: '#444',
          border: '1px solid #222',
          color: primaryColors.text,
        },
      },
    },
    MuiInputAdornment: {
      styleOverrides: {
        root: {
          '& p': {
            color: '#eee',
          },
          color: '#eee',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          '&.selectHeader': {
            color: primaryColors.text,
          },
          color: primaryColors.text,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&$selected, &$selected:hover': {
            backgroundColor: 'transparent',
            color: primaryColors.main,
            opacity: 1,
          },
          color: primaryColors.text,
        },
        selected: {},
      },
    },
    MuiPaper: {
      styleOverrides: {
        outlined: {
          border: '1px solid rgba(0, 0, 0, 0.2)',
        },
        root: {
          backgroundColor: '#2e3238',
          backgroundImage: 'none', // I have no idea why MUI defaults to setting a background image...
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          boxShadow: '0 0 5px #222',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {},
    },
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          backgroundColor: '#32363c',
          boxShadow: '0 0 5px #222',
          color: primaryColors.text,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          '&$selected, &$selected:hover': {
            color: '#fff',
          },
          color: '#fff',
        },
        selected: {},
        textColorPrimary: {
          '&$selected, &$selected:hover': {
            color: '#fff',
          },
          color: '#fff',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: 'rgba(0, 0, 0, 0.15)',
          color: primaryColors.text,
        },
        root: {
          '& a': {
            color: customDarkModeOptions.textColors.linkActiveLight,
          },
          '& a:hover': {
            color: primaryColors.main,
          },
          borderBottom: `1px solid ${primaryColors.divider}`,
          borderTop: `1px solid ${primaryColors.divider}`,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        head: {
          '&:before': {
            backgroundColor: 'rgba(0, 0, 0, 0.15) !important',
          },
          backgroundColor: '#32363c',
        },
        hover: {
          '& a': {
            color: primaryColors.text,
          },
        },
        root: {
          '&:before': {
            borderLeftColor: '#32363c',
          },
          '&:hover, &:focus': {
            '&$hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
            },
          },
          backgroundColor: '#32363c',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        flexContainer: {
          '& $scrollButtons:first-of-type': {
            color: '#222',
          },
        },
        root: {
          boxShadow: 'inset 0 -1px 0 #222',
        },
        scrollButtons: {
          color: '#fff',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#444',
          boxShadow: '0 0 5px #222',
          color: '#fff',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          '& a': {
            color: customDarkModeOptions.textColors.linkActiveLight,
          },
          '& a.black': {
            color: primaryColors.text,
          },
          '& a.black:hover': {
            color: primaryColors.text,
          },
          '& a.black:visited': {
            color: primaryColors.text,
          },
          '& a:hover': {
            color: primaryColors.main,
          },
        },
      },
    },
  },
  graphs: {
    cpu: {
      percent: `rgb(54, 131, 220)`,
      system: `rgb(2, 118, 253)`,
      user: `rgb(81, 166, 245)`,
      wait: `rgb(145, 199, 237)`,
    },
    diskIO: {
      read: `rgb(255, 196, 105)`,
      swap: `rgb(238, 44, 44)`,
      write: `rgb(255, 179, 77)`,
    },
    network: {
      inbound: `rgb(16, 162, 29)`,
      outbound: `rgb(49, 206, 62)`,
    },
    purple: `rgb(217, 176, 217)`,
    red: `rgb(255, 99, 60)`,
    yellow: `rgb(255, 220, 125)`,
  },
  name: 'dark',
  palette: {
    background: {
      default: customDarkModeOptions.bg.app,
      paper: '#2e3238',
    },
    divider: primaryColors.divider,
    error: {
      dark: customDarkModeOptions.color.red,
      light: customDarkModeOptions.color.red,
      main: customDarkModeOptions.color.red,
    },
    mode: 'dark',
    primary: primaryColors,
    text: {
      primary: primaryColors.text,
    },
  },
  textColors: customDarkModeOptions.textColors,
  typography: {
    body1: {
      color: primaryColors.text,
    },
    caption: {
      color: primaryColors.text,
    },
    h1: {
      color: primaryColors.headline,
    },
    h2: {
      color: primaryColors.headline,
    },
    h3: {
      color: primaryColors.headline,
    },
    subtitle1: {
      color: primaryColors.text,
    },
  },
};
