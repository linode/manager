import createBreakpoints from 'src/components/core/styles/createBreakpoints';
import createTheme from './themeFactory';

const breakpoints = createBreakpoints({});

export const light = () => {
  const options: any = { name: 'lightTheme' };

  return createTheme(options);
};

const cmrBGColors = {
  bgApp: '#3a3f46',
  bgPrimaryNav: '#23262a',
  bgPrimaryNavActive: '#0C0D0E',
  bgPaper: '#2e3238',
  bgPrimaryButton: '#3683dc',
  // notification center, add a tag, breadcrumb
  bgSecondaryButton: 'transparent',
  bgCopyButton: '#364863',
  bgTPAButton: '#444',
  bgTableHeader: '#33373e',
  bgBillingSummary: '#2d3d53',
  bgAccessRow: '#454b54',
  bgAccessRowTransparentGradient: 'rgb(69, 75, 84, .001)',
  bgTableRow: 'rgba(0, 0, 0, 0.1)',
  bgReferralsImage: '#83868C',
};

const cmrTextColors = {
  linkActiveLight: '#74aae6',
  headlineStatic: '#e6e6e6',
  tableHeader: '#888F91',
  tableStatic: '#e6e6e6',
  textAccessTable: '#acb0b4',
  secondaryButton: '#fff',
};

const cmrBorderColors = {
  borderTypography: '#454b54',
  borderBillingSummary: '#243142',
  borderBalance: '#4d79b2',
  borderTable: '#3a3f46',
  borderSecondaryButton: '#fff',
  divider: '#222',
  dividerLight: '#2e3238',
};

const cmrIconColors = {
  iActiveLight: '#74aae6',
  iGreen: '#17cf73',
  iOrange: '#ffb31a',
  iRed: '#cf1e1e',
  // Offline status
  iGrey: '#dbdde1',
};

const primaryColors = {
  main: '#3683dc',
  light: '#4d99f1',
  dark: '#2466b3',
  text: '#ffffff',
  headline: '#f4f4f4',
  divider: '#222222',
  offBlack: '#fff',
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
  color: cmrTextColors.linkActiveLight,
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
  color: cmrTextColors.tableStatic,
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
      color: cmrTextColors.linkActiveLight,
    },
  },
};

