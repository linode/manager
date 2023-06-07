import { ThemeOptions } from '@mui/material/styles';
import { breakpoints } from 'src/foundations/breakpoints';
import { latoWeb } from 'src/foundations/fonts';
import {
  Colors,
  Components,
} from '@linode/design-language-system/dist/cloudmanager';

export const bg = {
  app: Colors.Neutrals.Grey02,
  main: Colors.Neutrals.Grey02,
  offWhite: Colors.Neutrals.Grey01,
  lightBlue1: Colors.Brand01,
  lightBlue2: Colors.Brand02,
  white: Colors.Neutrals.White,
  tableHeader: Colors.Neutrals.Grey01,
  primaryNavPaper: Colors.Neutrals.Grey10,
  mainContentBanner: Colors.Neutrals.Grey10,
  bgPaper: Colors.Neutrals.White,
  bgAccessRow: Colors.Neutrals.Grey01,
  bgAccessRowTransparentGradient: 'rgb(255, 255, 255, .001)',
} as const;

const primaryColors = {
  main: Colors.Brand04,
  light: Colors.Brand03,
  dark: Colors.Brand05,
  text: Colors.Neutrals.Grey08,
  headline: Colors.Neutrals.Grey10,
  divider: Colors.Neutrals.Grey02,
  white: Colors.Neutrals.White,
};

export const color = {
  headline: primaryColors.headline,
  red: Colors.Status.Danger,
  orange: Colors.Status.Warning,
  yellow: Colors.Status.Highlight,
  green: Colors.Status.Success,
  teal: Colors.Status.Success,
  border2: Colors.Neutrals.Grey05,
  border3: Colors.Neutrals.Grey03,
  grey1: Colors.Neutrals.Grey06,
  grey2: Colors.Neutrals.Grey04,
  grey3: Colors.Neutrals.Grey05,
  grey4: Colors.Neutrals.Grey07,
  grey5: Colors.Neutrals.Grey02,
  grey6: Colors.Neutrals.Grey04,
  grey7: Colors.Neutrals.Grey03,
  grey8: Colors.Neutrals.Grey04,
  grey9: Colors.Neutrals.Grey02,
  white: Colors.Neutrals.White,
  black: Colors.Neutrals.Black,
  offBlack: Colors.Neutrals.Grey09,
  boxShadow: Colors.Neutrals.Grey04,
  boxShadowDark: Colors.Neutrals.Grey06,
  blueDTwhite: Colors.Brand04,
  tableHeaderText: 'rgba(0, 0, 0, 0.54)',
  drawerBackdrop: 'rgba(255, 255, 255, 0.5)',
  label: Colors.Neutrals.Grey08,
  disabledText: Colors.Neutrals.Grey05,
  tagButton: Colors.Brand01,
  tagIcon: Colors.Brand03,
  blue: Colors.Brand04,
} as const;

export const textColors = {
  linkActiveLight: Colors.Brand04,
  headlineStatic: Colors.Neutrals.Grey10,
  tableHeader: Colors.Neutrals.Grey07,
  tableStatic: Colors.Neutrals.Grey08,
  textAccessTable: Colors.Neutrals.Grey08,
} as const;

export const borderColors = {
  borderTypography: Colors.Neutrals.Grey04,
  borderTable: Colors.Neutrals.Grey02,
  divider: Colors.Neutrals.Grey04,
} as const;

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
  fontFamily: latoWeb.bold,
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

const spacing = 8;

