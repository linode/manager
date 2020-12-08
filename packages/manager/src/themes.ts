import createBreakpoints from 'src/components/core/styles/createBreakpoints';
import createTheme from './themeFactory';

const breakpoints = createBreakpoints({});

export const light = (spacingOverride?: number) => {
  const options: any = { name: 'lightTheme' };

  if (spacingOverride) {
    options.spacingOverride = spacingOverride;
  }

  return createTheme(options);
};

const cmrBGColors = {
  bgApp: '#3a3f46',
  bgPrimaryNav: '#23262a',
  bgPrimaryNavActive: '#0C0D0E',
  bgSecondaryActions: '#2e3238',
  bgSearchBar: '#515862',
  bgPaper: '#2e3238',
  bgPrimaryButton: '#3683dc',
  // notification center, add a tag, breadcrumb
  bgSecondaryButton: '#364863',
  bgTableHeader: '#33373e',
  bgTableBody: '#2e3238',
  bgStatusChip: '#454b54',
  bgBillingSummary: '#2d3d53',
  bgBreadcrumbParent: '#364863',
  bgAccessRow: '#454b54',
  bgAccessHeader: '#3a3f46'
};

const cmrTextColors = {
  textAction: '#74aae6',
  textBillingSummary: '#f2f2f2',
  textTab: '#74aae6',
  textTabActive: '#74aae6',
  textStatusChip: '#e6e6e6',
  linkActiveMedium: '#2575d0',
  linkActiveLight: '#74aae6',
  headlineStatic: '#e6e6e6',
  headlineActive: '#abb1ba',
  tableStatic: '#e6e6e6',
  textTagButton: '#9caec9',
  textAccessTable: '#acb0b4',
  textAccessCode: '#e4e5e7',
  textBreadcrumbParent: '#ffffff'
};

const cmrBorderColors = {
  borderNotificationCenter: '#486084',
  borderTypography: '#454b54',
  borderTabs: '#5c6470',
  borderTabActive: '#74aae6',
  borderBillingSummary: '#243142',
  borderBalance: '#4d79b2',
  borderTable: '#3a3f46'
};

const cmrIconColors = {
  iStatic: '#abb1ba',
  iActiveMedium: '#2575d0',
  iActiveLight: '#74aae6',
  iGreen: '#17cf73',
  iOrange: '#ffb31a',
  iRed: '#cf1e1e',
  // Offline status
  iGrey: '#dbdde1',
  iCheckmark: '#fff'
};

const primaryColors = {
  main: '#3683dc',
  light: '#4d99f1',
  dark: '#2466b3',
  text: '#ffffff',
  headline: '#f4f4f4',
  divider: '#222222',
  offBlack: '#fff',
  white: '#222'
};

const iconCircleAnimation = {
  '& .circle': {
    fill: primaryColors.main,
    transition: 'fill .2s ease-in-out .2s'
  },
  '& .outerCircle': {
    stroke: primaryColors.dark,
    strokeDasharray: 1000,
    strokeDashoffset: 1000,
    animation: '$dash 2s linear forwards'
  },
  '& .insidePath *': {
    transition: 'fill .2s ease-in-out .2s, stroke .2s ease-in-out .2s',
    stroke: 'white'
  }
};

// Used for styling status pills as seen on Linodes
const genericStatusPillStyle = {
  backgroundColor: 'transparent',
  color: cmrTextColors.textStatusChip,
  fontSize: '1rem',
  padding: 0,
  '&:before': {
    display: 'inline-block',
    borderRadius: '50%',
    content: '""',
    height: 16,
    width: 16,
    minWidth: 16,
    marginRight: 8
  },
  [breakpoints.down('sm')]: {
    fontSize: 14,
    padding: '15px 12px',
    borderRadius: 15
  }
};

export const dark = (spacingOverride?: number) => {
  const options: any = { ...darkThemeOptions };
  if (spacingOverride) {
    options.spacingOverride = spacingOverride;
  }
  return createTheme(options);
};

