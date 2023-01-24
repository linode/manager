import createTheme, { breakpoints } from './themeFactory';

export const light = () => {
  const options: any = { name: 'lightTheme' };

  return createTheme(options);
};

export const dark = () => {
  const options: any = { ...darkThemeOptions };

  return createTheme(options);
};

const textColors = {
  linkActiveLight: '#74aae6',
  headlineStatic: '#e6e6e6',
  tableHeader: '#888F91',
  tableStatic: '#e6e6e6',
  textAccessTable: '#acb0b4',
};

const borderColors = {
  borderTypography: '#454b54',
  borderTable: '#3a3f46',
  divider: '#222',
};

const primaryColors = {
  main: '#3683dc',
  light: '#4d99f1',
  dark: '#2466b3',
  text: '#ffffff',
  headline: '#f4f4f4',
  divider: '#222222',
  white: '#222',
};

const iconCircleAnimation = {
  '& .circle': {
    fill: primaryColors.main,
    transition: 'fill .2s ease-in-out .2s',
  },
  '& .outerCircle': {
    stroke: primaryColors.dark,
    strokeDasharray: 1000,
    strokeDashoffset: 1000,
    animation: '$dash 2s linear forwards',
  },
  '& .insidePath *': {
    transition: 'fill .2s ease-in-out .2s, stroke .2s ease-in-out .2s',
    stroke: 'white',
  },
};

// Used for styling html buttons to look like our generic links
const genericLinkStyle = {
  background: 'none',
  color: textColors.linkActiveLight,
  border: 'none',
  font: 'inherit',
  padding: 0,
  cursor: 'pointer',
  '&:hover': {
    color: primaryColors.main,
    textDecoration: 'underline',
  },
};

// Used for styling status pills as seen on Linodes
const genericStatusPillStyle = {
  backgroundColor: 'transparent',
  color: textColors.tableStatic,
  fontSize: '1rem',
  padding: 0,
  '&:before': {
    display: 'inline-block',
    borderRadius: '50%',
    content: '""',
    height: 16,
    width: 16,
    minWidth: 16,
    marginRight: 8,
  },
  [breakpoints.down('sm')]: {
    fontSize: 14,
  },
};

const genericTableHeaderStyle = {
  '&:hover': {
    cursor: 'pointer',
    '& span': {
      color: textColors.linkActiveLight,
    },
  },
};