export const lightTheme: ThemeOptions = {
  name: 'light', // we really should just leverage pallete.mode
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
  spacing,
  bg,
  color,
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
    normal: latoWeb.normal,
    semiBold: latoWeb.semiBold,
    bold: latoWeb.bold,
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
  palette: {
    divider: primaryColors.divider,
    primary: primaryColors,
    text: {
      primary: primaryColors.text,
    },
    success: {
      light: '#d7e3ef', // TODO: We do not have light versions of status colors
      main: '#d7e3ef', // TODO: We do not have light versions of status colors
      dark: Colors.Status.Success,
    },
    warning: {
      light: '#fdf4da', // TODO: We do not have light versions of status colors
      main: '#fdf4da', // TODO: We do not have light versions of status colors
      dark: Colors.Status.Highlight, // TODO: The warning color is closer to highlight... maybe we rename this?
    },
    error: {
      light: '#f8dedf', // TODO: We do not have light versions of status colors
      main: '#f8dedf', // TODO: We do not have light versions of status colors
      dark: Colors.Status.Danger,
    },
  },
  typography: {
    fontFamily: latoWeb.normal,
    fontSize: 16,
    h1: {
      color: primaryColors.headline,
      fontSize: '1.25rem',
      lineHeight: '1.75rem',
      fontFamily: latoWeb.bold,
      [breakpoints.up('lg')]: {
        fontSize: '1.5rem',
        lineHeight: '1.875rem',
      },
    },
    h2: {
      color: primaryColors.headline,
      fontSize: '1.125rem',
      fontFamily: latoWeb.bold,
      lineHeight: '1.5rem',
    },
    h3: {
      color: primaryColors.headline,
      fontSize: '1rem',
      fontFamily: latoWeb.bold,
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
  components: {
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: Colors.Neutrals.Grey05,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        colorDefault: {
          backgroundColor: 'inherit',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        colorDefault: {
          color: Colors.Neutrals.Grey05, // TODO: This was the closest color according to our palette
          backgroundColor: 'unset',
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        listbox: {
          backgroundColor: bg.white,
          border: `1px solid ${primaryColors.main}`,
        },
        endAdornment: {
          top: 'unset',
          paddingRight: 8,
        },
        inputRoot: {
          paddingLeft: 8,
        },
        loading: {
          border: `1px solid ${primaryColors.main}`,
        },
        noOptions: {
          border: `1px solid ${primaryColors.main}`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          border: 'none',
          borderRadius: 1,
          cursor: 'pointer',
          fontFamily: latoWeb.bold,
          fontSize: '1rem',
          minHeight: 34,
          minWidth: 105,
          lineHeight: 1,
          textTransform: 'capitalize',
          transition: 'none',
        },
        containedPrimary: {
          backgroundColor: Components.Button.Primary.Default.Background,
          color: Components.Button.Primary.Default.Text,
          padding: '2px 20px',
          '&:hover, &:focus': {
            backgroundColor: Components.Button.Primary.Hover.Background,
          },
          '&:active': {
            backgroundColor: Components.Button.Primary.Hover.Background, // TODO: We need an active token
          },
          '&:disabled': {
            backgroundColor: Components.Button.Primary.Disabled.Background,
            color: Components.Button.Primary.Disabled.Text,
          },
          // TODO: We can remove this after migration since we can define variants
          '&.loading': {
            backgroundColor: primaryColors.text,
          },
        },
        containedSecondary: {
          backgroundColor: 'transparent',
          color: Components.Button.Secondary.Default.Text,
          '&:hover, &:focus': {
            backgroundColor: 'transparent',
            color: Components.Button.Secondary.Hover.Text,
          },
          '&:active': {
            backgroundColor: 'transparent',
            borderColor: Components.Button.Secondary.Hover.Text, // TODO: We need an ACTIVE token
            color: Components.Button.Secondary.Hover.Text, // TODO: We need an ACTIVE token
          },
          '&:disabled': {
            backgroundColor: 'transparent',
            borderColor: Components.Button.Secondary.Disabled.Text,
            color: Components.Button.Secondary.Disabled.Text,
          },
          // TODO: We can remove this after migration since we can define variants
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
            backgroundColor: Colors.Neutrals.Grey02, // TODO: This was the closest color according to our palette
            border: `1px solid ${Colors.Neutrals.Grey04}`, // TODO: This was the closest color according to our palette
            color: Colors.Brand04,
          },
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
    MuiCardHeader: {
      styleOverrides: {
        root: {
          backgroundColor: Colors.Neutrals.Grey01,
        },
        content: {
          // This is necessary for text to ellipsis responsively without the need for a hard set width value that won't play well with flexbox.
          minWidth: 0,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: Colors.Neutrals.Grey04,
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
          '&:focus': {
            outline: `1px dotted ${Colors.Neutrals.Grey07}`, // TODO: This was the closest color according to our palette
          },
        },
        clickable: {
          backgroundColor: Colors.Brand01, // TODO: This was the closest color according to our palette
          '&:hover': {
            backgroundColor: Colors.Brand02, // TODO: This was the closest color according to our palette
          },
          '&:focus': {
            backgroundColor: Colors.Brand02, // TODO: This was the closest color according to our palette
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
          margin: 0,
          padding: 2,
          color: primaryColors.text,
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        circle: {
          strokeLinecap: 'inherit',
        },
      },
    },
    MuiCollapse: {
      styleOverrides: {
        root: {
          width: '100%',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          boxShadow: `0 0 5px ${Colors.Neutrals.Grey06}`, // TODO: This was the closest color according to our palette
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
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          margin: 0,
          padding: 24,
          justifyContent: 'flex-start',
          '& .actionPanel': {
            padding: 0,
          },
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '8px 24px',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${Colors.Neutrals.Grey03}`,
          marginBottom: 20,
          padding: '16px 24px',
          color: primaryColors.headline,
          '& h2': {
            lineHeight: 1.2,
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          boxShadow: `0 0 5px ${Colors.Neutrals.Grey06}`, // TODO: This was the closest color according to our palette
          /** @todo This is breaking typing. */
          // overflowY: 'overlay',
          display: 'block',
          fallbacks: {
            overflowY: 'auto',
          },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          flexBasis: '100%',
          width: '100%',
          '& .actionPanel': {
            paddingBottom: 12,
            paddingLeft: 16,
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          justifyContent: 'space-between',
          backgroundColor: 'transparent',
          paddingRight: 12,
          paddingLeft: 16,
          '& svg': {
            fill: Colors.Brand04,
            stroke: Colors.Brand04,
          },
          '&:hover': {
            '& h3': {
              color: primaryColors.light,
            },
          },
          '&.Mui-expanded': {
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
          '&.Mui-expanded': {
            margin: '12px 0',
          },
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          padding: 16,
          paddingTop: 0,
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          marginTop: 16,
          minWidth: 120,
          '&.copy > div': {
            backgroundColor: Colors.Neutrals.Grey02,
          },
          [breakpoints.down('xs')]: {
            width: '100%',
          },
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          marginLeft: -11,
        },
        label: {
          color: primaryColors.text,
        },
      },
    },
    MuiFormGroup: {
      styleOverrides: {
        root: {
          '&[role="radiogroup"]': {
            marginTop: 8,
            marginBottom: 16,
          },
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: Colors.Neutrals.Grey08,
          fontFamily: latoWeb.bold,
          fontSize: '.875rem',
          marginBottom: 8,
          '&$focused': {
            color: Colors.Neutrals.Grey08,
          },
          '&$error': {
            color: Colors.Neutrals.Grey08,
          },
          '&$disabled': {
            color: Colors.Neutrals.Grey08,
            opacity: 0.5,
          },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          maxWidth: 415,
          fontSize: '0.875rem',
          lineHeight: 1.25,
          '&$error': {
            color: Colors.Status.Danger,
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          padding: 12,
          '&:hover': {
            color: primaryColors.main,
            backgroundColor: 'transparent',
          },
        },
        edgeEnd: {
          marginRight: 0,
        },
      },
      defaultProps: {
        size: 'large',
      },
    },
    MuiInput: {
      styleOverrides: {
        root: {
          alignItems: 'center',
          backgroundColor: Colors.Neutrals.White,
          border: `1px solid ${Colors.Neutrals.Grey05}`,
          boxSizing: 'border-box',
          color: primaryColors.text,
          lineHeight: 1,
          maxWidth: 415,
          minHeight: 34,
          transition: 'border-color 225ms ease-in-out',
          '&$disabled': {
            borderColor: Colors.Neutrals.Grey05,
            color: 'rgba(0, 0, 0, 0.75)',
            opacity: 0.5,
          },
          '&.Mui-focused': {
            borderColor: primaryColors.main,
            boxShadow: `0 0 2px 1px ${Colors.Neutrals.Grey04}`,
            '& .select-option-icon': {
              paddingLeft: `30px !important`,
            },
          },
          '&.Mui-error': {
            borderColor: Colors.Status.Danger,
          },
          [breakpoints.down('xs')]: {
            maxWidth: '100%',
            width: '100%',
          },
          '& svg': {
            fontSize: 18,
            color: primaryColors.main,
            '&:hover': {
              color: Colors.Brand03,
            },
          },
          '&.affirmative': {
            borderColor: Colors.Status.Success,
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
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          height: 'auto',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(0, 0, 0, 0.12)',
          marginTop: spacing,
          marginBottom: spacing,
        },
      },
    },
    MuiInputAdornment: {
      styleOverrides: {
        root: {
          fontSize: '0.9rem',
          [breakpoints.only('xs')]: {
            fontSize: '1rem',
          },
          color: Colors.Neutrals.Grey08,
          whiteSpace: 'nowrap',
          '& p': {
            fontSize: '0.9rem',
            [breakpoints.only('xs')]: {
              fontSize: '1rem',
            },
            color: Colors.Neutrals.Grey08,
          },
        },
        positionEnd: {
          marginRight: 10,
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        formControl: {
          position: 'relative',
        },
        shrink: {
          transform: 'none',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: Colors.Brand02, // TODO: This was the closest color according to our palette
        },
      },
    },
    MuiList: {
      styleOverrides: {
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
    },
    MuiListItem: {
      styleOverrides: {
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
            fontFamily: latoWeb.bold,
            fontSize: '1rem',
            color: primaryColors.text,
          },
        },
        disabled: {},
        selected: {},
      },
    },
    MuiListItemText: {
      styleOverrides: {
        root: {
          marginTop: 0,
          marginBottom: 0,
        },
        secondary: {
          marginTop: 4,
          lineHeight: '1.2em',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
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
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          height: 'auto',
          fontFamily: latoWeb.normal,
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
    },
    MuiPaper: {
      styleOverrides: {
        root: {},
        rounded: {
          borderRadius: 0,
        },
        outlined: {
          border: `1px solid ${Colors.Neutrals.Grey04}`,
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          boxShadow: `0 0 5px ${Colors.Neutrals.Grey04}`,
          borderRadius: 0,
          minWidth: 200,
          [breakpoints.up('lg')]: {
            minWidth: 250,
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& $checked': {
            color: primaryColors.main,
          },
          // color: primaryColors.main,
          color: Colors.Neutrals.Grey05,
          padding: '10px 10px',
          transition: theme.transitions.create(['color']),
          '& .defaultFill': {
            fill: theme.color.white,
            transition: theme.transitions.create(['fill']),
          },
          '&:hover': {
            color: theme.palette.primary.main,
            fill: theme.color.white,
            '& .defaultFill': {
              fill: theme.color.white,
            },
          },
          '&.Mui-disabled': {
            color: `${Colors.Neutrals.Grey05} !important`,
            fill: `${Colors.Neutrals.Grey02} !important`,
            pointerEvents: 'none',
            '& .defaultFill': {
              fill: Colors.Neutrals.Grey02,
            },
          },
        }),
        checked: ({ theme }) => ({
          color: theme.palette.primary.main,
        }),
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
    },
    MuiSelect: {
      styleOverrides: {
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
          color: `${Colors.Neutrals.Grey06} !important`,
          opacity: 0.5,
        },
        disabled: {},
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        text: {
          marginTop: 0,
          borderRadius: 0,
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {},
      },
    },
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          boxShadow: `0 0 5px ${Colors.Neutrals.Grey04}`,
          color: Colors.Neutrals.Grey08,
          backgroundColor: 'white',
          borderLeft: `6px solid transparent`,
          borderRadius: 4,
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          fontSize: 24,
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 68,
          height: 48,
          '.MuiSwitch-track': {
            opacity: '1 !important',
          },
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
                backgroundColor: Colors.Neutrals.Grey04,
                borderColor: Colors.Neutrals.Grey05,
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
          backgroundColor: Colors.Neutrals.Grey05,
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
          '&.Mui-disabled': {
            '& +.MuiSwitch-track': {
              backgroundColor: Colors.Neutrals.Grey04,
              borderColor: Colors.Neutrals.Grey05,
            },
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
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
            fontFamily: latoWeb.bold,
            color: primaryColors.headline,
          },
          '&:hover': {
            color: primaryColors.main,
          },
        },
        textColorPrimary: {
          '&$selected': {
            color: Colors.Neutrals.Grey10,
          },
        },
        selected: {},
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          borderCollapse: 'initial',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
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
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          margin: '16px 0',
          boxShadow: `inset 0 -1px 0 ${Colors.Neutrals.Grey05}`,
          minHeight: 48,
          position: 'relative',
          '& $scrollButtons:first-of-type': {
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
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          backgroundColor: primaryColors.white,
          backfaceVisibility: 'hidden',
          position: 'relative',
          zIndex: 1,
          height: 40,
          '&:hover, &:focus': {
            '&$hover': {
              backgroundColor: Colors.Neutrals.Grey01,
              [breakpoints.up('md')]: {
                boxShadow: `inset 5px 0 0 ${primaryColors.main}`,
              },
            },
          },
        },
        head: {
          height: 'auto',
          backgroundColor: Colors.Neutrals.Grey01,
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
    },
    MuiTableSortLabel: {
      styleOverrides: {
        root: {
          fontSize: '.9rem',
          lineHeight: '1.1rem',
          transition: 'color 225ms ease-in-out',
          '&.Mui-active': {
            color: textColors.tableHeader,
          },
          '&:hover': {
            color: primaryColors.main,
          },
          '&:focus': {
            outline: '1px dotted ${COLO7S.N}',
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
    },
    MuiTooltip: {
      styleOverrides: {
        popper: {
          opacity: 1,
        },
        tooltip: {
          borderRadius: 0,
          maxWidth: 200,
          backgroundColor: 'white',
          boxShadow: `0 0 5px ${Colors.Neutrals.Grey06}`, // TODO: This was the closest color according to our palette
          color: Colors.Neutrals.Grey08,
          textAlign: 'left',
          [breakpoints.up('sm')]: {
            padding: '8px 10px',
            fontSize: '.9rem',
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        button: {
          textTransform: 'inherit',
          borderRadius: '3px',
          fontSize: '1rem',
          lineHeight: 1,
          fontFamily: latoWeb.bold,
          backgroundColor: primaryColors.main,
          color: Colors.Neutrals.White,
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
  },
};
