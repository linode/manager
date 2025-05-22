import {
  Action,
  Alias,
  Background,
  Badge,
  Border,
  Button,
  Color,
  Component,
  Content,
  Dropdown,
  Font,
  GlobalHeader,
  Interaction,
  NotificationToast,
  Search,
  Select,
  Spacing,
  Table,
  TextField,
  Typography,
} from '@linode/design-language-system/themes/dark';

import { breakpoints } from '../breakpoints';

import type { ThemeOptions } from '@mui/material/styles';

const primaryColors = {
  dark: Color.Brand[90],
  divider: Color.Neutrals.Black,
  headline: Color.Neutrals[5],
  light: Color.Brand[60],
  main: Color.Brand[80],
  text: Content.Text.Primary.Default,
  white: Color.Neutrals.Black,
};

// Eventually we'll probably want Color.Neutrals.Black once we fully migrate to CDS 2.0
// We will need to consult with the design team to determine the correct dark shade handling for:
// - appBar
// - popoverPaper (create menu, notification center)
// - MenuItem (create menu, action menu)
// since Color.Neutrals.Black is pitch black and may not be the correct choice yet.
const tempReplacementforColorNeutralsBlack = '#222';

export const customDarkModeOptions = {
  bg: {
    app: Color.Neutrals[100],
    appBar: tempReplacementforColorNeutralsBlack,
    bgAccessRowTransparentGradient: 'rgb(69, 75, 84, .001)',
    bgPaper: Color.Neutrals[90],
    interactionBgPrimary: Interaction.Background.Secondary,
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
    borderFocus: Interaction.Border.Focus,
    borderHover: Interaction.Border.Hover,
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
    headline: Content.Text.Primary.Default,
    label: Color.Neutrals[40],
    offBlack: Color.Neutrals.White,
    red: Color.Red[70],
    tableHeaderText: Color.Neutrals.White,
    // TODO: `tagButton*` should be moved to component level.
    tagButtonBg: Color.Brand[40],
    tagButtonBgHover: Button.Primary.Hover.Background,
    tagButtonText: Button.Primary.Default.Text,
    tagButtonTextHover: Button.Primary.Hover.Text,
    tagIcon: Button.Primary.Default.Icon,
    tagIconHover: Button.Primary.Default.Text,
    white: Color.Neutrals[100],
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

export const notificationToast = {
  default: {
    backgroundColor: NotificationToast.Informative.Background,
    borderLeft: `48px solid ${NotificationToast.Informative.IconBackground}`,
    color: NotificationToast.Text,
  },
  error: {
    backgroundColor: NotificationToast.Error.Background,
    borderLeft: `48px solid ${NotificationToast.Error.IconBackground}`,
  },
  info: {
    backgroundColor: NotificationToast.Informative.Background,
    borderLeft: `48px solid ${NotificationToast.Informative.IconBackground}`,
  },
  success: {
    backgroundColor: NotificationToast.Success.Background,
    borderLeft: `48px solid ${NotificationToast.Success.IconBackground}`,
  },
  warning: {
    backgroundColor: NotificationToast.Warning.Background,
    borderLeft: `48px solid ${NotificationToast.Warning.IconBackground}`,
  },
  tip: {
    backgroundColor: NotificationToast.Informative.Background,
    borderLeft: `48px solid ${NotificationToast.Informative.IconBackground}`,
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
  color: customDarkModeOptions.textColors.tableStatic,
  fontSize: '1rem',
  padding: 0,
};

const genericTableHeaderStyle = {
  '&:hover': {
    '& span': {
      color: customDarkModeOptions.textColors.linkActiveLight,
    },
    cursor: 'pointer',
  },
};

const MuiTableHeadSvgStyles = {
  svg: {
    path: {
      fill: Color.Brand[60],
    },
  },
};

const MuiTableZebraHoverStyles = {
  '&.MuiTableRow-hover:hover, &.Mui-selected, &.Mui-selected:hover': {
    background: Table.Row.Background.Hover,
  },
};

const MuiTableZebraStyles = {
  background: Table.Row.Background.Zebra,
  ...MuiTableZebraHoverStyles,
};

export const darkTheme: ThemeOptions = {
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
  bg: customDarkModeOptions.bg,
  borderColors: customDarkModeOptions.borderColors,
  breakpoints,
  color: customDarkModeOptions.color,
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: GlobalHeader.Background,
          color: GlobalHeader.Text.Default,
          zIndex: 1500, // To be above primary nav
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        clearIndicator: {
          color: Select.Default.Icon,
        },
        groupLabel: {
          marginTop: '0px !important',
          backgroundColor: Dropdown.Background.Category,
          padding: '8px 12px !important',
        },
        paper: {
          boxShadow: Alias.Elevation.S,
          marginTop: 4,
        },
        listbox: {
          backgroundColor: Select.Default.Background,
          paddingTop: '4px',
          border: 'none',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        loading: {
          color: Select.Default.Icon,
          border: '0px !important',
          boxShadow: Alias.Elevation.S,
        },
        inputRoot: {
          '& input::placeholder': {
            color: Select.Default.Text,
            opacity: 1,
          },
        },
        noOptions: {
          color: Select.Default.Icon,
          border: '0px !important',
          boxShadow: Alias.Elevation.S,
        },
        option: {
          '&.Mui-focused': {
            backgroundColor: `${Dropdown.Background.Hover} !important`,
          },
          '&:hover': {
            backgroundColor: `${Dropdown.Background.Hover}`,
            color: Dropdown.Text.Default,
          },
          '& .fi': {
            width: '28px',
            height: '20px',
            borderRadius: '3px',
            backgroundSize: 'cover',
            boxShadow: 'none',
          },
        },
        popper: {
          '&.MuiAutocomplete-popper': {
            '&[data-popper-placement="bottom"]': {
              '.MuiAutocomplete-listbox': {
                borderTop: 0,
                padding: 0,
                '& .MuiAutocomplete-groupLabel': {
                  fontSize: Font.FontSize.Xxxs,
                  lineHeight: Font.LineHeight.Xxxs,
                  fontWeight: Font.FontWeight.Bold,
                  color: Dropdown.Text.Default,
                  textTransform: 'uppercase',
                },
              },
              '.MuiAutocomplete-option': {
                height: '32px',
                svg: {
                  height: '20px',
                  width: '20px',
                },
              },
            },
            '&[data-popper-placement="top"]': {
              '.MuiAutocomplete-listbox': {
                borderBottom: 0,
                padding: 0,
                '& .MuiAutocomplete-groupLabel': {
                  fontSize: Font.FontSize.Xxxs,
                  lineHeight: Font.LineHeight.Xxxs,
                  fontWeight: Font.FontWeight.Bold,
                  color: Dropdown.Text.Default,
                  textTransform: 'uppercase',
                },
              },
              '.MuiAutocomplete-option': {
                height: '32px',
                svg: {
                  height: '20px',
                  width: '20px',
                },
              },
            },
          },
        },
        popupIndicator: {
          color: Select.Default.Icon,
        },
        tag: {
          '.MuiChip-deleteIcon': {
            color: Select.Default.Icon,
            width: 'auto',
            height: 'auto',
          },
          backgroundColor: customDarkModeOptions.bg.lightBlue1,
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: customDarkModeOptions.color.drawerBackdrop,
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
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
          '&[aria-disabled="true"]': {
            backgroundColor: Button.Primary.Disabled.Background,
            color: Button.Primary.Disabled.Text,
          },
          backgroundColor: Button.Primary.Default.Background,
          border: `1px solid transparent`,
          color: Button.Primary.Default.Text,
        },
        containedSecondary: {
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
          font: Typography.Label.Semibold.S,
        },
      },
      variants: [
        {
          props: { color: 'error' },
          style: {
            '&:not([aria-disabled="true"]):hover, &:not([aria-disabled="true"]):focus':
              {
                backgroundColor: Background.Negativesubtle,
                border: `1px solid ${Border.Negative}`,
                color: Content.Text.Negative,
              },
            '&[aria-disabled="true"]': {
              backgroundColor: 'transparent',
              border: `1px solid ${Button.Secondary.Disabled.Border}`,
              color: Button.Secondary.Disabled.Text,
            },
            backgroundColor: 'transparent',
            border: `1px solid ${Border.Negative}`,
            color: Content.Text.Negative,
          },
        },
      ],
    },
    MuiButtonBase: {
      styleOverrides: {
        root: {
          '&[aria-disabled="true"]': {
            '& .MuiSvgIcon-root': {
              fill: Button.Primary.Disabled.Icon,
            },
            cursor: 'not-allowed',
          },
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
    MuiCheckbox: {
      styleOverrides: {
        root: {
          // Unchecked & Disabled
          '&.Mui-disabled': {
            '& svg': {
              backgroundColor: Component.Checkbox.Empty.Disabled.Background,
            },
            color: Component.Checkbox.Empty.Disabled.Border,
            pointerEvents: 'none',
          },
          // Checked & Disabled
          '&.Mui-checked.Mui-disabled': {
            color: Component.Checkbox.Checked.Disabled.Background,
          },
          // Indeterminate & Disabled
          '&.MuiCheckbox-indeterminate.Mui-disabled': {
            color: Component.Checkbox.Indeterminated.Disabled.Background,
          },
          color: Component.Checkbox.Empty.Default.Border,
        },
      },
    },
    MuiChip: {
      defaultProps: {
        // In dark mode, we decided our Chips will be our primary color by default.
        color: 'primary',
      },
      styleOverrides: {
        // TODO: This will need CDS guidance in future
        clickable: {
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
          '&[aria-disabled="true"]': {
            backgroundColor: Button.Primary.Disabled.Background,
            color: Button.Primary.Disabled.Text,
          },
          backgroundColor: Button.Primary.Default.Background,
          border: `1px solid transparent`,
          color: Button.Primary.Default.Text,
        },
        colorError: {
          backgroundColor: Badge.Negative.Subtle.Background,
          color: Badge.Negative.Subtle.Text,
        },
        colorInfo: {
          backgroundColor: Badge.Informative.Subtle.Background,
          color: Badge.Informative.Subtle.Text,
        },
        colorPrimary: {
          backgroundColor: Badge.Informative.Subtle.Background,
          color: Badge.Informative.Subtle.Text,
        },
        colorSecondary: {
          '&.MuiChip-clickable': {
            '&:hover': {
              backgroundColor: Badge.Informative.Subtle.Background,
              color: Badge.Informative.Subtle.Text,
            },
          },
          backgroundColor: Badge.Informative.Subtle.Background,
          color: Badge.Informative.Subtle.Text,
        },
        colorSuccess: {
          backgroundColor: Badge.Positive.Subtle.Background,
          color: Badge.Positive.Subtle.Text,
        },
        colorWarning: {
          backgroundColor: Badge.Warning.Subtle.Background,
          color: Badge.Warning.Subtle.Text,
        },
        outlined: {
          '& .MuiChip-label': {
            color: Content.Text.Primary.Default,
          },
          backgroundColor: 'transparent',
          borderRadius: 1,
        },
        root: {
          color: Content.Text.Primary.Default,
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
          color: Content.Text.Primary.Default,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: customDarkModeOptions.borderColors.divider,
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
          color: Content.Text.Primary.Default,
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
          fontWeight: Font.FontWeight.Semibold,
          color: Color.Neutrals[40],
          lineHeight: 1.25,
          marginTop: '4px',
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          '&$disabled': {
            color: Component.Label.Text,
          },
          '&$error': {
            color: Component.Label.Text,
          },
          '&.Mui-focused': {
            color: Component.Label.Text,
          },
          color: Component.Label.Text,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&.MuiIconButton-isActive': {
            svg: {
              path: {
                fill: Content.Icon.Primary.Active,
              },
            },
          },
          '&:hover': {
            color: Content.Icon.Primary.Hover,
          },
        },
      },
    },
    MuiInputAdornment: {
      styleOverrides: {
        root: {
          color: Search.Filled.Icon,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          '&::placeholder': {
            color: TextField.Placeholder.Text,
          },
        },
        root: {
          '&.Mui-error': {
            backgroundColor: TextField.Error.Background,
            borderColor: TextField.Error.Border,
            color: TextField.Error.Text,
          },
          '&:active, &:focus, &.Mui-focused, &.Mui-focused:hover': {
            backgroundColor: TextField.Focus.Background,
            border: `1px solid ${TextField.Focus.Border}`,
            color: TextField.Focus.Text,
          },
          '&:disabled, &[aria-disabled="true"], &.Mui-disabled, &.Mui-disabled:hover':
            {
              backgroundColor: TextField.Disabled.Background,
              border: `1px solid ${TextField.Disabled.Border}`,
              color: TextField.Disabled.Text,
            },
          '&:hover': {
            backgroundColor: TextField.Hover.Background,
            border: `1px solid ${TextField.Hover.Border}`,
            color: TextField.Hover.Text,
          },
          background: TextField.Default.Background,
          border: `1px solid ${TextField.Default.Border}`,
          color: TextField.Filled.Text,
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          '&.selectHeader': {
            color: Content.Text.Primary.Default,
          },
          color: Content.Text.Primary.Default,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&.loading': {
            backgroundColor: Content.Text.Primary.Default,
          },
          '&:active': {
            backgroundColor: Dropdown.Background.Default,
          },
          '&:disabled': {
            backgroundColor: Dropdown.Background.Default,
            color: Dropdown.Text.Disabled,
            opacity: 1,
          },
          '&:hover, &:focus': {
            backgroundColor: Color.Neutrals[80],
            color: Dropdown.Text.Default,
          },
          '&:last-child': {
            borderBottom: 0,
          },
          '&[aria-disabled="true"]': {
            backgroundColor: Dropdown.Background.Default,
            color: Dropdown.Text.Disabled,
            opacity: 1,
          },
          backgroundColor: tempReplacementforColorNeutralsBlack,
          color: Dropdown.Text.Default,
          padding: '10px 10px 10px 16px',
        },
        selected: {},
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        input: {
          '&.Mui-disabled': {
            WebkitTextFillColor: 'unset !important',
          },
          boxSizing: 'border-box',
          [breakpoints.only('xs')]: {
            fontSize: '1rem',
          },
          fontSize: '0.9rem',
          padding: 8,
        },
        root: {
          '& svg': {
            color: TextField.Default.InfoIcon,
          },
          '&.Mui-disabled': {
            '& svg': {
              color: TextField.Disabled.InfoIcon,
            },
            backgroundColor: TextField.Disabled.Background,
            borderColor: TextField.Disabled.Border,
            color: TextField.Disabled.Text,
          },
          '&.Mui-error': {
            '& svg': {
              color: TextField.Error.Icon,
            },
            backgroundColor: TextField.Error.Background,
            borderColor: TextField.Error.Border,
            color: TextField.Error.Text,
          },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: TextField.Error.Border,
            color: TextField.Error.Text,
          },
          '&.Mui-focused': {
            '& svg': {
              color: TextField.Focus.Icon,
            },
            backgroundColor: TextField.Focus.Background,
            borderColor: TextField.Focus.Border,
            boxShadow: `0 0 2px 1px ${Color.Neutrals[100]}`,
            color: TextField.Focus.Text,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: '1px',
            boxShadow: `0 0 2px 1px ${Color.Neutrals[100]}`,
          },
          '&.Mui-hover': {
            '& svg': {
              color: TextField.Hover.Icon,
            },
            backgroundColor: TextField.Hover.Background,
            borderColor: TextField.Hover.Border,
            color: TextField.Hover.Text,
          },
          backgroundColor: TextField.Default.Background,
          borderColor: TextField.Default.Border,
          borderRadius: 0,
          boxSizing: 'border-box',
          color: TextField.Filled.Text,
          height: '34px',
          lineHeight: 1,
          minHeight: '34px',
          transition: 'border-color 225ms ease-in-out',
        },
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
          border: 0,
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          background: tempReplacementforColorNeutralsBlack,
          border: 0,
          boxShadow: `0 2px 6px 0 rgba(0, 0, 0, 0.18)`, // TODO: Fix Elevation.S to remove `inset`
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
          padding: '10px 10px',
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
          color: Content.Text.Primary.Default,
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
          // Zebra Striping
          '&.MuiTable-zebra': {
            // Linodes Group by Tag: First Row is the Title
            '&.MuiTable-groupByTag .MuiTableRow-root:not(:first-of-type):nth-of-type(odd)':
              MuiTableZebraStyles,
            // Default Striping
            '&:not(.MuiTable-groupByTag) .MuiTableRow-root:not(.MuiTableRow-nested):nth-of-type(even)':
              MuiTableZebraStyles,
          },
          // Nested Tables
          '.MuiTable-root': {
            '.MuiTableCell-head': {
              color: Table.HeaderOutlined.Text,
            },
            '.MuiTableRow-head, .MuiTableRow-head.MuiTableRow-hover:hover': {
              background: Background.Neutralsubtle,
            },
            border: 0,
          },
          // Collapsible Rows
          '.MuiTableRow-root:not(:last-of-type) .MuiCollapse-root': {
            borderBottom: `1px solid ${Border.Normal}`,
          },
          border: `1px solid ${Border.Normal}`,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          // User Permissions Table
          '.MuiFormControlLabel-label': {
            color: Table.HeaderNested.Text,
          },
          // Icons in TH (i.e.: Summary View, Group by Tag)
          '.MuiIconButton-root': {
            '&.MuiIconButton-isActive': MuiTableHeadSvgStyles,
            ':hover': {
              color: Color.Brand[60],
              ...MuiTableHeadSvgStyles,
            },
            svg: {
              path: {
                fill: Color.Neutrals.White,
              },
            },
          },
          color: Table.HeaderNested.Text,
        },
        root: {
          '&.MuiTableCell-nested': {
            '.MuiCollapse-root': {
              borderBottom: `1px solid ${Border.Normal}`,
            },
          },
          borderBottom: `1px solid ${Table.Row.Border}`,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        head: {
          background: Table.HeaderNested.Background,
        },
        root: {
          // Prevent needing `hover={false}` on header TableRows
          '&.MuiTableRow-head.MuiTableRow-hover:hover': {
            backgroundColor: Table.HeaderNested.Background,
          },
          // The `hover` rule isn't implemented correctly in MUI, so we apply it here.
          '&.MuiTableRow-hover:hover, &.Mui-selected, &.Mui-selected:hover': {
            backgroundColor: Table.Row.Background.Hover,
          },
          // Disable hover for nested rows (VPC)
          '&.MuiTableRow-nested, &.MuiTableRow-nested.MuiTableRow-hover:hover':
            {
              backgroundColor: Table.Row.Background.Default,
            },
          '&.disabled-row .MuiTableCell-root': {
            // TODO: Use design tokens in future when ready
            backgroundColor: Interaction.Background.Disabled,
            color: Content.Text.Primary.Disabled,
          },
          background: Table.Row.Background.Default,
        },
      },
    },
    MuiTableSortLabel: {
      styleOverrides: {
        root: {
          '&.Mui-active': {
            color: Table.HeaderNested.Text,
          },
          ':hover': {
            ...MuiTableHeadSvgStyles,
            color: Color.Brand[60],
          },
          svg: {
            path: {
              fill: Table.HeaderNested.Text,
            },
          },
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
            color: Content.Text.Primary.Default,
          },
          '& a.black:hover': {
            color: Content.Text.Primary.Default,
          },
          '& a.black:visited': {
            color: Content.Text.Primary.Default,
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
  notificationToast,
  palette: {
    background: {
      default: customDarkModeOptions.bg.app,
      paper: Color.Neutrals[90],
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
      primary: Content.Text.Primary.Default,
    },
  },
  textColors: customDarkModeOptions.textColors,
  tokens: {
    alias: Alias,
    color: Color,
    component: Component,
    font: Font,
    spacing: Spacing,
  },
  typography: {
    body1: {
      color: Content.Text.Primary.Default,
    },
    caption: {
      color: Content.Text.Primary.Default,
    },
    h1: {
      color: Content.Text.Primary.Default,
    },
    h2: {
      color: Content.Text.Primary.Default,
    },
    h3: {
      color: Content.Text.Primary.Default,
    },
    subtitle1: {
      color: Content.Text.Primary.Default,
    },
  },
};