const darkThemeOptions = {
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
  '@keyframes dash': {
    to: {
      'stroke-dashoffset': 0,
    },
  },
  bg: {
    app: '#3a3f46',
    main: '#2f3236',
    offWhite: '#444',
    lightBlue1: '#222',
    lightBlue2: '#364863',
    white: '#32363c',
    tableHeader: '#33373e',
    primaryNavPaper: '#2e3238',
    mainContentBanner: '#23272b',
    bgPaper: '#2e3238',
    bgAccessRow: '#454b54',
    bgAccessRowTransparentGradient: 'rgb(69, 75, 84, .001)',
  },
  color: {
    headline: primaryColors.headline,
    red: '#fb6d6d',
    border2: '#111',
    border3: '#222',
    grey1: '#abadaf',
    grey2: 'rgba(0, 0, 0, 0.2)',
    grey3: '#999',
    grey5: 'rgba(0, 0, 0, 0.2)',
    grey6: '#606469',
    grey7: '#2e3238',
    grey9: primaryColors.divider,
    white: '#32363c',
    black: '#fff',
    offBlack: '#fff',
    boxShadow: '#222',
    boxShadowDark: '#000',
    blueDTwhite: '#fff',
    tableHeaderText: '#fff',
    drawerBackdrop: 'rgba(0, 0, 0, 0.5)',
    label: '#c9cacb',
    tagButton: '#364863',
    tagIcon: '#9caec9',
  },
  borderColors,
  textColors,
  graphs: {
    network: {
      outbound: `rgb(49, 206, 62)`,
      inbound: `rgb(16, 162, 29)`,
    },
    cpu: {
      system: `rgb(2, 118, 253)`,
      user: `rgb(81, 166, 245)`,
      wait: `rgb(145, 199, 237)`,
      percent: `rgb(54, 131, 220)`,
    },
    diskIO: {
      read: `rgb(255, 196, 105)`,
      write: `rgb(255, 179, 77)`,
      swap: `rgb(238, 44, 44)`,
    },
    purple: `rgb(217, 176, 217)`,
    red: `rgb(255, 99, 60)`,
    yellow: `rgb(255, 220, 125)`,
  },
  animateCircleIcon: {
    ...iconCircleAnimation,
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
    background: {
      paper: '#2e3238',
    },
  },
  typography: {
    h1: {
      color: primaryColors.headline,
    },
    h2: {
      color: primaryColors.headline,
    },
    h3: {
      color: primaryColors.headline,
    },
    caption: {
      color: primaryColors.text,
    },
    body1: {
      color: primaryColors.text,
    },
    subtitle1: {
      color: primaryColors.text,
    },
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
      label: {
        position: 'relative',
      },
      root: {
        color: primaryColors.main,
        '&:hover': {
          backgroundColor: '#000',
        },
        '&[aria-expanded="true"]': {
          backgroundColor: primaryColors.dark,
        },
        '&:disabled': {
          backgroundColor: '#454b54',
          color: '#5c6470',
        },
        '&.loading': {
          color: primaryColors.text,
        },
      },
      containedPrimary: {
        '&:hover, &:focus': {
          backgroundColor: '#226dc3',
        },
        '&:active': {
          backgroundColor: primaryColors.dark,
        },
        '&:disabled': {
          backgroundColor: '#454b54',
          color: '#5c6470',
        },
        '&.loading': {
          color: primaryColors.text,
        },
      },
      outlined: {
        color: textColors.linkActiveLight,
        '&:hover, &:focus': {
          backgroundColor: 'transparent !important',
          border: '1px solid #fff',
          color: '#fff',
        },
      },
    },
    MuiButtonBase: {
      root: {
        fontSize: '1rem',
      },
    },
    MuiCardHeader: {
      root: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
      },
    },
    MuiChip: {
      root: {
        color: primaryColors.text,
        backgroundColor: primaryColors.main,
      },
      clickable: {
        backgroundColor: '#415d81',
        '&:hover': {
          backgroundColor: '#374863',
        },
        '&:focus': {
          backgroundColor: '#374863',
        },
      },
      outlined: {
        borderRadius: 1,
        backgroundColor: 'transparent',
      },
    },
    MuiCardActions: {
      root: {
        backgroundColor: 'rgba(0, 0, 0, 0.2) !important',
      },
    },
    MuiDialog: {
      paper: {
        boxShadow: '0 0 5px #222',
      },
    },
    MuiDialogTitle: {
      root: {
        borderBottom: '1px solid #222',
        color: primaryColors.headline,
      },
    },
    MuiDrawer: {
      paper: {
        boxShadow: '0 0 5px #222',
      },
    },
    MuiFormControl: {
      root: {
        '&.copy > div': {
          backgroundColor: '#2f3236',
        },
      },
    },
    MuiFormControlLabel: {
      root: {},
      label: {
        color: primaryColors.text,
        '&.Mui-disabled': {
          color: '#aaa !important',
        },
      },
      disabled: {},
    },
    MuiFormLabel: {
      root: {
        color: '#c9cacb',
        '&$focused': {
          color: '#c9cacb',
        },
        '&$error': {
          color: '#c9cacb',
        },
        '&$disabled': {
          color: '#c9cacb',
        },
      },
    },
    MuiFormHelperText: {
      root: {
        color: '#c9cacb',
        lineHeight: 1.25,
        '&$error': {
          color: '#fb6d6d',
        },
      },
    },
    MuiIconButton: {
      root: {
        '&:hover': {
          color: primaryColors.light,
        },
      },
    },
    MuiInput: {
      input: {
        '&.Mui-disabled': {
          borderColor: '#606469',
          color: '#ccc !important',
          opacity: 0.5,
          '-webkit-text-fill-color': 'unset !important',
        },
      },
      root: {
        backgroundColor: '#444',
        border: '1px solid #222',
        color: primaryColors.text,
        '&.Mui-disabled': {
          borderColor: '#606469',
          opacity: 0.5,
          color: '#ccc !important',
        },
        '&.Mui-focused': {
          borderColor: primaryColors.main,
          boxShadow: '0 0 2px 1px #222',
        },
        '&.Mui-error': {
          borderColor: '#fb6d6d',
        },
        '& svg': {
          color: primaryColors.main,
        },
      },
      focused: {},
      disabled: {},
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
    MuiMenuItem: {
      root: {
        color: primaryColors.text,
        '&$selected, &$selected:hover': {
          backgroundColor: 'transparent',
          color: primaryColors.main,
          opacity: 1,
        },
      },
      selected: {},
    },
    MuiPaper: {
      root: {
        backgroundColor: '#2e3238',
      },
      outlined: {
        border: '1px solid rgba(0, 0, 0, 0.2)',
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
        backgroundColor: '#32363c',
        color: primaryColors.text,
        boxShadow: '0 0 5px #222',
      },
    },
    MuiTab: {
      root: {
        color: '#fff',
        '&$selected, &$selected:hover': {
          color: '#fff',
        },
      },
      textColorPrimary: {
        color: '#fff',
        '&$selected, &$selected:hover': {
          color: '#fff',
        },
      },
      selected: {},
    },
    MuiTableCell: {
      root: {
        borderTop: `1px solid ${primaryColors.divider}`,
        borderBottom: `1px solid ${primaryColors.divider}`,
        '& a': {
          color: textColors.linkActiveLight,
        },
        '& a:hover': {
          color: primaryColors.main,
        },
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
      flexContainer: {
        '& $scrollButtons:first-child': {
          color: '#222',
        },
      },
      scrollButtons: {
        color: '#fff',
      },
    },
    MuiTableRow: {
      root: {
        backgroundColor: '#32363c',
        '&:before': {
          borderLeftColor: '#32363c',
        },
        '&:hover, &:focus': {
          '&$hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
          },
        },
      },
      head: {
        backgroundColor: '#32363c',
        '&:before': {
          backgroundColor: 'rgba(0, 0, 0, 0.15) !important',
        },
      },
      hover: {
        '& a': {
          color: primaryColors.text,
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
        '& a': {
          color: textColors.linkActiveLight,
        },
        '& a:hover': {
          color: primaryColors.main,
        },
        '& a.black': {
          color: primaryColors.text,
        },
        '& a.black:visited': {
          color: primaryColors.text,
        },
        '& a.black:hover': {
          color: primaryColors.text,
        },
      },
    },
  },
};
