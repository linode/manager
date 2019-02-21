import { mergeDeepRight } from 'ramda';
import createBreakpoints from 'src/components/core/styles/createBreakpoints';
import createMuiTheme, {
  ThemeOptions
} from 'src/components/core/styles/createMuiTheme';

/**
 * Augmenting Palette and Palette Options
 * @todo Move status out of the palette and add it as a custom ThemeOption.
 */

declare module '@material-ui/core/styles/createPalette' {
  interface Palette {
    status: {
      success: string;
      successDark: string;
      warning: string;
      warningDark: string;
      error: string;
      errorDark: string;
    };
  }

  interface PaletteOptions {
    status?: {
      success?: string;
      successDark?: string;
      warning?: string;
      warningDark?: string;
      error?: string;
      errorDark?: string;
    };
  }
}

/**
 * Augmenting the Theme and ThemeOptions.
 */
declare module '@material-ui/core/styles/createMuiTheme' {
  interface Theme {
    name: string;
    '@keyframes rotate': any;
    '@keyframes dash': any;
    bg: any;
    color: any;
    animateCircleIcon?: any;
    notificationList: any;
    status: any;
  }

  interface ThemeOptions {
    name?: string;
    '@keyframes rotate'?: any;
    '@keyframes dash'?: any;
    bg?: any;
    color?: any;
    animateCircleIcon?: any;
    notificationList?: any;
    status?: any;
  }
}

const breakpoints = createBreakpoints({});

