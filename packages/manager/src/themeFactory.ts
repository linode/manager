import { mergeDeepRight } from 'ramda';
import createBreakpoints from 'src/components/core/styles/createBreakpoints';
import createMuiTheme, {
  ThemeOptions,
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
declare module '@material-ui/core/styles/createTheme' {
  interface Theme {
    name: string;
    '@keyframes rotate': any;
    '@keyframes dash': any;
    bg: any;
    textColors: any;
    borderColors: any;
    color: any;
    graphs: any;
    visually: any;
    font?: any;
    animateCircleIcon?: any;
    addCircleHoverEffect?: any;
    applyLinkStyles?: any;
    applyStatusPillStyles?: any;
    applyTableHeaderStyles?: any;

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
    addCircleHoverEffect?: any;
    notificationList?: any;
    status?: any;
  }
}

const breakpoints = createBreakpoints({});

const textColors = {
  linkActiveLight: '#2575d0',
  headlineStatic: '#32363c',
  tableHeader: '#888f91',
  tableStatic: '#606469',
  textAccessTable: '#606469',
};

const borderColors = {
  borderTypography: '#e3e5e8',
  borderTable: '#f4f5f6',
  divider: '#e3e5e8',
};

const primaryColors = {
  main: '#3683dc',
  light: '#4d99f1',
  dark: '#2466b3',
  text: '#606469',
  headline: '#32363c',
  divider: '#f4f4f4',
  white: '#fff',
};

const primaryFonts = {
  normal: '"LatoWeb", sans-serif',
  semiBold: '"LatoWebSemibold", sans-serif',
  bold: '"LatoWebBold", sans-serif',
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

const iconCircleHoverEffect = {
  '& .circle': {
    fill: primaryColors.main,
  },
  '& .insidePath *': {
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
  minWidth: 0,
  '&:hover': {
    color: primaryColors.main,
    backgroundColor: 'transparent',
    textDecoration: 'underline',
  },
};

// Used for styling status pills as seen on Linodes
const genericStatusPillStyle = {
  backgroundColor: 'transparent',
  color: textColors.tableStatic,
  fontFamily: primaryFonts.bold,
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
};

const genericTableHeaderStyle = {
  '&:hover': {
    cursor: 'pointer',
    '& span': {
      color: textColors.linkActiveLight,
    },
  },
};

const visuallyVisible = {
  /* https://snook.ca/archives/html_and_css/hiding-content-for-accessibility */
  position: 'relative',
  height: 'auto',
  width: 'auto',
  overflow: 'initial',
  clip: 'none',
};

const visuallyHidden = {
  /* https://snook.ca/archives/html_and_css/hiding-content-for-accessibility */
  position: 'absolute !important',
  height: 1,
  width: 1,
  overflow: 'hidden',
  clip: 'rect(1px, 1px, 1px, 1px)',
};

const graphTransparency = '0.7';

type ThemeDefaults = () => ThemeOptions;

const themeDefaults: ThemeDefaults = () => {
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
      'none',
    ],
    spacing: 8,
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
      app: '#f4f5f6',
      main: '#f4f4f4',
      offWhite: '#fbfbfb',
      lightBlue1: '#f0f7ff',
      lightBlue2: '#e5f1ff',
      white: '#fff',
      tableHeader: '#f9fafa',
      primaryNavPaper: '#3a3f46',
      mainContentBanner: '#33373d',
      bgPaper: '#ffffff',
      bgAccessRow: '#fafafa',
      bgAccessRowTransparentGradient: 'rgb(255, 255, 255, .001)',
    },
    color: {
      headline: primaryColors.headline,
      red: '#ca0813',
      orange: '#ffb31a',
      yellow: '#fecf2f',
      green: '#00b159',
      teal: '#17cf73',
      border2: '#c5c6c8',
      border3: '#eee',
      grey1: '#abadaf',
      grey2: '#e7e7e7',
      grey3: '#ccc',
      grey4: '#8C929D',
      grey5: '#f5f5f5',
      grey6: '#e3e5e8',
      grey7: '#e9eaef',
      grey8: '#dbdde1',
      grey9: '#f4f5f6',
      white: '#fff',
      black: '#222',
      offBlack: '#444',
      boxShadow: '#ddd',
      boxShadowDark: '#aaa',
      blueDTwhite: '#3683dc',
      tableHeaderText: 'rgba(0, 0, 0, 0.54)',
      drawerBackdrop: 'rgba(255, 255, 255, 0.5)',
      label: '#555',
      disabledText: '#c9cacb',
      tagButton: '#f1f7fd',
      tagIcon: '#7daee8',
    },
    textColors,
    borderColors,
    graphs: {
      load: `rgba(255, 220, 77, ${graphTransparency})`,
      requests: `rgba(34, 206, 182, ${graphTransparency})`,
      connections: {
        accepted: `rgba(91, 105, 139, ${graphTransparency})`,
        handled: `rgba(50, 59, 77, ${graphTransparency})`,
      },
      network: {
        outbound: `rgba(49, 206, 62, ${graphTransparency})`,
        inbound: `rgba(16, 162, 29, ${graphTransparency})`,
      },
      workers: {
        waiting: `rgba(133, 180, 255, ${graphTransparency})`,
        reading: `rgba(137, 161, 240, ${graphTransparency})`,
        writing: `rgba(32, 131, 75, ${graphTransparency})`,
        starting: `rgba(135, 170, 247, ${graphTransparency})`,
        sending: `rgba(139, 152, 233, ${graphTransparency})`,
        keepAlive: `rgba(141, 143, 225, ${graphTransparency})`,
        DNSLookup: `rgba(143, 133, 218, ${graphTransparency})`,
        closing: `rgba(145, 124, 211, ${graphTransparency})`,
        logging: `rgba(147, 115, 203, ${graphTransparency})`,
        finishing: `rgba(149, 106, 196, ${graphTransparency})`,
        cleanup: `rgba(152, 97, 189, ${graphTransparency})`,
      },
      cpu: {
        system: `rgba(2, 118, 253, ${graphTransparency})`,
        user: `rgba(81, 166, 245, ${graphTransparency})`,
        wait: `rgba(145, 199, 237, ${graphTransparency})`,
        percent: `rgba(54, 131, 220, ${graphTransparency})`,
      },
      memory: {
        swap: `rgba(238, 44, 44, ${graphTransparency})`,
        buffers: `rgba(142, 56, 142, ${graphTransparency})`,
        cache: `rgba(205, 150, 205, ${graphTransparency})`,
        used: `rgba(236, 200, 236, ${graphTransparency})`,
      },
      diskIO: {
        read: `rgba(255, 196, 105, ${graphTransparency})`,
        write: `rgba(255, 179, 77, ${graphTransparency})`,
        swap: `rgba(238, 44, 44, ${graphTransparency})`,
      },
      ram: `rgba(224, 131, 224, ${graphTransparency})`,
      space: `rgba(255, 99, 61, ${graphTransparency})`,
      inodes: `rgba(224, 138, 146, ${graphTransparency})`,
      queries: {
        select: `rgba(34, 192, 206, ${graphTransparency})`,
        insert: `rgba(26, 151, 162, ${graphTransparency})`,
        update: `rgba(19, 110, 118, ${graphTransparency})`,
        delete: `rgba(2, 54, 59, ${graphTransparency})`,
      },
      slowQueries: `rgba(255, 61, 61, ${graphTransparency})`,
      aborted: {
        connections: `rgba(255, 10, 10, ${graphTransparency})`,
        clients: `rgba(214, 0, 0, ${graphTransparency})`,
      },
      processCount: `rgba(113, 86, 245, ${graphTransparency})`,
      blue: `rgba(100, 173, 246, ${graphTransparency})`,
      green: `rgba(91, 215, 101, ${graphTransparency})`,
      orange: `rgba(255, 179, 77, ${graphTransparency})`,
      purple: `rgba(217, 176, 217, ${graphTransparency})`,
      red: `rgba(255, 99, 60, ${graphTransparency})`,
      yellow: `rgba(255, 220, 125, ${graphTransparency})`,
    },
    font: {
      normal: primaryFonts.normal,
      semiBold: primaryFonts.semiBold,
      bold: primaryFonts.bold,
    },
    animateCircleIcon: {
      ...iconCircleAnimation,
    },
    addCircleHoverEffect: {
      ...iconCircleHoverEffect,
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
        success: '#d7e3ef',
        successDark: '#3682dd',
        warning: '#fdf4da',
        warningDark: '#ffd002',
        error: '#f8dedf',
        errorDark: '#cd2227',
      },
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
          lineHeight: '1.875rem',
        },
      },
      h2: {
        color: primaryColors.headline,
        fontSize: '1.125rem',
        fontFamily: primaryFonts.bold,
        lineHeight: '1.5rem',
      },
      h3: {
        color: primaryColors.headline,
        fontSize: '1rem',
        fontFamily: primaryFonts.bold,
        lineHeight: '1.4rem',
      },
      body1: {
        fontSize: '0.875rem',
        lineHeight: '1.125rem',
        color: primaryColors.text,
      },
      caption: {
        fontSize: '0.625rem',
        lineHeight: '0.625rem',
        color: primaryColors.text,
      },
      subtitle1: {
        fontSize: '1.075rem',
        lineHeight: '1.5rem',
        color: primaryColors.text,
      },
    },
    visually: {
      visible: visuallyVisible,
      hidden: visuallyHidden,
    },
    overrides: {
      MuiCheckbox: {
        root: {
          color: '#ccc',
        },
      },
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
          border: 'none',
          borderRadius: 1,
          cursor: 'pointer',
          fontFamily: primaryFonts.bold,
          fontSize: '1rem',
          minHeight: 34,
          minWidth: 105,
          lineHeight: 1,
          textTransform: 'inherit',
          transition: 'none',
        },
        containedPrimary: {
          backgroundColor: primaryColors.main,
          color: '#fff',
          padding: '2px 20px',
          '&:hover, &:focus': {
            backgroundColor: '#226dc3',
          },
          '&:active': {
            backgroundColor: primaryColors.dark,
          },
          '&$disabled': {
            color: 'white',
          },
          '&.loading': {
            backgroundColor: primaryColors.text,
          },
        },
        containedSecondary: {
          backgroundColor: 'transparent',
          color: textColors.linkActiveLight,
          '&:hover, &:focus': {
            backgroundColor: 'transparent !important',
            color: textColors.linkActiveLight,
          },
          '&:active': {
            backgroundColor: 'transparent',
            borderColor: primaryColors.dark,
            color: primaryColors.dark,
          },
          '&$disabled': {
            backgroundColor: 'transparent',
            borderColor: '#c9cacb',
            color: '#c9cacb',
          },
          '&.loading': {
            color: primaryColors.text,
          },
        },
        outlined: {
          backgroundColor: 'transparent',
          border: `1px solid ${primaryColors.main}`,
          color: textColors.linkActiveLight,
          minHeight: 34,
          '&:hover, &:focus': {
            backgroundColor: '#f5f8ff !important',
            border: '1px solid #d7dfed',
            color: '#2575d0',
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
        content: {
          // This is necessary for text to ellipsis responsively without the need for a hard set width value that won't play well with flexbox.
          minWidth: 0,
        },
      },
      MuiChip: {
        root: {
          backgroundColor: '#E7E7E7',
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
            marginRight: 0,
          },
          '&:hover': {
            '& $deleteIcon': {
              color: primaryColors.white,
              '&:hover': {
                color: primaryColors.main,
                backgroundColor: primaryColors.white,
              },
            },
          },
          '&:focus': {
            outline: '1px dotted #999',
          },
        },
        clickable: {
          backgroundColor: '#e5f1ff',
          '&:hover': {
            backgroundColor: '#cce2ff',
          },
          '&:focus': {
            backgroundColor: '#cce2ff',
          },
        },
        sizeSmall: {
          height: 20,
          fontSize: '.65rem',
        },
        labelSmall: {
          paddingLeft: 4,
          paddingRight: 4,
        },
        outlined: {
          borderRadius: 1,
          backgroundColor: 'transparent',
        },
        label: {
          paddingLeft: 4,
          paddingRight: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: 'inherit',
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
            borderRadius: '50%',
          },
        },
      },
      MuiCircularProgress: {
        circle: {
          strokeLinecap: 'inherit',
        },
      },
      MuiCollapse: {
        root: {
          width: '100%',
        },
      },
      MuiDialog: {
        paper: {
          boxShadow: '0 0 5px #bbb',
          [breakpoints.down('sm')]: {
            maxWidth: '100% !important',
            maxHeight: 'calc(100% - 48px)',
            margin: 24,
          },
        },
        paperScrollPaper: {
          maxHeight: 'calc(100% - 48px)',
        },
      },
      MuiDialogActions: {
        root: {
          margin: 0,
          padding: 24,
          justifyContent: 'flex-start',
          '& .actionPanel': {
            padding: 0,
          },
        },
      },
      MuiDialogContent: {
        root: {
          padding: '8px 24px',
        },
      },
      MuiDialogTitle: {
        root: {
          borderBottom: '1px solid #eee',
          marginBottom: 20,
          padding: '16px 24px',
          '& h2': {
            color: primaryColors.headline,
            lineHeight: 1.2,
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
      MuiAccordion: {
        root: {
          flexBasis: '100%',
          width: '100%',
          '& .actionPanel': {
            paddingBottom: 12,
            paddingLeft: 16,
          },
        },
      },
      MuiAccordionSummary: {
        root: {
          justifyContent: 'space-between',
          backgroundColor: 'transparent',
          paddingRight: 2,
          paddingLeft: 16,
          '&:hover': {
            '& h3': {
              color: primaryColors.light,
            },
            '& svg': {
              fill: '#2575d0',
              stroke: '#2575d0',
            },
          },
          '&$expanded': {
            margin: 0,
            minHeight: 48,
            '& .caret': {
              transform: 'rotate(0deg)',
            },
          },
          '& h3': {
            transition: 'color 400ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
          },
        },
        content: {
          '&$expanded': {
            margin: '12px 0',
          },
        },
        expandIcon: {
          '&$expanded': {
            transform: 'rotate(180deg)',
          },
          '& svg': {
            fill: '#2575d0',
            stroke: '#2575d0',
            height: 22,
            width: 22,
            transition: `${'stroke 400ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, '}
            ${'fill 400ms cubic-bezier(0.4, 0, 0.2, 1) 0ms'}`,
          },
        },
      },
      MuiAccordionDetails: {
        root: {
          backgroundColor: 'transparent',
          padding: 16,
          paddingTop: 0,
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
          },
        },
      },
      MuiFormControlLabel: {
        root: {
          marginLeft: -11,
        },
        label: {
          color: primaryColors.text,
        },
      },
      MuiFormGroup: {
        root: {
          '&[role="radiogroup"]': {
            marginTop: 8,
            marginBottom: 16,
          },
        },
      },
      MuiFormLabel: {
        root: {
          color: '#555',
          fontFamily: primaryFonts.bold,
          fontSize: '.875rem',
          marginBottom: 8,
          '&$focused': {
            color: '#555',
          },
          '&$error': {
            color: '#555',
          },
          '&$disabled': {
            color: '#555',
            opacity: 0.5,
          },
        },
      },
      MuiFormHelperText: {
        root: {
          maxWidth: 415,
          fontSize: '0.875rem',
          lineHeight: 1.25,
          '&$error': {
            color: '#ca0813',
          },
        },
      },
      MuiIconButton: {
        root: {
          padding: 12,
          color: textColors.linkActiveLight,
          '&:hover': {
            color: primaryColors.main,
            backgroundColor: 'transparent',
          },
        },
        edgeEnd: {
          marginRight: 0,
        },
      },
      MuiInput: {
        root: {
          alignItems: 'center',
          backgroundColor: '#fff',
          border: '1px solid #ccc',
          boxSizing: 'border-box',
          color: primaryColors.text,
          lineHeight: 1,
          maxWidth: 415,
          minHeight: 34,
          transition: 'border-color 225ms ease-in-out',
          '&$disabled': {
            borderColor: '#ccc',
            color: 'rgba(0, 0, 0, 0.75)',
            opacity: 0.5,
          },
          '&$focused': {
            borderColor: primaryColors.main,
            boxShadow: '0 0 2px 1px #e1edfa',
            '& .select-option-icon': {
              paddingLeft: `30px !important`,
            },
          },
          '&$error': {
            borderColor: '#ca0813',
          },
          [breakpoints.down('xs')]: {
            maxWidth: '100%',
            width: '100%',
          },
          '& svg': {
            fontSize: 18,
            color: primaryColors.main,
            '&:hover': {
              color: '#5e9aea',
            },
          },
          '&.affirmative': {
            borderColor: '#00b159',
          },
        },
        inputMultiline: {
          minHeight: 125,
          padding: '9px 12px',
          lineHeight: 1.4,
        },
        focused: {},
        error: {},
        disabled: {},
        input: {
          boxSizing: 'border-box',
          fontSize: '0.9rem',
          [breakpoints.only('xs')]: {
            fontSize: '1rem',
          },
          padding: 8,
        },
        formControl: {
          'label + &': {
            marginTop: 0,
          },
        },
      },
      MuiInputBase: {
        input: {
          height: 'auto',
        },
      },
      MuiInputAdornment: {
        root: {
          fontSize: '0.9rem',
          [breakpoints.only('xs')]: {
            fontSize: '1rem',
          },
          color: '#606469',
          whiteSpace: 'nowrap',
          '& p': {
            fontSize: '0.9rem',
            [breakpoints.only('xs')]: {
              fontSize: '1rem',
            },
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
      MuiLinearProgress: {
        colorPrimary: {
          backgroundColor: '#b7d6f9',
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
          '&$disabled': {
            opacity: 0.5,
          },
          '&$selected, &$selected:hover': {
            backgroundColor: 'transparent',
            color: primaryColors.main,
          },
          '&.selectHeader': {
            opacity: 1,
            fontFamily: primaryFonts.bold,
            fontSize: '1rem',
            color: primaryColors.text,
          },
        },
        disabled: {},
        selected: {},
      },
      MuiListItemText: {
        root: {
          marginTop: 0,
          marginBottom: 0,
        },
        secondary: {
          marginTop: 4,
          lineHeight: '1.2em',
        },
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
            borderRadius: 0,
          },
          '& .selectMenuList': {
            maxHeight: 250,
            overflowY: 'auto',
            overflowX: 'hidden',
            boxSizing: 'content-box',
            padding: 4,
            '& li': {
              paddingLeft: 10,
              paddingRight: 10,
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
          fontFamily: primaryFonts.normal,
          fontSize: '.9rem',
          whiteSpace: 'initial',
          textOverflow: 'initial',
          color: primaryColors.text,
          minHeight: 'auto',
          paddingTop: 16,
          paddingBottom: 16,
          transition: `${'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), '}
        ${'color .2s cubic-bezier(0.4, 0, 0.2, 1)'}`,
          '&$selected, &$selected:hover': {
            backgroundColor: 'transparent',
            color: primaryColors.main,
            opacity: 1,
          },
          '&:hover': {
            backgroundColor: primaryColors.main,
            color: 'white',
          },
          '& em': {
            fontStyle: 'normal !important',
          },
        },
        selected: {},
      },
      MuiPaper: {
        root: {},
        rounded: {
          borderRadius: 0,
        },
        outlined: {
          border: '1px solid #e7e7e7',
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
      MuiRadio: {
        root: {
          '& $checked': {
            color: primaryColors.main,
          },
          color: primaryColors.main,
        },
        checked: {},
        colorSecondary: {
          color: primaryColors.main,
          '&$checked': {
            color: primaryColors.main,
            '&:hover': {
              backgroundColor: 'rgba(36, 83, 233, 0.04)',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(36, 83, 233, 0.04)',
          },
        },
      },
      MuiSelect: {
        selectMenu: {
          '&$disabled': {
            '&+ input + $icon': {
              opacity: 0.5,
            },
          },
          padding: '16px 32px 16px 12px',
          color: primaryColors.text,
          backgroundColor: '#fff',
          lineHeight: 1,
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
          '&:focus': {
            backgroundColor: 'transparent',
          },
        },
        icon: {
          marginTop: -2,
          marginRight: 4,
          width: 28,
          height: 28,
          transition: 'color 225ms ease-in-out',
          color: '#aaa !important',
          opacity: 0.5,
        },
        disabled: {},
      },
      MuiSkeleton: {
        text: {
          marginTop: 0,
          borderRadius: 0,
        },
      },
      MuiSnackbar: {
        root: {},
      },
      MuiSnackbarContent: {
        root: {
          boxShadow: '0 0 5px #ddd',
          color: '#606469',
          backgroundColor: 'white',
          borderLeft: `6px solid transparent`,
          borderRadius: 4,
        },
      },
      MuiSvgIcon: {
        root: {
          fontSize: 24,
        },
      },
      MuiSwitch: {
        root: {
          width: 68,
          height: 48,
          '& $checked': {
            // color: `${primaryColors.main} !important`,
            '& input': {
              left: -20,
            },
            '& .square': {
              fill: 'white',
            },
            '&$switchBase': {
              '& + $track': {
                opacity: 1,
              },
            },
          },
          '& $disabled': {
            '&$switchBase': {
              '& + $track': {
                backgroundColor: '#ddd',
                borderColor: '#ccc',
              },
              '& .square': {
                fill: 'white',
              },
            },
          },
          '& .icon': {
            borderRadius: 1,
            height: 16,
            width: 16,
            position: 'relative',
            left: 0,
            transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
          },
          '& .square': {
            fill: 'white',
            transition: 'fill 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
          },
          '&:hover, &:focus': {
            '& $checked': {
              '& + $track': {
                opacity: 1,
              },
            },
          },
        },
        disabled: {},
        checked: {},
        track: {
          top: 12,
          left: 12,
          marginLeft: 0,
          marginTop: 0,
          backgroundColor: '#C9CACB',
          borderRadius: 1,
          boxSizing: 'content-box',
          height: 24,
          width: 44,
          opacity: 1,
          transition: 'border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
        },
        switchBase: {
          color: primaryColors.main,
          padding: 16,
          '&$checked': {
            transform: 'translateX(20px)',
          },
        },
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
          lineHeight: 1.3,
          [breakpoints.up('md')]: {
            minWidth: 75,
          },
          '&$selected, &$selected:hover': {
            fontFamily: primaryFonts.bold,
            color: primaryColors.headline,
          },
          '&:hover': {
            color: primaryColors.main,
          },
        },
        // label: {
        //   [breakpoints.up('md')]: {
        //     fontSize: '1rem'
        //   }
        // },
        wrapper: {
          padding: '6px 0',
          [breakpoints.up('md')]: {
            padding: '6px 0',
          },
        },
        textColorPrimary: {
          '&$selected': {
            color: '#32363c',
          },
        },
        selected: {},
      },
      MuiTable: {
        root: {
          borderCollapse: 'initial',
        },
      },
      MuiTableCell: {
        root: {
          borderTop: `1px solid ${primaryColors.divider}`,
          borderBottom: `1px solid ${primaryColors.divider}`,
          padding: 10,
        },
        head: {
          fontSize: '.9rem',
          height: 46,
          lineHeight: 1.1,
        },
        body: {
          fontSize: '.9rem',
        },
      },
      MuiTabs: {
        root: {
          margin: '16px 0',
          boxShadow: 'inset 0 -1px 0 #c5c6c8',
          minHeight: 48,
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
              borderRadius: '50%',
            },
          },
          '& $scrollButtons:last-child': {
            '& svg': {
              backgroundColor: 'rgba(232, 232, 232, .9)',
              height: 39,
              width: 38,
              padding: '7px 4px',
              borderRadius: '50%',
            },
          },
        },
        fixed: {
          overflowX: 'auto',
        },
        scrollButtons: {
          flex: '0 0 40px',
        },
        indicator: {
          primary: {
            backgroundColor: primaryColors.main,
          },
          secondary: {
            backgroundColor: primaryColors.main,
          },
        },
      },
      MuiTableRow: {
        root: {
          backgroundColor: primaryColors.white,
          backfaceVisibility: 'hidden',
          position: 'relative',
          zIndex: 1,
          height: 40,
          '&:hover, &:focus': {
            '&$hover': {
              backgroundColor: '#fbfbfb',
              [breakpoints.up('md')]: {
                boxShadow: `inset 5px 0 0 ${primaryColors.main}`,
              },
            },
          },
        },
        head: {
          height: 'auto',
          backgroundColor: '#fbfbfb',
        },
        hover: {
          cursor: 'pointer',
          '& a': {
            color: primaryColors.text,
          },
          '& a.secondaryLink': {
            color: primaryColors.main,
            '&:hover': {
              textDecoration: 'underline',
            },
          },
        },
      },
      MuiTableSortLabel: {
        root: {
          fontSize: '.9rem',
          lineHeight: '1.1rem',
          transition: 'color 225ms ease-in-out',
          '&.MuiTableSortLabel-active': {
            color: textColors.tableHeader,
          },
          '&:hover': {
            color: primaryColors.main,
          },
          '&:focus': {
            outline: '1px dotted #999',
          },
        },
        icon: {
          opacity: 1,
          color: 'inherit !important',
          marginTop: 2,
        },
        iconDirectionDesc: {
          transform: 'rotate(180deg)',
        },
        iconDirectionAsc: {
          transform: 'rotate(0deg)',
        },
      },
      MuiTooltip: {
        popper: {
          opacity: 1,
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
            fontSize: '.9rem',
          },
        },
      },
      MuiTypography: {
        button: {
          textTransform: 'inherit',
          borderRadius: '3px',
          fontSize: '1rem',
          lineHeight: 1,
          fontFamily: primaryFonts.bold,
          backgroundColor: primaryColors.main,
          color: '#fff',
          padding: `8px 20px`,
          maxHeight: 34,
          position: 'relative',
          minHeight: `34px`,
          cursor: 'pointer',
          border: 'none',
          [breakpoints.down('sm')]: {
            marginLeft: 8,
            maxHeight: 34,
            minWidth: 100,
          },
          '&:hover, &:focus': {
            backgroundColor: primaryColors.light,
          },
          '&:active': {
            backgroundColor: primaryColors.light,
          },
          '&$colorSecondary': {
            backgroundColor: 'transparent',
            color: primaryColors.main,
            '&:hover, &:focus': {
              backgroundColor: 'transparent !important',
              color: primaryColors.light,
            },
            '&:active': {
              backgroundColor: 'transparent',
              color: primaryColors.light,
            },
          },
        },
      },
    },
  };
};

export default (options: ThemeOptions) =>
  createMuiTheme(
    mergeDeepRight(themeDefaults(), {
      breakpoints: {
        values: {
          xs: 0,
          sm: 600,
          md: 960,
          lg: 1280,
          xl: 1920,
        },
      },
      ...options,
    })
  );
