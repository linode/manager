import createBreakpoints from '@material-ui/core/styles/createBreakpoints';
import createMuiTheme, { ThemeOptions } from '@material-ui/core/styles/createMuiTheme';
import { mergeDeepRight } from 'ramda';
/**
 * Augmenting Palette and Palette Options
 * @todo Move status out of the palette and add it as a custom ThemeOption.
 */

declare module '@material-ui/core/styles/createPalette' {

  interface Palette {
    status: {
      success: string,
      successDark: string,
      warning: string,
      warningDark: string,
      error: string,
      errorDark: string,
    };
  }

  interface PaletteOptions {
    status?: {
      success?: string,
      successDark?: string,
      warning?: string,
      warningDark?: string,
      error?: string,
      errorDark?: string,
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
    bg: any;
    color: any;
    notificationList: any;
    status: any;
  }

  interface ThemeOptions {
    name?: string;
    '@keyframes rotate'?: any;
    bg?: any;
    color?: any;
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
}

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
    'none',
  ],
  '@keyframes rotate': {
    from: {
      transform: 'rotate(0deg)',
    },
    to: {
      transform: 'rotate(360deg)',
    },
  },
  bg: {
    main: '#f4f4f4',
    offWhite: '#fbfbfb',
    offWhiteDT: '#fbfbfb', // better handing for dark theme
    navy: '#32363C',
    lightBlue: '#D7E3EF',
    white: '#fff',
    pureWhite: '#fff',
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
    boxShadow: '#ddd',
    focusBorder: '#999',
    absWhite: '#fff',
    blueDTwhite: '#3683DC',
    borderRow: 'white',
  },
  notificationList: {
    padding: '16px 32px 16px 23px',
    borderBottom: '1px solid #fbfbfb',
    transition: 'background-color 225ms ease-in-out',
    '&:hover': {
      backgroundColor: '#f4f4f4',
    },
  },
  palette: {
    divider: primaryColors.divider,
    primary: primaryColors,
    text: {
      primary: primaryColors.text,
    },
    status: {
      success: '#d7e3EF',
      successDark: '#3682dd',
      warning: '#fdf4da',
      warningDark: '#ffd002',
      error: '#f8dedf',
      errorDark: '#cd2227',
    },
  },
  typography: {
    fontFamily: '"Lato", sans-serif',
    fontSize: 16,
    headline: {
      color: primaryColors.headline,
      fontSize: '1.5rem',
      fontWeight: 700,
    },
    title: {
      color: primaryColors.headline,
      fontSize: '1.125rem',
      fontWeight: 700,
      lineHeight: '1.35417em',
    },
    subheading: {
      color: primaryColors.headline,
      fontSize: '1rem',
      fontWeight: 700,
      lineHeight: '1.2em',
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '.78rem',
      lineHeight: '1.3em',
    },
    caption: {
      fontSize: '.9rem',
      lineHeight: '1.3em',
      color: primaryColors.text,
    },
    display2: {
      color: primaryColors.text,
    },
  },
  overrides: {
    MuiAppBar: {
      colorDefault: {
        backgroundColor: 'inherit',
      },
    },
    MuiBackdrop: {
      root: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
      },
    },
    MuiButton: {
      root: {
        textTransform: 'inherit',
        borderRadius: 0,
        fontSize: '1rem',
        fontWeight: 700,
        color: primaryColors.main,
        padding: '12px 28px 14px',
        '&:hover': {
          backgroundColor: '#fff',
        },
        '&:focus': {
          backgroundColor: 'transparent',
        },
        '&[aria-expanded="true"]': {
          backgroundColor: primaryColors.dark,
        },
        '&$disabled': {
          color: '#bbb',
        },
      },
      flat: {
        '&.cancel:hover': {
          backgroundColor: 'transparent',
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
          color: 'white',
        },
        '&.cancel': {
          '&:hover, &:focus': {
            borderColor: '#222',
          },
        },
      },
      raisedSecondary: {
        backgroundColor: 'transparent',
        color: primaryColors.main,
        border: `1px solid ${primaryColors.main}`,
        padding: '11px 26px 13px',
        transition: 'border 225ms ease-in-out, color 225ms ease-in-out',
        '&:hover, &:focus': {
          backgroundColor: 'transparent',
          color: primaryColors.light,
          borderColor: primaryColors.light,
        },
        '&:active': {
          backgroundColor: 'transparent',
          color: primaryColors.dark,
          borderColor: primaryColors.dark,
        },
        '&$disabled': {
          borderColor: '#C9CACB',
          backgroundColor: 'transparent',
          color: '#C9CACB',
        },
        '&.cancel': {
          borderColor: 'transparent',
          '&:hover, &:focus': {
            borderColor: primaryColors.light,
            backgroundColor: 'transparent',
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
        '&.loading': {
          minWidth: 100,
          '& svg': {
            width: 22,
            height: 22,
            animation: 'rotate 2s linear infinite',
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
        backgroundColor: '#fbfbfb',
      },
    },
    MuiChip: {
      root: {
        backgroundColor: '#f4f4f4',
        height: 24,
        borderRadius: 4,
        color: '#555',
        '&:hover': {
          '& $deleteIcon': {
            color: primaryColors.text,
          },
        },
      },
      label: {
        paddingLeft: 4,
        paddingRight: 4,
        fontSize: '.9rem',
        position: 'relative',
      },
      deleteIcon: {
        color: '#aaa',
        width: 20,
        height: 20,
        marginLeft: 2,
        marginRight: 2,
      },
    },
    MuiCircularProgress: {
      circle: {
        strokeLinecap: 'inherit',
      },
    },
    MuiCollapse: {
      container: {
        width: '100%',
      },
    },
    MuiDialog: {
      paper: {
        boxShadow: '0 0 5px #bbb',
      },
    },
    MuiDialogActions: {
      root: {
        margin: 0,
        padding: '0 24px 24px 24px',
        justifyContent: 'flex-start',
        '& .actionPanel': {
          padding: 0,
        },
      },
      action: {
        margin: 0,
      },
    },
    MuiDialogTitle: {
      root: {
        borderBottom: '1px solid #eee',
        marginBottom: 20,
        '& h2': {
          color: primaryColors.headline,
        },
      },
    },
    MuiDrawer: {
      paper: {
        boxShadow: '0 0 5px #bbb',
        /** @todo This is breaking typing. */
        // overflowY: 'overlay',
        display: 'block',
        fallbacks: {
          overflowY: 'auto',
        },
      },
    },
    MuiExpansionPanel: {
      root: {
        '& .actionPanel': {
          paddingLeft: 16,
          paddingRight: 16,
        },
        '& table': {
          border: `1px solid ${primaryColors.divider}`,
          borderBottom: 0,
        },
      },
    },
    MuiExpansionPanelDetails: {
      root: {
        padding: 16,
        backgroundColor: 'white',
      },
    },
    MuiExpansionPanelSummary: {
      root: {
        padding: '0 18px',
        backgroundColor: '#fbfbfb',
        justifyContent: 'flex-start',
        '& h3': {
          transition: 'color 400ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
        },
        '&:hover': {
          '& h3': {
            color: primaryColors.light,
          },
          '& $expandIcon': {
            '& svg': {
              fill: primaryColors.light,
              stroke: 'white',
            },
          },
        },
        '&:focus': {
          outline: '1px dotted #999',
          zIndex: 2,
        },
        '&$expanded': {
          minHeight: 48,
        },
      },
      content: {
        flexGrow: 0,
        order: 2,
        '&$expanded': {
          margin: 0,
        },
      },
      expanded: {
        margin: 0,
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
          height: 22,
        },
        '& .border': {
          stroke: `${primaryColors.light} !important`,
        },
        '&$expanded': {
          transform: 'none',
        },
      },
      focused: {
        backgroundColor: '#fbfbfb',
      },
    },
    MuiFormControl: {
      root: {
        marginTop: 16,
        minWidth: 120,
        '&.copy > div': {
          backgroundColor: '#f4f4f4',
        },
        [breakpoints.down('xs')]: {
          width: '100%',
        }
      },
    },
    MuiFormControlLabel: {
      root: {
        marginLeft: -11,
      },
    },
    MuiFormLabel: {
      root: {
        color: '#555',
        fontWeight: 700,
        fontSize: '.9rem',
        marginBottom: 2,
        '&$focused': {
          color: '#555',
        },
        '&$error': {
          color: '#555',
        },
      },
    },
    MuiFormHelperText: {
      root: {
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
          backgroundColor: 'transparent',
        },
      },
    },
    MuiInput: {
      root: {
        maxWidth: 415,
        border: '1px solid #ccc',
        alignItems: 'center',
        transition: 'border-color 225ms ease-in-out',
        lineHeight: 1,
        minHeight: 48,
        color: primaryColors.text,
        boxSizing: 'border-box',
        backgroundColor: 'white',
        [breakpoints.down('xs')]: {
          maxWidth: '100%',
          width: '100%',
        },
        '& svg': {
          fontSize: 18,
          color: primaryColors.main,
          '&:hover': {
            color: '#5E9AEA',
          },
        },
        '&.affirmative': {
          borderColor: '#00B159',
        },
      },
      inputMultiline: {
        minHeight: 125,
        padding: '5px 12px',
        lineHeight: 1.4,
      },
      focused: {
        borderColor: '#999',
      },
      error: {
        borderColor: '#CA0813',
      },
      disabled: {
        borderColor: '#ccc',
        color: '#606469',
        opacity: .5,
      },
      input: {
        padding: '12px 12px 13px',
        fontSize: '.9rem',
        boxSizing: 'border-box',
      },
      inputType: {
        height: 'auto',
      },
      formControl: {
        'label + &': {
          marginTop: 0,
        },
      },
    },
    MuiInputAdornment: {
      root: {
        fontSize: '.9rem',
        color: '#606469',
        whiteSpace: 'nowrap',
        '& p': {
          fontSize: '.9rem',
          color: '#606469',
        },
      },
      positionEnd: {
        marginRight: 10,
      },
    },
    MuiInputLabel: {
      formControl: {
        position: 'relative',
      },
      shrink: {
        transform: 'none',
      },
    },
    MuiList: {
      padding: {
        paddingTop: 0,
        paddingBottom: 0,
      },
      root: {
        '&.reset': {
          padding: 'inherit',
          margin: 'inherit',
          listStyle: 'initial',
          '& li': {
            display: 'list-item',
            padding: 0,
            listStyleType: 'initial',
          },
        },
      },
    },
    MuiListItem: {
      root: {
        color: primaryColors.text,
        '&.selectHeader': {
          opacity: 1,
          fontWeight: 700,
          fontSize: '1rem',
          color: primaryColors.text,
        },
      },
      disabled: {
        opacity: .5,
      },
    },
    MuiListItemText: {
      secondary: {
        marginTop: 4,
        lineHeight: '1.2em',
      },
    },
    MuiMenu: {
      paper: {
        '&.selectMenuDropdown': {
          boxShadow: 'none',
          position: 'absolute',
          boxSizing: 'content-box',
          border: '1px solid #999',
          margin: '0 0 0 -1px',
          outline: 0,
        },
        '& .selectMenuList': {
          maxHeight: 250,
          overflowY: 'auto',
          overflowX: 'hidden',
          boxSizing: 'content-box',
          '& li': {
            color: primaryColors.text,
            '&:hover, &:focus': {
              color: 'white',
            },
          },
          [breakpoints.down('xs')]: {
            minWidth: 200,
          },
        },
      },
    },
    MuiMenuItem: {
      root: {
        height: 'auto',
        fontWeight: 400,
        fontSize: '.9rem',
        whiteSpace: 'initial',
        textOverflow: 'initial',
        color: primaryColors.main,
        transition: `${'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), '}
          ${'color .2s cubic-bezier(0.4, 0, 0.2, 1)'}`,
        '&:hover, &:focus': {
          backgroundColor: primaryColors.main,
          color: 'white',
        },
        '& em': {
          fontStyle: 'normal !important',
        },
      },
      selected: {
        backgroundColor: 'white !important',
        color: `${primaryColors.main} !important`,
        opacity: 1,
        '&:focus': {
          backgroundColor: '#f4f4f4 !important',
        },
      },
    },
    MuiPaper: {
      rounded: {
        borderRadius: 0,
      },
    },
    MuiPopover: {
      paper: {
        boxShadow: '0 0 5px #ddd',
        borderRadius: 0,
        minWidth: 200,
        [breakpoints.up('lg')]: {
          minWidth: 250,
        },
      },
    },
    MuiSelect: {
      selectMenu: {
        padding: '5px 32px 5px 16px',
        color: primaryColors.text,
        backgroundColor: '#fff',
        lineHeight: 2.3,
        minHeight: 46,
        minWidth: 150,
        '&:focus': {
          backgroundColor: '#fff',
        },
        '& em': {
          fontStyle: 'normal',
        },
      },
      select: {
        '&[aria-pressed="true"]': {
          '&+ input + $icon': {
            opacity: 1,
          },
        },
      },
      icon: {
        marginTop: -2,
        marginRight: 4,
        width: 28,
        height: 28,
        transition: 'color 225ms ease-in-out',
        color: '#aaa !important',
        opacity: .5,
      },
      disabled: {
        '&+ input + $icon': {
          opacity: '.5',
        },
      },
    },
    MuiSnackbarContent: {
      root: {
        boxShadow: '0 0 5px #ddd',
        color: '#606469',
        padding: 16,
        margin: 16,
        backgroundColor: 'transparent',
        [breakpoints.up('md')]: {
          margin: 0,
        },
      },
      message: {
        margin: '0 auto',
        width: '100%',
        padding: 0,
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
        color: '#C5C6C8',
        minWidth: 50,
        textTransform: 'inherit',
        fontWeight: 400,
        [breakpoints.up('md')]: {
          minWidth: 75,
        },
        '&$selected': {
          fontWeight: 700,
        },
        '&:hover': {
          color: primaryColors.main,
        },
      },
      label: {
        [breakpoints.up('md')]: {
          fontSize: '1rem',
        },
      },
      labelContainer: {
        paddingLeft: 9,
        paddingRight: 9,
        [breakpoints.up('md')]: {
          paddingLeft: 18,
          paddingRight: 18,
        },
      },
      textColorPrimary: {
        '&$selected': {
          color: '#32363C',
        },
      },
    },
    MuiTable: {
      root: {
        borderCollapse: 'initial',
      },
    },
    MuiTableCell: {
      root: {
        padding: '18px',
        borderBottom: `1px solid ${primaryColors.divider}`,
        '&:last-child': {
          paddingRight: 18,
        },
      },
      head: {
        fontSize: '.9rem',
      },
      body: {
        fontSize: '.9rem',
      },
    },
    MuiTabs: {
      root: {
        margin: '16px 0',
        boxShadow: 'inset 0 -1px 0 #C5C6C8',
      },
      fixed: {
        overflowX: 'auto',
      },
    },
    MuiTableRow: {
      root: {
        backfaceVisibility: 'hidden',
        position: 'relative',
        zIndex: 1,
        '&:before': {
          borderLeftColor: 'white',
        },
        '&:hover': {
          '&$hover': {
            backgroundColor: '#fbfbfb',
            '&:before': {
              borderLeftColor: primaryColors.main,
            },
          },
        },
      },
      head: {
        backgroundColor: '#fbfbfb',
        '&:before': {
          borderLeftColor: '#fbfbfb',
        },
      },
      hover: {
        cursor: 'pointer',
        '& a': {
          color: primaryColors.offBlack,
          fontWeight: 700,
        },
      },
    },
    MuiTooltip: {
      tooltip: {
        borderRadius: 0,
        maxWidth: 200,
        backgroundColor: 'white',
        boxShadow: '0 0 5px #bbb',
        color: '#606469',
        visibility: 'hidden',
        textAlign: 'left',
        width: 0,
        height: 0,
        [breakpoints.up('sm')]: {
          padding: '8px 10px',
          fontSize: '.9rem',
        },
        '&$open': {
          width: 'auto',
          height: 'auto',
          opacity: 1,
          visibility: 'visible',
        },
      },
    },
  },
};

export default (options: ThemeOptions) => createMuiTheme(mergeDeepRight(themeDefaults, options));
