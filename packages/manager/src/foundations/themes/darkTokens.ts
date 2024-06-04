import {
  Action,
  Border,
  Button,
  Color,
  Select,
} from '@linode/design-language-system/themes/dark';
import { ThemeOptions } from '@mui/material/styles';

import { breakpoints } from 'src/foundations/breakpoints';
import { latoWeb } from 'src/foundations/fonts';

const primaryColors = {
  dark: Color.Brand[90],
  divider: Color.Neutrals.Black,
  headline: Color.Neutrals[5],
  light: Color.Brand[60],
  main: Color.Brand[80],
  text: Color.Neutrals.White,
  white: Color.Neutrals.Black,
};

export const customDarkTokenModeOptions = {
  bg: {
    app: Color.Neutrals[100],
    appBar: Color.Neutrals.Black,
    bgAccessRow: Color.Neutrals[80],
    bgAccessRowTransparentGradient: 'rgb(69, 75, 84, .001)',
    bgPaper: Color.Neutrals[90],
    lightBlue1: Color.Neutrals.Black,
    lightBlue2: Color.Brand[100],
    main: Color.Neutrals[100],
    mainContentBanner: Color.Neutrals[100],
    offWhite: Color.Neutrals[90],
    primaryNavPaper: Color.Neutrals[100],
    tableHeader: Color.Neutrals[100],
    white: Color.Neutrals[100],
  },
  borderColors: {
    borderTable: Color.Neutrals[80],
    borderTypography: Color.Neutrals[80],
    divider: Color.Neutrals[80],
  },
  color: {
    black: Color.Neutrals.White,
    blueDTwhite: Color.Neutrals.White,
    border2: Color.Neutrals.Black,
    border3: Color.Neutrals.Black,
    boxShadow: 'rgba(0, 0, 0, 0.5)',
    boxShadowDark: Color.Neutrals.Black,
    buttonPrimaryHover: Button.Primary.Hover.Background,
    drawerBackdrop: 'rgba(0, 0, 0, 0.5)',
    grey1: Color.Neutrals[50],
    grey2: Color.Neutrals[100],
    grey3: Color.Neutrals[60],
    grey5: Color.Neutrals[100],
    grey6: Color.Neutrals[50],
    grey7: Color.Neutrals[80],
    grey9: primaryColors.divider,
    headline: primaryColors.headline,
    label: Color.Neutrals[40],
    offBlack: Color.Neutrals.White,
    red: Color.Red[70],
    tableHeaderText: Color.Neutrals.White,
    white: Color.Neutrals[100],

    // TODO: This should be moved to component level.
    tagButtonBg: Color.Brand[40],
    tagButtonBgHover: Button.Primary.Hover.Background,
    tagButtonText: Button.Primary.Default.Text,
    tagButtonTextHover: Button.Primary.Hover.Text,
    tagIcon: Button.Primary.Default.Icon,
    tagIconHover: Button.Primary.Default.Text,
  },
  textColors: {
    headlineStatic: Color.Neutrals[20],
    linkActiveLight: Action.Primary.Default,
    linkHover: Action.Primary.Hover,
    tableHeader: Color.Neutrals[60],
    tableStatic: Color.Neutrals[20],
    textAccessTable: Color.Neutrals[50],
  },
} as const;

const iconCircleAnimation = {
  '& .circle': {
    fill: primaryColors.main,
    transition: 'fill .2s ease-in-out .2s',
  },
  '& .insidePath *': {
    stroke: Color.Neutrals.White,
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
    color: Action.Primary.Hover,
    textDecoration: 'underline',
  },
  background: 'none',
  border: 'none',
  color: Action.Primary.Default,
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
  color: customDarkTokenModeOptions.textColors.tableStatic,
  fontSize: '1rem',
  padding: 0,
};

const genericTableHeaderStyle = {
  '&:hover': {
    '& span': {
      color: customDarkTokenModeOptions.textColors.linkActiveLight,
    },
    cursor: 'pointer',
  },
};

