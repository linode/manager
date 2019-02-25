import createBreakpoints from 'src/components/core/styles/createBreakpoints';
import createTheme from './themeFactory';

const breakpoints = createBreakpoints({});

export const light = createTheme({
  name: 'lightTheme'
});

const primaryColors = {
  main: '#3683DC',
  light: '#4D99F1',
  dark: '#2466B3',
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
    animation: 'dash 2s linear forwards'
  },
  '& .insidePath *': {
    transition: 'fill .2s ease-in-out .2s, stroke .2s ease-in-out .2s',
    stroke: 'white'
  }
};

export const dark = createTheme({
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
    main: '#2F3236',
    offWhite: '#111111',
    offWhiteDT: '#444', // better handing for dark theme
    navy: '#32363C',
    lightBlue: '#222',
    white: '#32363C',
    pureWhite: '#000',
    tableHeader: 'rgba(0, 0, 0, 0.15)'
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
    offBlack: primaryColors.offBlack,
    boxShadow: '#222',
    focusBorder: '#999',
    absWhite: '#000',
    blueDTwhite: '#fff',
    selectDropDowns: primaryColors.main,
    borderRow: 'rgba(0, 0, 0, 0.15)',
    tableHeaderText: '#fff',
    toggleActive: '#444',
    diskSpaceBorder: '#222222',
    drawerBackdrop: 'rgba(0, 0, 0, 0.5)',
    label: '#C9CACB',
    disabledText: '#c9cAcb'
  },
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
    }
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
          color: '#888'
        },
        '&.loading': {
          color: primaryColors.text
        }
      },
      text: {
        '&:hover': {
          backgroundColor: 'transparent'
        }
      },
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
        border: `1px solid ${primaryColors.main}`,
        '&:hover, &:focus': {
          color: primaryColors.light,
          borderColor: primaryColors.light
        },
        '&:active': {
          color: primaryColors.dark,
          borderColor: primaryColors.dark
        },
        '&$disabled': {
          borderColor: '#C9CACB',
          color: '#C9CACB'
        },
        '&.cancel': {
          borderColor: 'transparent',
          '&:hover, &:focus': {
            borderColor: primaryColors.light
          }
        },
        '&.destructive': {
          borderColor: '#C44742',
          color: '#C44742',
          '&:hover, &:focus': {
            color: '#DF6560',
            borderColor: '#DF6560',
            backgroundColor: 'transparent'
          },
          '&:active': {
            color: '#963530',
            borderColor: '#963530'
          }
        },
        '&.loading': {
          borderColor: primaryColors.text,
          color: primaryColors.text,
          minWidth: 100,
          '& svg': {
            width: 22,
            height: 22,
            animation: 'rotate 2s linear infinite'
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
        boxShadow: '0 0 5px #222',
        background: '#000'
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
    MuiExpansionPanel: {
      root: {
        '& table': {
          border: `1px solid ${primaryColors.divider}`
        }
      }
    },
    MuiExpansionPanelDetails: {
      root: {
        backgroundColor: '#32363C'
      }
    },
    MuiExpansionPanelSummary: {
      root: {
        '& $focused': {
          backgroundColor: '#111111'
        },
        backgroundColor: '#32363C',
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
          backgroundColor: '#2F3236'
        }
      }
    },
    MuiFormControlLabel: {
      root: {
        '& $disabled': {
          color: '#aaa !important'
        }
      },
      disabled: {}
    },
    MuiFormLabel: {
      root: {
        color: '#C9CACB',
        '&$focused': {
          color: '#C9CACB'
        },
        '&$error': {
          color: '#C9CACB'
        },
        '&$disabled': {
          color: '#C9CACB'
        }
      }
    },
    MuiFormHelperText: {
      root: {
        color: '#C9CACB',
        '&$error': {
          color: '#CA0813'
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
        backgroundColor: '#32363C'
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
        backgroundColor: '#32363C',
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
      bar: {
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
        borderBottom: `2px solid ${primaryColors.divider}`
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
        backgroundColor: '#32363C',
        '&:before': {
          borderLeftColor: '#32363C'
        },
        '&:hover': {
          '&$hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            '&:before': {
              borderLeftColor: primaryColors.main
            }
          }
        }
      },
      head: {
        backgroundColor: '#32363C',
        '&:before': {
          backgroundColor: 'rgba(0, 0, 0, 0.15) !important'
        }
      },
      hover: {
        '& > td:first-child': {
          paddingLeft: 13
        },
        '& a': {
          color: primaryColors.main
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
});
