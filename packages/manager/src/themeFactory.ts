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
    graphs: any;
    visually: any;
    font?: any;
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
    graphs?: any;
    visually?: any;
    font?: any;
    animateCircleIcon?: any;
    notificationList?: any;
    status?: any;
  }
}

const breakpoints = createBreakpoints({});

const primaryColors = {
  main: '#3683dc',
  light: '#4d99f1',
  dark: '#2466b3',
  text: '#606469',
  headline: '#32363c',
  divider: '#f4f4f4',
  offBlack: '#444',
  white: '#fff'
};

const primaryFonts = {
  normal: '"LatoWeb", sans-serif',
  bold: '"LatoWebBold", sans-serif'
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

const visuallyVisible = {
  /* https://snook.ca/archives/html_and_css/hiding-content-for-accessibility */
  position: 'relative',
  height: 'auto',
  width: 'auto',
  overflow: 'initial',
  clip: 'none'
};

const visuallyHidden = {
  /* https://snook.ca/archives/html_and_css/hiding-content-for-accessibility */
  position: 'absolute !important',
  height: 1,
  width: 1,
  overflow: 'hidden',
  clip: 'rect(1px, 1px, 1px, 1px)'
};

export const COMPACT_SPACING_UNIT = 4;
export const NORMAL_SPACING_UNIT = 8;

export interface ThemeOverrides {
  spacingOverride: typeof COMPACT_SPACING_UNIT | typeof NORMAL_SPACING_UNIT;
}

type ThemeDefaults = (options: ThemeOverrides) => ThemeOptions;

const themeDefaults: ThemeDefaults = ({ spacingOverride: spacingUnit }) => {
  return {
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
    spacing: spacingUnit,
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
      navy: '#32363c',
      lightBlue: '#d7e3ef',
      white: '#fff',
      pureWhite: '#fff',
      tableHeader: '#fbfbfb',
      primaryNavActive: '#f4f4f4',
      primaryNavActiveBG: '#272b31',
      primaryNavBorder: '#f4f4f4',
      primaryNavPaper: '#32363c',
      topMenu: '#fff'
    },
    color: {
      headline: primaryColors.headline,
      red: '#ca0813',
      green: '#00b159',
      yellow: '#fecf2f',
      border1: '#abadaf',
      border2: '#c5c6c8',
      border3: '#eee',
      borderPagination: '#ccc',
      grey1: '#abadaf',
      grey2: '#e7e7e7',
      grey3: '#ccc',
      grey4: '#8C929D',
      grey5: '#f5f5f5',
      white: '#fff',
      black: '#222',
      blue: primaryColors.main,
      offBlack: primaryColors.offBlack,
      boxShadow: '#ddd',
      boxShadowDark: '#aaa',
      focusBorder: '#999',
      absWhite: '#fff',
      blueDTwhite: '#3683dc',
      selectDropDowns: primaryColors.main,
      borderRow: 'white',
      tableHeaderText: 'rgba(0, 0, 0, 0.54)',
      toggleActive: '#606469',
      diskSpaceBorder: '#f4f4f4',
      drawerBackdrop: 'rgba(255, 255, 255, 0.5)',
      label: '#555',
      disabledText: '#c9cacb',
      kubeLabel: '#272b31',
      primaryNavText: '#c9cacb',
      graphBlue: 'rgba(54, 131, 220, .5)',
      graphYellow: 'rgba(255, 209, 0, .5)',
      graphPurple: 'rgba(204, 1, 153, .5)',
      graphGreen: 'rgba(1, 177, 89, .5)'
    },
    graphs: {
      blue: 'rgba(54, 131, 220, .5)',
      blueBorder: 'rgba(54, 131, 220, 1)',
      green: 'rgba(1, 177, 89, .5)',
      greenBorder: 'rgba(1, 177, 89, 1)',
      purple: 'rgba(204, 1, 153, .5)',
      purpleBorder: 'rgba(204, 1, 153, 1)',
      yellow: 'rgba(255, 209, 0, .5)',
      yellowBorder: 'rgba(255, 209, 0, 1)'
    },
    font: {
      normal: primaryFonts.normal,
      bold: spacingUnit === 4 ? primaryFonts.normal : primaryFonts.bold
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
        success: '#d7e3ef',
        successDark: '#3682dd',
        warning: '#fdf4da',
        warningDark: '#ffd002',
        error: '#f8dedf',
        errorDark: '#cd2227'
      }
    },
    typography: {
      useNextVariants: true,
      fontFamily: primaryFonts.normal,
      fontSize: 16,
      h1: {
        color: primaryColors.headline,
        fontSize: '1.25rem',
        lineHeight: '1.75rem',
        fontFamily: primaryFonts.bold,
        [breakpoints.up('lg')]: {
          fontSize: '1.5rem',
          lineHeight: '1.875rem'
        }
      },
      h2: {
        color: primaryColors.headline,
        fontSize: '1.125rem',
        fontFamily: spacingUnit === 4 ? primaryFonts.normal : primaryFonts.bold,
        lineHeight: '1.5rem'
      },
      h3: {
        color: primaryColors.headline,
        fontSize: '1rem',
        fontFamily: spacingUnit === 4 ? primaryFonts.normal : primaryFonts.bold,
        lineHeight: '1.4rem'
      },
      body1: {
        fontSize: '0.875rem',
        lineHeight: '1rem',
        color: primaryColors.text
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: '1.2rem',
        color: primaryColors.text
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
      },
      subtitle1: {
        fontSize: '1.075rem',
        lineHeight: '1.5rem',
        color: primaryColors.text
      }
    },
    visually: {
      visible: visuallyVisible,
      hidden: visuallyHidden
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
          lineHeight: 1,
          fontFamily:
            spacingUnit === 4 ? primaryFonts.normal : primaryFonts.bold,
          color: primaryColors.main,
          padding: `${spacingUnit * 2}px ${spacingUnit * 3 +
            spacingUnit / 2}px ${spacingUnit * 2}px`,
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
          padding: `${spacingUnit * 2}px ${spacingUnit * 3 +
            spacingUnit / 2}px ${spacingUnit * 2}px`,
          '&:hover': {
            color: primaryColors.light
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
          padding: `${spacingUnit * 2 - 1}px ${spacingUnit * 3 +
            spacingUnit / 2}px ${spacingUnit * 2 - 1}px`,
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
            borderColor: '#c9cacb',
            backgroundColor: 'transparent',
            color: '#c9cacb'
          },
          '&.cancel': {
            borderColor: 'transparent',
            '&:hover, &:focus': {
              borderColor: primaryColors.light,
              backgroundColor: 'transparent'
            }
          },
          '&.destructive': {
            borderColor: '#c44742',
            color: '#c44742',
            '&:hover, &:focus': {
              color: '#df6560',
              borderColor: '#df6560',
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: 'inherit'
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
          boxShadow: '0 0 5px #bbb',
          [breakpoints.down('sm')]: {
            maxWidth: '100% !important',
            maxHeight: 'calc(100% - 48px)',
            margin: 24
          }
        },
        paperScrollPaper: {
          maxHeight: 'calc(100% - 48px)'
        }
      },
      MuiDialogActions: {
        root: {
          margin: 0,
          padding: spacingUnit * 3,
          justifyContent: 'flex-start',
          '& .actionPanel': {
            padding: 0
          }
        }
      },
      MuiDialogContent: {
        root: {
          padding: `${spacingUnit}px ${spacingUnit * 3}px`
        }
      },
      MuiDialogTitle: {
        root: {
          borderBottom: '1px solid #eee',
          marginBottom: spacingUnit * 2 + spacingUnit / 2,
          padding: `${spacingUnit * 2}px ${spacingUnit * 3}px`,
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
            paddingLeft: spacingUnit * 2,
            paddingRight: spacingUnit * 2
          },
          '& table': {
            border: `1px solid ${primaryColors.divider}`,
            borderBottom: 0
          }
        }
      },
      MuiExpansionPanelDetails: {
        root: {
          padding: spacingUnit * 2,
          backgroundColor: 'white'
        }
      },
      MuiExpansionPanelSummary: {
        root: {
          '&$focused': {
            backgroundColor: '#fbfbfb'
          },
          padding: `0 ${spacingUnit * 2 + 2}px`,
          backgroundColor: '#fbfbfb',
          justifyContent: 'flex-start',
          minHeight: spacingUnit * 6,
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
            minHeight: spacingUnit * 6,
            margin: 0
          }
        },
        content: {
          flexGrow: 0,
          order: 2,
          margin: `${spacingUnit + spacingUnit / 2}px 0`,
          '&$expanded': {
            margin: `${spacingUnit + spacingUnit / 2}px 0`
          }
        },
        expanded: {},
        expandIcon: {
          display: 'flex',
          order: 1,
          top: 0,
          right: 0,
          transform: 'none',
          color: primaryColors.main,
          position: 'relative',
          marginLeft: -spacingUnit * 2,
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
          marginTop: spacingUnit * 2,
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
          marginLeft: -(spacingUnit + 3)
        },
        label: {
          color: primaryColors.text
        }
      },
      MuiFormGroup: {
        root: {
          '&[role="radiogroup"]': {
            marginTop: spacingUnit,
            marginBottom: spacingUnit * 2
          }
        }
      },
      MuiFormLabel: {
        root: {
          color: '#555',
          fontFamily:
            spacingUnit === 4 ? primaryFonts.normal : primaryFonts.bold,
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
          maxWidth: 415,
          fontSize: '0.875rem',
          '&$error': {
            color: '#ca0813'
          }
        }
      },
      MuiIconButton: {
        root: {
          padding: spacingUnit + spacingUnit / 2,
          color: primaryColors.main,
          '&:hover': {
            color: primaryColors.light,
            backgroundColor: 'transparent'
          }
        },
        edgeEnd: {
          marginRight: 0
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
            boxShadow: '0 0 2px 1px #e1edfa',
            '& .select-option-icon': {
              paddingLeft: `30px !important`
            }
          },
          '&$error': {
            borderColor: '#ca0813'
          },
          maxWidth: 415,
          border: '1px solid #ccc',
          alignItems: 'center',
          transition: 'border-color 225ms ease-in-out',
          lineHeight: 1,
          minHeight: spacingUnit * 6,
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
              color: '#5e9aea'
            }
          },
          '&.affirmative': {
            borderColor: '#00b159'
          }
        },
        inputMultiline: {
          minHeight: 125,
          padding: `${spacingUnit + 1}px ${spacingUnit * 2 -
            spacingUnit / 2}px`,
          lineHeight: 1.4
        },
        focused: {},
        error: {},
        disabled: {},
        input: {
          padding: `${spacingUnit * 2 - spacingUnit / 2}px ${spacingUnit * 2 -
            spacingUnit / 2}px ${spacingUnit * 2 - spacingUnit / 2 + 1}px`,
          fontSize: '.9rem',
          boxSizing: 'border-box'
        },
        formControl: {
          'label + &': {
            marginTop: 0
          }
        }
      },
      MuiInputBase: {
        input: {
          height: 'auto'
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
          marginRight: spacingUnit + 2
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
      MuiLinearProgress: {
        colorPrimary: {
          backgroundColor: '#b7d6f9'
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
            fontFamily: primaryFonts.bold,
            fontSize: '1rem',
            color: primaryColors.text
          }
        },
        disabled: {},
        selected: {}
      },
      MuiListItemText: {
        root: {
          marginTop: 0,
          marginBottom: 0
        },
        secondary: {
          marginTop: spacingUnit / 2,
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
            padding: spacingUnit / 2,
            '& li': {
              paddingLeft: spacingUnit + 2,
              paddingRight: spacingUnit + 2
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
          fontFamily: primaryFonts.normal,
          fontSize: '.9rem',
          whiteSpace: 'initial',
          textOverflow: 'initial',
          color: primaryColors.text,
          minHeight: 'auto',
          paddingTop: spacingUnit * 2,
          paddingBottom: spacingUnit * 2,
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
        root: {},
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
      MuiSelect: {
        selectMenu: {
          '&$disabled': {
            '&+ input + $icon': {
              opacity: 0.5
            }
          },
          padding: `${spacingUnit * 2}px ${spacingUnit * 4}px ${spacingUnit *
            2}px ${spacingUnit + 4}px`,
          color: primaryColors.text,
          backgroundColor: '#fff',
          lineHeight: 1,
          minHeight: spacingUnit * 6 - 2,
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
      MuiSkeleton: {
        text: {
          borderRadius: 0
        }
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
      MuiSvgIcon: {
        root: {
          fontSize: 24
        }
      },
      MuiSwitch: {
        root: {
          width: 68,
          height: 48,
          '& $checked': {
            // color: `${primaryColors.main} !important`,
            '& input': {
              left: -20
            },
            '& .square': {
              fill: 'white'
            },
            '&$switchBase': {
              '& + $track': {
                opacity: 1
              }
            }
          },

          '& $disabled': {
            '&$switchBase': {
              '& + $track': {
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
                '& + $track': {
                  backgroundColor: '#ddd',
                  borderColor: '#ccc'
                }
              }
            },
            '& $track, & + $track': {
              borderColor: '#606469'
            },
            '& .square': {
              fill: '#aaa'
            },
            '& $checked': {
              '& .square': {
                fill: '#eee'
              },
              '& + $track': {
                opacity: 1
              }
            }
          }
        },
        disabled: {},
        checked: {},
        track: {
          top: 12,
          left: 12,
          marginLeft: 0,
          marginTop: 0,
          width: 42,
          height: 22,
          borderRadius: 0,
          backgroundColor: '#f4f4f4',
          border: '1px solid #999',
          boxSizing: 'content-box',
          transition: 'border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms'
        },
        switchBase: {
          color: primaryColors.main,
          padding: 16,
          '&$checked': {
            transform: 'translateX(20px)'
          }
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
          minHeight: spacingUnit * 6,
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          verticalAlign: 'middle',
          justifyContent: 'center',
          appearance: 'none',
          margin: 1,
          lineHeight: 1.3,
          [breakpoints.up('md')]: {
            minWidth: 75
          },
          '&$selected, &$selected:hover': {
            fontFamily: primaryFonts.bold,
            color: primaryColors.headline
          },
          '&:hover': {
            color: primaryColors.main
          }
        },
        // label: {
        //   [breakpoints.up('md')]: {
        //     fontSize: '1rem'
        //   }
        // },
        wrapper: {
          padding: `${spacingUnit - 2}px 0`,
          [breakpoints.up('md')]: {
            padding: `${spacingUnit - 2}px 0`
          }
        },
        textColorPrimary: {
          '&$selected': {
            color: '#32363c'
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
          padding: spacingUnit + 2,
          borderBottom: `2px solid ${primaryColors.divider}`,
          '&:last-child': {
            paddingRight: spacingUnit + 2
          },
          '& .action-menu': {
            [breakpoints.down('sm')]: {
              width: '100%'
            }
          }
        },
        head: {
          fontSize: '.9rem',
          lineHeight: 1.1
        },
        body: {
          fontSize: '.9rem'
        }
      },
      MuiTabs: {
        root: {
          margin: `${spacingUnit * 2}px 0`,
          boxShadow: 'inset 0 -1px 0 #c5c6c8',
          minHeight: spacingUnit * 6,
          position: 'relative',
          '& $scrollButtons:first-child': {
            position: 'absolute',
            bottom: 6,
            zIndex: 2,
            left: 0,
            '& svg': {
              backgroundColor: 'rgba(232, 232, 232, .9)',
              height: 39,
              width: 38,
              padding: '7px 4px',
              borderRadius: '50%'
            }
          },
          '& $scrollButtons:last-child': {
            '& svg': {
              backgroundColor: 'rgba(232, 232, 232, .9)',
              height: 39,
              width: 38,
              padding: '7px 4px',
              borderRadius: '50%'
            }
          }
        },
        fixed: {
          overflowX: 'auto'
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
          height: spacingUnit * 6,
          '&:before': {
            borderLeftColor: 'white'
          },
          '&:hover, &:focus': {
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
          '& a': {
            color: primaryColors.text
          },
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
          lineHeight: '1.1rem',
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
        },
        iconDirectionDesc: {
          transform: 'rotate(180deg)'
        },
        iconDirectionAsc: {
          transform: 'rotate(0deg)'
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
      },
      MuiTypography: {
        button: {
          textTransform: 'inherit',
          borderRadius: 0,
          fontSize: '1rem',
          lineHeight: 1,
          fontFamily:
            spacingUnit === 4 ? primaryFonts.normal : primaryFonts.bold,
          color: '#fff',
          backgroundColor: primaryColors.main,
          padding: `${spacingUnit * 2}px ${spacingUnit * 3 +
            spacingUnit / 2}px ${spacingUnit * 2}px`,
          maxHeight: 48,
          cursor: 'pointer',
          '&:hover, &:focus': {
            backgroundColor: primaryColors.light
          },
          '&:active': {
            backgroundColor: primaryColors.dark
          },
          '&$colorSecondary': {
            backgroundColor: 'transparent',
            color: primaryColors.main,
            border: `1px solid ${primaryColors.main}`,
            padding: `${spacingUnit * 2 - 1}px ${spacingUnit * 3 +
              spacingUnit / 2}px ${spacingUnit * 2 - 1}px`,
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
            }
          }
        }
      }
    }
  };
};

export default (options: ThemeOptions & ThemeOverrides) =>
  createMuiTheme(
    mergeDeepRight(
      themeDefaults({
        spacingOverride: options.spacingOverride
      }),
      options
    )
  );