const primaryColors = {
  main: '#3683DC',
  light: '#4D99F1',
  dark: '#2466B3',
  text: '#606469',
  headline: '#32363C',
  divider: '#f4f4f4',
  offBlack: '#444',
  white: '#fff'
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

const themeDefaults: ThemeOptions = {
  breakpoints,
  shadows: [
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none'
  ],
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
    main: '#f4f4f4',
    offWhite: '#fbfbfb',
    offWhiteDT: '#fbfbfb', // better handing for dark theme
    navy: '#32363C',
    lightBlue: '#D7E3EF',
    white: '#fff',
    pureWhite: '#fff',
    tableHeader: '#fbfbfb'
  },
  color: {
    headline: primaryColors.headline,
    red: '#CA0813',
    green: '#00B159',
    yellow: '#FECF2F',
    border1: '#ABADAF',
    border2: '#C5C6C8',
    border3: '#eee',
    borderPagination: '#ccc',
    grey1: '#abadaf',
    grey2: '#E7E7E7',
    grey3: '#ccc',
    white: '#fff',
    black: '#222',
    offBlack: primaryColors.offBlack,
    boxShadow: '#ddd',
    focusBorder: '#999',
    absWhite: '#fff',
    blueDTwhite: '#3683DC',
    selectDropDowns: primaryColors.main,
    borderRow: 'white',
    tableHeaderText: 'rgba(0, 0, 0, 0.54)',
    toggleActive: '#606469',
    diskSpaceBorder: '#f4f4f4',
    drawerBackdrop: 'rgba(255, 255, 255, 0.5)',
    label: '#555',
    disabledText: '#c9cAcb'
  },
  animateCircleIcon: {
    ...iconCircleAnimation
  },
  notificationList: {
    padding: '16px 32px 16px 23px',
    borderBottom: '1px solid #fbfbfb',
    transition: 'background-color 225ms ease-in-out',
    '&:hover': {
      backgroundColor: '#f4f4f4'
    }
  },
  palette: {
    divider: primaryColors.divider,
    primary: primaryColors,
    text: {
      primary: primaryColors.text
    },
    status: {
      success: '#d7e3EF',
      successDark: '#3682dd',
      warning: '#fdf4da',
      warningDark: '#ffd002',
      error: '#f8dedf',
      errorDark: '#cd2227'
    }
  },
  typography: {
    useNextVariants: true,
    fontFamily: '"LatoWeb", sans-serif',
    fontSize: 16,
    h1: {
      color: primaryColors.headline,
      fontSize: '1.25rem',
      lineHeight: '1.75rem',
      fontFamily: 'LatoWebBold',
      [breakpoints.up('lg')]: {
        fontSize: '1.5rem',
        lineHeight: '1.875rem'
      }
    },
    h2: {
      color: primaryColors.headline,
      fontSize: '1.125rem',
      fontFamily: 'LatoWebBold',
      lineHeight: '1.5rem'
    },
    h3: {
      color: primaryColors.headline,
      fontSize: '1rem',
      fontFamily: 'LatoWebBold',
      lineHeight: '1rem'
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: '1rem'
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: '1rem'
    },
    caption: {
      fontSize: '0.625rem',
      lineHeight: '0.625rem',
      color: primaryColors.text
    },
    h4: {
      fontSize: '2.188rem',
      lineHeight: '2.188rem',
      color: primaryColors.text,
      [breakpoints.up('lg')]: {
        fontSize: '2.5rem',
        lineHeight: '2.5rem'
      }
    }
  },
  overrides: {
    MuiAppBar: {
      colorDefault: {
        backgroundColor: 'inherit'
      }
    },
    MuiBackdrop: {
      root: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)'
      }
    },
    MuiButton: {
      label: {
        position: 'relative'
      },
      root: {
        textTransform: 'inherit',
        borderRadius: 0,
        fontSize: '1rem',
        fontFamily: 'LatoWebBold',
        color: primaryColors.main,
        padding: '9px 28px 11px',
        maxHeight: 48,
        '&:hover': {
          backgroundColor: '#fff'
        },
        '&:focus': {
          backgroundColor: 'transparent'
        },
        '&[aria-expanded="true"]': {
          backgroundColor: primaryColors.dark
        },
        '&$disabled': {
          color: '#bbb'
        },
        '&.loading': {
          color: primaryColors.text
        }
      },
      text: {
        padding: '9px 28px 11px',
        '&:hover': {
          color: primaryColors.light
        }
      },
      flat: {
        '&.cancel:hover': {
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
          color: 'white'
        },
        '&.loading': {
          backgroundColor: primaryColors.text
        },
        '&.cancel': {
          '&:hover, &:focus': {
            borderColor: '#222'
          }
        }
      },
      containedSecondary: {
        backgroundColor: 'transparent',
        color: primaryColors.main,
        border: `1px solid ${primaryColors.main}`,
        padding: '9px 28px 11px',
        transition: 'border 225ms ease-in-out, color 225ms ease-in-out',
        '&:hover, &:focus': {
          backgroundColor: 'transparent !important',
          color: primaryColors.light,
          borderColor: primaryColors.light
        },
        '&:active': {
          backgroundColor: 'transparent',
          color: primaryColors.dark,
          borderColor: primaryColors.dark
        },
        '&$disabled': {
          borderColor: '#C9CACB',
          backgroundColor: 'transparent',
          color: '#C9CACB'
        },
        '&.cancel': {
          borderColor: 'transparent',
          '&:hover, &:focus': {
            borderColor: primaryColors.light,
            backgroundColor: 'transparent'
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
        backgroundColor: '#fbfbfb'
      },
      content: {
        // This is necessary for text to ellipsis responsively without the need for a hard set width value that won't play well with flexbox.
        minWidth: 0
      }
    },
    MuiChip: {
      root: {
        backgroundColor: '#f4f4f4',
        height: 20,
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 4,
        marginTop: 2,
        marginBottom: 2,
        marginRight: 4,
        paddingLeft: 2,
        paddingRight: 2,
        color: primaryColors.text,
        fontSize: '.8rem',
        '&:last-child': {
          marginRight: 0
        },
        '&:hover': {
          '& $deleteIcon': {
            color: primaryColors.white,
            '&:hover': {
              color: primaryColors.main,
              backgroundColor: primaryColors.white
            }
          }
        },
        '&:focus': {
          outline: '1px dotted #999'
        }
      },
      label: {
        paddingLeft: 4,
        paddingRight: 4,
        position: 'relative',
        top: -1
      },
      deleteIcon: {
        padding: 2,
        marginLeft: 4,
        marginRight: 2,
        color: primaryColors.text,
        borderRadius: '50%',
        width: 18,
        height: 18,
        '& svg': {
          width: 12,
          height: 12,
          borderRadius: '50%'
        },
        [breakpoints.down('xs')]: {
          marginLeft: 8,
          marginRight: -8,
          marginTop: -6,
          color: 'white !important',
          '& svg': {
            width: 20,
            height: 20,
            borderRadius: '50%',
            backgroundColor: primaryColors.main
          }
        }
      }
    },
    MuiCircularProgress: {
      circle: {
        strokeLinecap: 'inherit'
      }
    },
    MuiCollapse: {
      container: {
        width: '100%'
      }
    },
    MuiDialog: {
      paper: {
        boxShadow: '0 0 5px #bbb'
      }
    },
    MuiDialogActions: {
      root: {
        margin: 0,
        padding: '0 24px 24px 24px',
        justifyContent: 'flex-start',
        '& .actionPanel': {
          padding: 0
        }
      },
      action: {
        margin: 0
      }
    },
    MuiDialogTitle: {
      root: {
        borderBottom: '1px solid #eee',
        marginBottom: 20,
        '& h2': {
          color: primaryColors.headline
        }
      }
    },
    MuiDrawer: {
      paper: {
        boxShadow: '0 0 5px #bbb',
        /** @todo This is breaking typing. */
        // overflowY: 'overlay',
        display: 'block',
        fallbacks: {
          overflowY: 'auto'
        }
      }
    },
    MuiExpansionPanel: {
      root: {
        '& .actionPanel': {
          paddingLeft: 16,
          paddingRight: 16
        },
        '& table': {
          border: `1px solid ${primaryColors.divider}`,
          borderBottom: 0
        }
      }
    },
    MuiExpansionPanelDetails: {
      root: {
        padding: 16,
        backgroundColor: 'white'
      }
    },
    MuiExpansionPanelSummary: {
      root: {
        '&$focused': {
          backgroundColor: '#fbfbfb'
        },
        padding: '0 18px',
        backgroundColor: '#fbfbfb',
        justifyContent: 'flex-start',
        '& h3': {
          transition: 'color 400ms cubic-bezier(0.4, 0, 0.2, 1) 0ms'
        },
        '&:hover': {
          '& h3': {
            color: primaryColors.light
          },
          '& $expandIcon': {
            '& svg': {
              fill: primaryColors.light,
              stroke: 'white'
            }
          }
        },
        '&:focus': {
          outline: '1px dotted #999',
          zIndex: 2
        },
        '&$expanded': {
          minHeight: 48
        }
      },
      content: {
        flexGrow: 0,
        order: 2,
        '&$expanded': {
          margin: 0
        }
      },
      expanded: {
        margin: 0
      },
      expandIcon: {
        display: 'flex',
        order: 1,
        top: 0,
        right: 0,
        transform: 'none',
        color: primaryColors.main,
        position: 'relative',
        marginLeft: -16,
        '& svg': {
          fill: '#fff',
          transition: `${'stroke 400ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, '}
            ${'fill 400ms cubic-bezier(0.4, 0, 0.2, 1) 0ms'}`,
          width: 22,
          height: 22
        },
        '& .border': {
          stroke: `${primaryColors.light} !important`
        },
        '&$expanded': {
          transform: 'none'
        }
      },
      focused: {}
    },
    MuiFormControl: {
      root: {
        marginTop: 16,
        minWidth: 120,
        '&.copy > div': {
          backgroundColor: '#f4f4f4'
        },
        [breakpoints.down('xs')]: {
          width: '100%'
        }
      }
    },
    MuiFormControlLabel: {
      root: {
        marginLeft: -11
      }
    },
    MuiFormLabel: {
      root: {
        color: '#555',
        fontFamily: 'LatoWebBold',
        fontSize: '.9rem',
        marginBottom: 2,
        '&$focused': {
          color: '#555'
        },
        '&$error': {
          color: '#555'
        },
        '&$disabled': {
          color: '#555',
          opacity: 0.5
        }
      }
    },
    MuiFormHelperText: {
      root: {
        '&$error': {
          color: '#CA0813'
        }
      }
    },
    MuiIconButton: {
      root: {
        color: primaryColors.main,
        '&:hover': {
          color: primaryColors.light,
          backgroundColor: 'transparent'
        }
      }
    },
    MuiRadio: {
      root: {
        '& $checked': {
          color: primaryColors.main
        },
        color: primaryColors.main
      },
      checked: {},
      colorSecondary: {
        color: primaryColors.main,
        '&$checked': {
          color: primaryColors.main
        }
      }
    },
    MuiInput: {
      root: {
        '&$disabled': {
          borderColor: '#ccc',
          color: '#ccc',
          opacity: 0.5
        },
        '&$focused': {
          borderColor: primaryColors.main,
          boxShadow: '0 0 2px 1px #e1edfa'
        },
        maxWidth: 415,
        border: '1px solid #ccc',
        alignItems: 'center',
        transition: 'border-color 225ms ease-in-out',
        lineHeight: 1,
        minHeight: 48,
        color: primaryColors.text,
        boxSizing: 'border-box',
        backgroundColor: '#fff',
        [breakpoints.down('xs')]: {
          maxWidth: '100%',
          width: '100%'
        },
        '& svg': {
          fontSize: 18,
          color: primaryColors.main,
          '&:hover': {
            color: '#5E9AEA'
          }
        },
        '&.affirmative': {
          borderColor: '#00B159'
        }
      },
      inputMultiline: {
        minHeight: 125,
        padding: '5px 12px',
        lineHeight: 1.4
      },
      focused: {},
      error: {
        borderColor: '#CA0813'
      },
      disabled: {},
      input: {
        padding: '12px 12px 13px',
        fontSize: '.9rem',
        boxSizing: 'border-box'
      },
      inputType: {
        height: 'auto'
      },
      formControl: {
        'label + &': {
          marginTop: 0
        }
      }
    },
    MuiInputAdornment: {
      root: {
        fontSize: '.9rem',
        color: '#606469',
        whiteSpace: 'nowrap',
        '& p': {
          fontSize: '.9rem',
          color: '#606469'
        }
      },
      positionEnd: {
        marginRight: 10
      }
    },
    MuiInputLabel: {
      formControl: {
        position: 'relative'
      },
      shrink: {
        transform: 'none'
      }
    },
    MuiList: {
      padding: {
        paddingTop: 0,
        paddingBottom: 0
      },
      root: {
        '&.reset': {
          padding: 'inherit',
          margin: 'inherit',
          listStyle: 'initial',
          '& li': {
            display: 'list-item',
            padding: 0,
            listStyleType: 'initial'
          }
        }
      }
    },
    MuiListItem: {
      root: {
        color: primaryColors.text,
        '&$disabled': {
          opacity: 0.5
        },
        '&$selected, &$selected:hover': {
          backgroundColor: 'transparent',
          color: primaryColors.main
        },

        '&.selectHeader': {
          opacity: 1,
          fontFamily: 'LatoWebBold',
          fontSize: '1rem',
          color: primaryColors.text
        }
      },
      disabled: {},
      selected: {}
    },
    MuiListItemText: {
      secondary: {
        marginTop: 4,
        lineHeight: '1.2em'
      }
    },
    MuiMenu: {
      paper: {
        maxWidth: 350,
        '&.selectMenuDropdown': {
          boxShadow: 'none',
          position: 'absolute',
          boxSizing: 'content-box',
          border: `1px solid ${primaryColors.main}`,
          margin: '0 0 0 -1px',
          outline: 0,
          borderRadius: 0
        },
        '& .selectMenuList': {
          maxHeight: 250,
          overflowY: 'auto',
          overflowX: 'hidden',
          boxSizing: 'content-box',
          padding: 4,
          '& li': {
            paddingLeft: 10,
            paddingRight: 10
          },
          [breakpoints.down('xs')]: {
            minWidth: 200
          }
        }
      }
    },
    MuiMenuItem: {
      root: {
        height: 'auto',
        fontFamily: 'LatoWeb',
        fontSize: '.9rem',
        whiteSpace: 'initial',
        textOverflow: 'initial',
        color: primaryColors.text,
        transition: `${'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), '}
        ${'color .2s cubic-bezier(0.4, 0, 0.2, 1)'}`,
        '&$selected, &$selected:hover': {
          backgroundColor: 'transparent',
          color: primaryColors.main,
          opacity: 1
        },
        '&:hover': {
          backgroundColor: primaryColors.main,
          color: 'white'
        },
        '& em': {
          fontStyle: 'normal !important'
        }
      },
      selected: {}
    },
    MuiPaper: {
      rounded: {
        borderRadius: 0
      }
    },
    MuiPopover: {
      paper: {
        boxShadow: '0 0 5px #ddd',
        borderRadius: 0,
        minWidth: 200,
        [breakpoints.up('lg')]: {
          minWidth: 250
        }
      }
    },
    MuiSelect: {
      selectMenu: {
        '&$disabled': {
          '&+ input + $icon': {
            opacity: '.5'
          }
        },
        padding: '6px 32px 5px 12px',
        color: primaryColors.text,
        backgroundColor: '#fff',
        lineHeight: 2.3,
        minHeight: 46,
        minWidth: 150,
        '&:focus': {
          backgroundColor: '#fff'
        },
        '& em': {
          fontStyle: 'normal'
        }
      },
      select: {
        '&[aria-pressed="true"]': {
          '&+ input + $icon': {
            opacity: 1
          }
        }
      },
      icon: {
        marginTop: -2,
        marginRight: 4,
        width: 28,
        height: 28,
        transition: 'color 225ms ease-in-out',
        color: '#aaa !important',
        opacity: 0.5
      },
      disabled: {}
    },
    MuiSnackbar: {
      root: {}
    },
    MuiSnackbarContent: {
      root: {
        boxShadow: '0 0 5px #ddd',
        color: '#606469',
        backgroundColor: 'white',
        borderLeft: `6px solid transparent`,
        borderRadius: 0,
        [breakpoints.up('md')]: {
          borderRadius: 0
        }
      }
    },
    MuiSwitch: {
      root: {
        '& $checked': {
          transform: 'translateX(20px)',
          color: `${primaryColors.main} !important`,
          '& input': {
            left: -20
          },
          '& .square': {
            fill: 'white'
          },
          '& + $bar': {
            opacity: 1,
            backgroundColor: '#f4f4f4'
          }
        },
        '& $disabled': {
          '&$switchBase': {
            opacity: 0.5,
            '& + $bar': {
              backgroundColor: '#ddd',
              borderColor: '#ccc'
            },
            '& .square': {
              fill: 'white'
            }
          }
        },
        '& .icon': {
          transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
          position: 'relative',
          left: 0,
          width: 16,
          height: 16,
          borderRadius: 0
        },
        '& .square': {
          transition: 'fill 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms'
        },
        '&:hover, &:focus': {
          '& $disabled': {
            '&$switchBase': {
              opacity: 0.5,
              '& + $bar': {
                backgroundColor: '#ddd',
                borderColor: '#ccc'
              }
            }
          },
          '& $bar, & + $bar': {
            borderColor: '#606469'
          },
          '& .square': {
            fill: '#aaa'
          },
          '& $checked': {
            '& .square': {
              fill: '#eee'
            }
          }
        }
      },
      disabled: {},
      checked: {},
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
        transition: 'border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms'
      },
      switchBase: {
        color: primaryColors.main
      }
    },
    MuiTab: {
      root: {
        color: 'rgba(0, 0, 0, 0.54)',
        minWidth: 50,
        textTransform: 'inherit',
        padding: '6px 16px',
        position: 'relative',
        overflow: 'hidden',
        maxWidth: '264',
        boxSizing: 'border-box',
        minHeight: 48,
        flexShrink: 0,
        display: 'inline-flex',
        alignItems: 'center',
        verticalAlign: 'middle',
        justifyContent: 'center',
        appearance: 'none',
        margin: 1,
        [breakpoints.up('md')]: {
          minWidth: 75
        },
        '&$selected, &$selected:hover': {
          fontFamily: 'LatoWebBold',
          color: primaryColors.headline
        },
        '&:hover': {
          color: primaryColors.main
        }
      },
      label: {
        [breakpoints.up('md')]: {
          fontSize: '1rem'
        }
      },
      labelContainer: {
        paddingLeft: 0,
        paddingRight: 0,
        [breakpoints.up('md')]: {
          paddingLeft: 0,
          paddingRight: 0
        }
      },
      textColorPrimary: {
        '&$selected': {
          color: '#32363C'
        }
      },
      selected: {}
    },
    MuiTable: {
      root: {
        borderCollapse: 'initial'
      }
    },
    MuiTableCell: {
      root: {
        padding: '10px',
        borderBottom: `2px solid ${primaryColors.divider}`,
        '&:last-child': {
          paddingRight: 10
        }
      },
      head: {
        fontSize: '.9rem'
      },
      body: {
        fontSize: '.9rem'
      }
    },
    MuiTabs: {
      root: {
        margin: '16px 0',
        boxShadow: 'inset 0 -1px 0 #C5C6C8'
      },
      fixed: {
        overflowX: 'auto'
      },
      flexContainer: {
        position: 'relative',
        '& $scrollButtons:first-child': {
          position: 'absolute',
          bottom: 6,
          zIndex: 2,
          '& svg': {
            backgroundColor: 'rgba(232, 232, 232, .9)',
            height: 39,
            width: 38,
            padding: '7px 4px',
            borderRadius: '50%'
          }
        }
      },
      scrollButtons: {
        flex: '0 0 40px'
      },
      indicator: {
        primary: {
          backgroundColor: primaryColors.main
        },
        secondary: {
          backgroundColor: primaryColors.main
        }
      }
    },
    MuiTableRow: {
      root: {
        backgroundColor: primaryColors.white,
        backfaceVisibility: 'hidden',
        position: 'relative',
        zIndex: 1,
        '&:before': {
          borderLeftColor: 'white'
        },
        '&:hover': {
          '&$hover': {
            backgroundColor: '#fbfbfb',
            '&:before': {
              backgroundColor: primaryColors.main
            }
          }
        }
      },
      head: {
        height: 'auto',
        backgroundColor: '#fbfbfb',
        '&:before': {
          borderLeftColor: '#fbfbfb'
        }
      },
      hover: {
        cursor: 'pointer',
        '& a.secondaryLink': {
          color: primaryColors.main,
          '&:hover': {
            textDecoration: 'underline'
          }
        }
      }
    },
    MuiTableSortLabel: {
      root: {
        fontSize: '.9rem',
        transition: 'color 225ms ease-in-out',
        '&:hover': {
          color: primaryColors.main
        },
        '&:focus': {
          outline: '1px dotted #999'
        }
      },
      active: {
        color: primaryColors.main,
        '&:hover': {
          color: primaryColors.main
        }
      },
      icon: {
        opacity: 1,
        marginTop: 2
      }
    },
    MuiTooltip: {
      popper: {
        opacity: 1
      },
      tooltip: {
        borderRadius: 0,
        maxWidth: 200,
        backgroundColor: 'white',
        boxShadow: '0 0 5px #bbb',
        color: '#606469',
        textAlign: 'left',
        [breakpoints.up('sm')]: {
          padding: '8px 10px',
          fontSize: '.9rem'
        }
      }
    }
  }
};

export default (options: ThemeOptions) =>
  createMuiTheme(mergeDeepRight(themeDefaults, options));