const darkThemeOptions = {
  name: 'darkTheme',
  breakpoints,
  '@keyframes rotate': {
    from: {
      transform: 'rotate(0deg)'
    },
    to: {
      transform: 'rotate(360deg)'
    }
  },
  '@keyframes dash': {
    to: {
      'stroke-dashoffset': 0
    }
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
    primaryNavBorder: '#303235',
    primaryNavPaper: '#2e3238',
    topMenu: '#33383d',
    billingHeader: '#222',
    controlHeader: 'rgba(0, 0, 0, 0.2)',
    chipActive: 'rgba(0,0,0,0.9)'
  },
  color: {
    headline: primaryColors.headline,
    red: '#ca0813',
    green: '#00b159',
    orange: '#ffb31a',
    yellow: '#fecf2f',
    border1: '#000',
    border2: '#111',
    border3: '#222',
    borderPagination: '#222222',
    grey1: '#abadaf',
    grey2: 'rgba(0, 0, 0, 0.2)',
    grey3: '#999',
    grey5: 'rgba(0, 0, 0, 0.2)',
    grey7: 'rgba(0, 0, 0, 0.2)',
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
    tagBorder: '#2e3238'
  },
  cmrBGColors,
  cmrBorderColors,
  cmrTextColors,
  cmrIconColors,
  animateCircleIcon: {
    ...iconCircleAnimation
  },
  notificationList: {
    borderBottom: '1px solid #f4f4f4',
    '&:hover': {
      backgroundColor: '#111111'
    }
  },
  palette: {
    divider: primaryColors.divider,
    primary: primaryColors,
    text: {
      primary: primaryColors.text
    }
  },
  typography: {
    h1: {
      color: primaryColors.headline
    },
    h2: {
      color: primaryColors.headline
    },
    h3: {
      color: primaryColors.headline
    },
    caption: {
      color: primaryColors.text
    },
    h4: {
      color: primaryColors.text
    },
    body1: {
      color: primaryColors.text
    },
    body2: {
      color: primaryColors.text
    },
    subtitle1: {
      color: primaryColors.text
    }
  },
  applyStatusPillStyles: {
    ...genericStatusPillStyle
  },
  overrides: {
    MuiAppBar: {
      colorDefault: {
        backgroundColor: 'transparent'
      }
    },
    MuiBackdrop: {
      root: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      }
    },
    MuiButton: {
      label: {
        position: 'relative'
      },
      root: {
        color: primaryColors.main,
        '&:hover': {
          backgroundColor: '#000'
        },
        '&[aria-expanded="true"]': {
          backgroundColor: primaryColors.dark
        },
        '&$disabled': {
          color: '#888',
          opacity: 0.5
        },
        '&.loading': {
          color: primaryColors.text
        }
      },
      // text: {
      //   '&:hover': {
      //     backgroundColor: 'transparent'
      //   }
      // },
      containedPrimary: {
        '&:hover, &:focus': {
          backgroundColor: primaryColors.light
        },
        '&:active': {
          backgroundColor: primaryColors.dark
        },
        '&$disabled': {
          color: '#888'
        },
        '&.loading': {
          backgroundColor: primaryColors.text
        },
        '&.cancel': {
          '&:hover, &:focus': {
            borderColor: '#fff'
          }
        }
      },
      containedSecondary: {
        color: primaryColors.main,
        '&:hover, &:focus': {
          color: primaryColors.light
        },
        '&:active': {
          color: primaryColors.dark,
          borderColor: primaryColors.dark
        },
        '&$disabled': {
          color: '#c9cacb'
        },
        '&.cancel': {
          borderColor: 'transparent',
          '&:hover, &:focus': {
            borderColor: primaryColors.light
          }
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
            height: 22
          }
        }
      }
    },
    MuiButtonBase: {
      root: {
        fontSize: '1rem'
      }
    },
    MuiCardHeader: {
      root: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)'
      }
    },
    MuiChip: {
      root: {
        color: primaryColors.text,
        backgroundColor: primaryColors.main
      }
    },
    MuiCardActions: {
      root: {
        backgroundColor: 'rgba(0, 0, 0, 0.2) !important'
      }
    },
    MuiDialog: {
      paper: {
        boxShadow: '0 0 5px #222'
      }
    },
    MuiDialogTitle: {
      root: {
        borderBottom: '1px solid #222',
        '& h2': {
          color: primaryColors.headline
        }
      }
    },
    MuiDrawer: {
      paper: {
        boxShadow: '0 0 5px #222'
      }
    },
    MuiAccordion: {
      root: {
        '& table': {
          border: `1px solid ${primaryColors.divider}`
        }
      }
    },
    MuiAccordionDetails: {
      root: {
        backgroundColor: '#32363c'
      }
    },
    MuiAccordionSummary: {
      root: {
        '&$focused': {
          backgroundColor: '#111111'
        },
        backgroundColor: '#32363c',
        '&:hover': {
          '& h3': {
            color: primaryColors.light
          },
          '& $expandIcon': {
            '& svg': {
              fill: primaryColors.light
            }
          }
        }
      },
      expandIcon: {
        color: primaryColors.main,
        '& svg': {
          fill: 'transparent'
        },
        '& .border': {
          stroke: `${primaryColors.light} !important`
        }
      },
      focused: {}
    },
    MuiFormControl: {
      root: {
        '&.copy > div': {
          backgroundColor: '#2f3236'
        }
      }
    },
    MuiFormControlLabel: {
      root: {
        '& $disabled': {
          color: '#aaa !important'
        }
      },
      label: {
        color: primaryColors.text
      },
      disabled: {}
    },
    MuiFormLabel: {
      root: {
        color: '#c9cacb',
        '&$focused': {
          color: '#c9cacb'
        },
        '&$error': {
          color: '#c9cacb'
        },
        '&$disabled': {
          color: '#c9cacb'
        }
      }
    },
    MuiFormHelperText: {
      root: {
        color: '#c9cacb',
        lineHeight: 1.25,
        '&$error': {
          color: '#ca0813'
        }
      }
    },
    MuiIconButton: {
      root: {
        color: primaryColors.main,
        '&:hover': {
          color: primaryColors.light
        }
      }
    },
    MuiInput: {
      root: {
        '&$disabled': {
          borderColor: '#606469',
          color: '#ccc !important'
        },
        '&$focused': {
          borderColor: primaryColors.main,
          boxShadow: '0 0 2px 1px #222'
        },
        border: '1px solid #222',
        color: primaryColors.text,
        backgroundColor: '#444',
        '& svg': {
          color: primaryColors.main
        }
      },
      focused: {},
      disabled: {}
    },
    MuiInputAdornment: {
      root: {
        color: '#eee',
        '& p': {
          color: '#eee'
        }
      }
    },
    MuiListItem: {
      root: {
        color: primaryColors.text,
        '&.selectHeader': {
          color: primaryColors.text
        }
      }
    },
    MuiMenuItem: {
      root: {
        color: primaryColors.text,
        '&$selected, &$selected:hover': {
          backgroundColor: 'transparent',
          color: primaryColors.main,
          opacity: 1
        }
      },
      selected: {}
    },
    MuiPaper: {
      root: {
        // originally '#32363c'
        backgroundColor: cmrBGColors.bgPaper
      }
    },
    MuiPopover: {
      paper: {
        boxShadow: '0 0 5px #222'
      }
    },
    MuiSelect: {
      selectMenu: {
        color: primaryColors.text,
        backgroundColor: '#444',
        '&:focus': {
          backgroundColor: '#444'
        }
      }
    },
    MuiSnackbarContent: {
      root: {
        backgroundColor: '#32363c',
        color: primaryColors.text,
        boxShadow: '0 0 5px #222'
      }
    },
    MuiSwitch: {
      root: {
        '& $checked': {
          color: `#abadaf !important`,
          '& .square': {
            fill: 'white !important'
          }
        }
      },
      checked: {},
      switchBase: {
        color: '#abadaf !important'
      },
      track: {
        border: '1px solid #222'
      }
    },
    MuiTab: {
      root: {
        color: '#fff',
        '&$selected, &$selected:hover': {
          color: '#fff'
        }
      },
      textColorPrimary: {
        color: '#fff',
        '&$selected, &$selected:hover': {
          color: '#fff'
        }
      },
      selected: {}
    },
    MuiTableCell: {
      root: {
        borderTop: `1px solid ${primaryColors.divider}`,
        borderBottom: `1px solid ${primaryColors.divider}`
      },
      head: {
        color: primaryColors.text,
        backgroundColor: 'rgba(0, 0, 0, 0.15)'
      }
    },
    MuiTabs: {
      root: {
        boxShadow: 'inset 0 -1px 0 #222'
      },
      flexContainer: {
        '& $scrollButtons:first-child': {
          color: '#222'
        }
      },
      scrollButtons: {
        color: '#fff'
      }
    },
    MuiTableRow: {
      root: {
        backgroundColor: '#32363c',
        '&:before': {
          borderLeftColor: '#32363c'
        },
        '&:hover, &:focus': {
          '&$hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.1)'
          }
        }
      },
      head: {
        backgroundColor: '#32363c',
        '&:before': {
          backgroundColor: 'rgba(0, 0, 0, 0.15) !important'
        }
      },
      hover: {
        '& a': {
          color: primaryColors.text
        }
      }
    },
    MuiTooltip: {
      tooltip: {
        backgroundColor: '#444',
        boxShadow: '0 0 5px #222',
        color: '#fff'
      }
    },
    MuiTypography: {
      root: {
        '& a.black': {
          color: primaryColors.text
        },
        '& a.black:visited': {
          color: primaryColors.text
        },
        '& a.black:hover': {
          color: primaryColors.text
        }
      }
    }
  }
};