export const darkThemeTokens: ThemeOptions = {
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
  bg: customDarkTokenModeOptions.bg,
  borderColors: customDarkTokenModeOptions.borderColors,
  breakpoints,
  color: customDarkTokenModeOptions.color,
  components: {
    MuiAppBar: {
      styleOverrides: {
        colorDefault: {
          backgroundColor: 'transparent',
        },
        root: {
          backgroundColor: Color.Neutrals.Black,
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        listbox: {
          backgroundColor: customDarkTokenModeOptions.bg.white,
          border: `1px solid ${primaryColors.main}`,
        },
        loading: {
          color: Color.Neutrals.White,
        },
        noOptions: {
          color: Color.Neutrals.White,
        },
        tag: {
          '.MuiChip-deleteIcon': { color: primaryColors.text },
          backgroundColor: customDarkTokenModeOptions.bg.lightBlue1,
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: customDarkTokenModeOptions.color.drawerBackdrop,
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          // TODO: We can remove this after migration since we can define variants
          '&.loading': {
            backgroundColor: primaryColors.text,
          },
          '&:active': {
            backgroundColor: Button.Primary.Pressed.Background,
          },
          '&:disabled': {
            backgroundColor: Button.Primary.Disabled.Background,
            color: Button.Primary.Disabled.Text,
          },
          '&:hover, &:focus': {
            backgroundColor: Button.Primary.Hover.Background,
          },
          '&[aria-disabled="true"]': {
            backgroundColor: Button.Primary.Disabled.Background,
            color: Button.Primary.Disabled.Text,
          },
          backgroundColor: Button.Primary.Default.Background,
          color: Button.Primary.Default.Text,
          padding: '2px 20px',
        },
        containedSecondary: {
          // TODO: We can remove this after migration since we can define variants
          '&.loading': {
            color: primaryColors.text,
          },
          '&:active': {
            backgroundColor: 'transparent',
            color: Button.Secondary.Pressed.Text,
          },
          '&:disabled': {
            backgroundColor: 'transparent',
            color: Button.Secondary.Disabled.Text,
          },
          '&:hover, &:focus': {
            backgroundColor: 'transparent',
            color: Button.Secondary.Hover.Text,
          },
          '&[aria-disabled="true"]': {
            backgroundColor: 'transparent',
            color: Button.Secondary.Disabled.Text,
          },
          backgroundColor: 'transparent',
          color: Button.Secondary.Default.Text,
        },
        outlined: {
          '&:active': {
            backgroundColor: Button.Secondary.Pressed.Background,
            borderColor: Button.Secondary.Pressed.Text,
            color: Button.Secondary.Pressed.Text,
          },
          '&:hover, &:focus': {
            backgroundColor: Button.Secondary.Hover.Background,
            border: `1px solid ${Button.Secondary.Hover.Border}`,
            color: Button.Secondary.Hover.Text,
          },
          '&[aria-disabled="true"]': {
            backgroundColor: Button.Secondary.Disabled.Background,
            border: `1px solid ${Button.Secondary.Disabled.Border}`,
            color: Button.Secondary.Disabled.Text,
          },
          backgroundColor: Button.Secondary.Default.Background,
          border: `1px solid ${Button.Secondary.Default.Border}`,
          color: Button.Secondary.Default.Text,
          minHeight: 34,
        },
        root: {
          '&[aria-disabled="true"]': {
            cursor: 'not-allowed',
          },
          border: 'none',
          borderRadius: 1,
          cursor: 'pointer',
          fontFamily: latoWeb.bold,
          fontSize: '1rem',
          lineHeight: 1,
          minHeight: 34,
          minWidth: 105,
          textTransform: 'capitalize',
          transition: 'none',
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
          backgroundColor: Color.Neutrals[50],
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
            backgroundColor: Color.Brand[60],
          },
          '&:hover': {
            backgroundColor: Color.Brand[60],
          },
          backgroundColor: Color.Brand[50],
        },
        colorInfo: {
          color: primaryColors.dark,
        },
        colorWarning: {
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
          boxShadow: `0 0 5px ${Color.Neutrals[100]}`,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${Color.Neutrals[100]}`,
          color: primaryColors.headline,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: customDarkTokenModeOptions.borderColors.divider,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 0,
          boxShadow: `0 0 5px ${Color.Neutrals[100]}`,
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          // Component.Checkbox.Checked.Disabled
          '&.copy > div': {
            backgroundColor: Color.Neutrals[100],
          },
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        disabled: {},
        label: {
          '&.Mui-disabled': {
            color: `${Color.Neutrals[50]} !important`,
          },
          color: primaryColors.text,
        },
        root: {},
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          '&[class*="error"]': {
            color: Select.Error.HintText,
          },
          color: Color.Neutrals[40],
          lineHeight: 1.25,
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          '&$disabled': {
            color: Color.Neutrals[40],
          },
          '&$error': {
            color: Color.Neutrals[40],
          },
          '&.Mui-focused': {
            color: Color.Neutrals[40],
          },
          color: Color.Neutrals[40],
        },
      },
    },
    MuiInput: {
      styleOverrides: {
        disabled: {},
        focused: {},
        input: {
          '&.Mui-disabled': {
            WebkitTextFillColor: 'unset !important',
          },
        },
        root: {
          '& svg': {
            color: Select.Default.Icon,
          },
          '&.Mui-disabled': {
            '& svg': {
              color: Select.Disabled.Icon,
            },
            backgroundColor: Select.Disabled.Background,
            borderColor: Select.Disabled.Border,
            color: Select.Disabled.Text,
          },
          '&.Mui-error': {
            '& svg': {
              color: Select.Error.Icon,
            },
            backgroundColor: Select.Error.Background,
            borderColor: Select.Error.Border,
            color: Select.Error.Text,
          },
          '&.Mui-focused': {
            '& svg': {
              color: Select.Focus.Icon,
            },
            backgroundColor: Select.Focus.Background,
            borderColor: Select.Focus.Border,
            boxShadow: `0 0 2px 1px ${Color.Neutrals[100]}`,
            color: Select.Focus.Text,
          },
          '&.Mui-hover': {
            '& svg': {
              color: Select.Hover.Icon,
            },
            backgroundColor: Select.Hover.Background,
            borderColor: Select.Hover.Border,
            color: Select.Hover.Text,
          },
          backgroundColor: Select.Default.Background,
          borderColor: Select.Default.Border,
          color: Select.Default.Text,
        },
      },
    },
    MuiInputAdornment: {
      styleOverrides: {
        root: {
          '& p': {
            color: Color.Neutrals[20],
          },
          color: Color.Neutrals[20],
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
          '&.loading': {
            backgroundColor: primaryColors.text,
          },
          '&:active': {
            backgroundColor: Button.Primary.Pressed.Background,
          },
          '&:disabled': {
            backgroundColor: Button.Primary.Disabled.Background,
            color: Button.Primary.Disabled.Text,
          },
          '&:hover, &:focus': {
            backgroundColor: Button.Primary.Hover.Background,
            color: Button.Primary.Default.Text,
          },
          '&:last-child)': {
            borderBottom: 0,
          },
          '&[aria-disabled="true"]': {
            backgroundColor: Button.Primary.Disabled.Background,
            color: Button.Primary.Disabled.Text,
          },
          backgroundColor: Button.Primary.Default.Background,
          borderBottom: `1px solid ${Border.Normal}`,
          color: Button.Primary.Default.Text,
          padding: '10px 10px 10px 16px',
        },
        selected: {},
      },
    },
    MuiPaper: {
      styleOverrides: {
        outlined: {
          // TODO: We can remove this variant since they will always have a border
          backgroundColor: Color.Neutrals[90],
          border: `1px solid ${Color.Neutrals[80]}`,
        },
        root: {
          backgroundColor: Color.Neutrals[90],
          backgroundImage: 'none', // I have no idea why MUI defaults to setting a background image...
          border: `1px solid ${Color.Neutrals[80]}`,
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          boxShadow: `0 0 5px ${Color.Neutrals[100]}`,
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        colorSecondary: {
          '&$checked': {
            '&:hover': {
              backgroundColor: 'rgba(36, 83, 233, 0.04)',
            },
            color: primaryColors.main,
          },
          '&:hover': {
            backgroundColor: 'rgba(36, 83, 233, 0.04)',
          },
          color: primaryColors.main,
        },
        root: ({ theme }) => ({
          '& .defaultFill': {
            '& circle': {
              color: Color.Neutrals[40],
            },
            color: Color.Neutrals[80],
            fill: Color.Neutrals[80],
          },
          '&.Mui-disabled': {
            '& .defaultFill': {
              color: Color.Neutrals[40],
              opacity: 0.15,
            },
          },
          '&:hover': {
            color: theme.palette.primary.main,
          },
        }),
      },
    },
    MuiSelect: {
      styleOverrides: {},
    },
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          backgroundColor: Color.Neutrals[100],
          boxShadow: `0 0 5px ${Color.Neutrals[100]}`,
          color: primaryColors.text,
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          '& .Mui-disabled': {
            '& + .MuiSwitch-track': {
              opacity: '.5 !important',
            },
            opacity: 0.5,
          },
        },
        track: {
          backgroundColor: Color.Neutrals[80],
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          '&$selected, &$selected:hover': {
            color: Color.Neutrals.White,
          },
          color: Color.Neutrals.White,
        },
        selected: {},
        textColorPrimary: {
          '&$selected, &$selected:hover': {
            color: Color.Neutrals.White,
          },
          color: Color.Neutrals.White,
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          border: `1px solid ${customDarkTokenModeOptions.borderColors.borderTable}`,
          borderBottom: 0,
          borderTop: 0,
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
            color: Action.Primary.Default,
          },
          '& a:hover': {
            color: Action.Primary.Hover,
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
          backgroundColor: Color.Neutrals[100],
        },
        hover: {
          '& a': {
            color: primaryColors.text,
          },
        },
        root: {
          '&:before': {
            borderLeftColor: Color.Neutrals[90],
          },
          '&:hover, &:focus': {
            backgroundColor: Color.Neutrals[80],
          },
          backgroundColor: Color.Neutrals[90],
          border: `1px solid ${Color.Neutrals[50]}`,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        flexContainer: {
          '& $scrollButtons:first-of-type': {
            color: Color.Neutrals.Black,
          },
        },
        root: {
          boxShadow: `inset 0 -1px 0 ${Color.Neutrals[100]}`,
        },
        scrollButtons: {
          color: Color.Neutrals.White,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: Color.Neutrals[70],
          boxShadow: `0 0 5px ${Color.Neutrals[100]}`,
          color: Color.Neutrals.White,
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          '& a': {
            color: Action.Primary.Default,
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
            color: Action.Primary.Hover,
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
    darkGreen: `rgb(16, 162, 29)`,
    diskIO: {
      read: `rgb(255, 196, 105)`,
      swap: `rgb(238, 44, 44)`,
      write: `rgb(255, 179, 77)`,
    },
    lightGreen: `rgb(49, 206, 62)`,
    purple: `rgb(217, 176, 217)`,
    red: `rgb(255, 99, 60)`,
    yellow: `rgb(255, 220, 125)`,
  },
  inputStyles: {
    default: {
      backgroundColor: Select.Default.Background,
      borderColor: Select.Default.Border,
      color: Select.Default.Text,
    },
    disabled: {
      '& svg': {
        color: Select.Disabled.Icon,
      },
      backgroundColor: Select.Disabled.Background,
      borderColor: Select.Disabled.Border,
      color: Select.Disabled.Text,
    },
    error: {
      '& svg': {
        color: Select.Error.Icon,
      },
      backgroundColor: Select.Error.Background,
      borderColor: Select.Error.Border,
      color: Select.Error.Text,
    },
    focused: {
      '& svg': {
        color: Select.Focus.Icon,
      },
      backgroundColor: Select.Focus.Background,
      borderColor: Select.Focus.Border,
      boxShadow: `0 0 2px 1px ${Color.Neutrals[100]}`,
      color: Select.Focus.Text,
    },
    hover: {
      '& svg': {
        color: Select.Hover.Icon,
      },
      backgroundColor: Select.Hover.Background,
      borderColor: Select.Hover.Border,
      color: Select.Hover.Text,
    },
  },
  name: 'dark',
  palette: {
    background: {
      default: customDarkTokenModeOptions.bg.app,
      paper: Color.Neutrals[100],
    },
    divider: primaryColors.divider,
    error: {
      dark: Color.Red[60],
      light: Color.Red[10],
      main: Color.Red[40],
    },
    mode: 'dark',
    primary: primaryColors,
    text: {
      primary: primaryColors.text,
    },
  },
  textColors: customDarkTokenModeOptions.textColors,
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