export const dark = () => {
  const options: any = { ...darkThemeOptions };

  return createTheme(options);
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
    main: '#2f3236',
    offWhite: '#111111',
    offWhiteDT: '#444', // better handing for dark theme
    navy: '#32363c',
    lightBlue: '#222',
    white: '#32363c',
    pureWhite: '#000',
    tableHeader: '#2B2E32',
    primaryNavActive: '#303235',
    primaryNavActiveBG: '#464c53',
    primaryNavPaper: '#2e3238',
    mainContentBanner: '#23272B',
    topMenu: '#33383d',
    billingHeader: '#222',
    controlHeader: 'rgba(0, 0, 0, 0.2)',
    chipActive: 'rgba(0,0,0,0.9)',
  },
  color: {
    headline: primaryColors.headline,
    red: '#fb6d6d',
    green: '#00b159',
    orange: '#ffb31a',
    yellow: '#fecf2f',
    border2: '#111',
    border3: '#222',
    borderPagination: '#222222',
    grey1: '#abadaf',
    grey2: 'rgba(0, 0, 0, 0.2)',
    grey3: '#999',
    grey5: 'rgba(0, 0, 0, 0.2)',
    grey6: '#606469',
    grey7: cmrBGColors.bgPaper,
    grey9: primaryColors.divider,
    grey10: '#dbdde1',
    white: '#32363c',
    blue: primaryColors.main,
    black: '#fff',
    offBlack: primaryColors.offBlack,
    boxShadow: '#222',
    boxShadowDark: '#000',
    focusBorder: '#999',
    absWhite: '#000',
    blueDTwhite: '#fff',
    selectDropDowns: primaryColors.main,
    borderRow: 'rgba(0, 0, 0, 0.15)',
    tableHeaderText: '#fff',
    toggleActive: '#444',
    diskSpaceBorder: '#222222',
    drawerBackdrop: 'rgba(0, 0, 0, 0.5)',
    label: '#c9cacb',
    disabledText: '#c9cacb',
    kubeLabel: '#fff',
    primaryNavText: '#fff',
    borderBilling: primaryColors.light,
    billingText: '#fff',
    tagButton: '#364863',
    tagText: '#9caec9',
    tagIcon: '#9caec9',
    tagBorder: '#2e3238',
  },
  cmrBGColors,
  cmrBorderColors,
  cmrTextColors,
  cmrIconColors,
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
    h4: {
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
        '&$disabled': {
          backgroundColor: '#454b54',
          color: '#5c6470',
        },
        '&Miu-disabled': {
          backgroundColor: '#454b54',
          color: '#5c6470',
        },
        '&.loading': {
          color: primaryColors.text,
        },
      },
      // text: {
      //   '&:hover': {
      //     backgroundColor: 'transparent'
      //   }
      // },
      containedPrimary: {
        '&:hover, &:focus': {
          backgroundColor: '#226dc3',
        },
        '&:active': {
          backgroundColor: primaryColors.dark,
        },
        '&Miu-disabled': {
          backgroundColor: '#454b54',
          color: '#5c6470',
        },
        '&$disabled': {
          backgroundColor: '#454b54',
          color: '#5c6470',
        },
        '&.loading': {
          backgroundColor: primaryColors.text,
        },
        '&.cancel': {
          '&:hover, &:focus': {
            borderColor: '#fff',
          },
        },
      },
      containedSecondary: {
        color: cmrTextColors.linkActiveLight,
        '&:hover, &:focus': {
          color: cmrTextColors.linkActiveLight,
        },
        '&:active': {
          color: primaryColors.dark,
          borderColor: primaryColors.dark,
        },
        '&$disabled': {
          color: '#5c6470',
          backgroundColor: '#454b54',
        },
        '&.cancel': {
          borderColor: 'transparent',
          '&:hover, &:focus': {
            borderColor: primaryColors.light,
          },
        },
        // '&.destructive': {
        //   borderColor: '#c44742',
        //   color: '#c44742',
        //   '&:hover, &:focus': {
        //     color: '#df6560',
        //     borderColor: '#df6560',
        //     backgroundColor: 'transparent'
        //   },
        //   '&:active': {
        //     color: '#963530',
        //     borderColor: '#963530'
        //   }
        // },
        '&.loading': {
          color: primaryColors.text,
          minWidth: 100,
          '& svg': {
            width: 22,
            height: 22,
          },
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
        '&:hover': {
          background: '#226dc3',
        },
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
    MuiAccordion: {
      root: {
        '& table': {
          border: `1px solid ${primaryColors.divider}`,
        },
      },
    },
    MuiAccordionDetails: {
      root: {
        backgroundColor: '#32363c',
      },
    },
    MuiAccordionSummary: {
      root: {
        backgroundColor: '#32363c',
        '&:hover': {
          '& h3': {
            color: primaryColors.light,
          },
        },
        '&$focused': {
          backgroundColor: '#111111',
        },
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
      root: {
        '& $disabled': {
          color: '#aaa !important',
        },
      },
      label: {
        color: primaryColors.text,
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
        color: primaryColors.main,
        '&:hover': {
          color: primaryColors.light,
        },
      },
    },
    MuiInput: {
      root: {
        backgroundColor: '#444',
        border: '1px solid #222',
        color: primaryColors.text,
        '&$disabled': {
          borderColor: '#606469',
          color: '#ccc !important',
        },
        '&$focused': {
          borderColor: primaryColors.main,
          boxShadow: '0 0 2px 1px #222',
        },
        '&$error': {
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
        backgroundColor: cmrBGColors.bgPaper,
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
          color: cmrTextColors.linkActiveLight,
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
          color: cmrTextColors.linkActiveLight,
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
