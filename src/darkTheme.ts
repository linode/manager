import createBreakpoints from 'material-ui/styles/createBreakpoints';

const breakpoints = createBreakpoints({});

const LinodeTheme: Linode.Theme = {
  bg: {
    main: '#2F3236',
    navy: '#32363C',
    white: '#32363C',
  },
  color: {
    headline: '#f4f4f4',
    red: '#CA0813',
    green: '#00B159',
    yellow: '#FECF2F',
    border1: '#000',
    border2: '#111',
    border3: '#222',
    grey1: '#abadaf',
    grey2: '#E7E7E7',
    grey3: '#ccc',
    white: '#32363C',
  },
  palette: {
    divider: '#000',
    primary: {
      main: '#3B85D9',
      light: '#5F99EA',
      dark: '#3566AE',
    },
    status: {
      success: '#d7e3EF',
      successDark: '#3682dd',
      warning: '#fdf4da',
      warningDark: '#ffd002',
      error: '#f8dedf',
      errorDark: '#cd2227',
    },
    text: {
      primary: '#fff',
    },
  },
  typography: {
    fontFamily: '"Lato", sans-serif',
    fontSize: 16,
    headline: {
      color: '#fff',
      fontSize: '1.5rem',
      fontWeight: 700,
    },
    title: {
      color: '#f4f4f4',
      ontSize: '1.125rem',
      fontWeight: 700,
      lineHeight: '1.35417em',
    },
    subheading: {
      color: '#fff',
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
      lineHeight: '1.1em',
      color: '#fff',
    },
  },
  overrides: {
    MuiAppBar: {
      colorDefault: {
        backgroundColor: '#2F3236',
      },
    },
    MuiButton: {
      root: {
        textTransform: 'inherit',
        borderRadius: 0,
        fontSize: '1rem',
        fontWeight: 700,
        color: '#3B85D9',
        padding: '12px 28px 14px',
        '&:hover': {
          backgroundColor: '#000',
        },
        '&:focus': {
          backgroundColor: 'transparent',
        },
      },
      raisedPrimary: {
        '&:hover, &:focus': {
          backgroundColor: '#5F99EA',
        },
        '&:active': {
          backgroundColor: '#3566AE',
        },
        '&$disabled': {
          color: 'white',
        },
      },
      raisedSecondary: {
        backgroundColor: 'transparent',
        color: '#3B85D9',
        border: '1px solid #3B85D9',
        padding: '11px 26px 13px',
        transition: 'border 225ms ease-in-out, color 225ms ease-in-out',
        '&:hover, &:focus': {
          backgroundColor: 'transparent',
          color: '#5F99EA',
          borderColor: '#5F99EA',
        },
        '&:active': {
          backgroundColor: 'transparent',
          color: '#3566AE',
          borderColor: '#3566AE',
        },
        '&$disabled': {
          borderColor: '#C9CACB',
          backgroundColor: 'transparent',
          color: '#C9CACB',
        },
        '&.cancel': {
          borderColor: 'transparent',
          marginLeft: 0,
          '&:hover, &:focus': {
            borderColor: '#5F99EA',
          },
        },
        '&.destructive': {
          borderColor: '#C44742',
          color: '#C44742',
          '&:hover, &:focus': {
            color: '#DF6560',
            borderColor: '#DF6560',
          },
          '&:active': {
            color: '#963530',
            borderColor: '#963530',
          },
        },
        '&.loading': {
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
    MuiDialogActions: {
      root: {
        margin: 0,
        padding: '0 24px 24px 24px',
        justifyContent: 'flex-start',
        '& button': {
          marginRight: 16,
          '&:first-child': {
            marginLeft: 0,
          },
          '&:last-child': {
            marginRight: 0,
          },
        },
      },
      action: {
        margin: 0,
      },
    },
    MuiExpansionPanel: {
      root: {
        '&:before': {
          display: 'none',
        },
      },
    },
    MuiExpansionPanelActions: {
      root: {
        justifyContent: 'flex-start',
        backgroundColor: '#32363C',
      },
      action: {},
    },
    MuiExpansionPanelDetails: {
      root: {
        padding: 16,
        backgroundColor: '#32363C',
      },
    },
    MuiExpansionPanelSummary: {
      root: {
        padding: '0 16px',
        backgroundColor: '#32363C',
        borderBottom: '1px solid #222',
        '&:hover, &:focus': {
          '& h3': {
            color: '#5F99EA',
          },
        },
      },
      expanded: {
        minHeight: 48,
      },
      contentExpanded: {
        margin: '12px 0',
      },
      expandIcon: {
        transition: 'color 225ms ease-in-out',
        top: 0,
        right: 0,
        transform: 'none',
        color: 'white',
        '& svg': {
          width: 22,
          height: 22,
        },
      },
      expandIconExpanded: {
        transform: 'none',
      },
    },
    MuiInput: {
      root: {
        maxWidth: 415,
        border: '1px solid #000',
        alignItems: 'center',
        transition: 'border-color 225ms ease-in-out',
        lineHeight: 1,
        color: 'white',
        minHeight: 44,
        boxSizing: 'border-box',
        backgroundColor: '#444',
        [breakpoints.down('xs')]: {
          maxWidth: 250,
        },
        '& svg': {
          fontSize: 18,
          marginLeft: 8,
          cursor: 'pointer',
          color: 'white',
          '&:hover': {
            color: '#5E9AEA',
          },
        },
        '&.affirmative': {
          borderColor: '#00B159',
        },
      },
      focused: {
        borderColor: '#666',
      },
      error: {
        borderColor: '#CA0813',
      },
      disabled: {
        borderColor: '#666',
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
    MuiFormControl: {
      root: {
        minHeight: 60,
        marginTop: 16,
        minWidth: 200,
      },
    },
    MuiFormLabel: {
      root: {
        color: '#C9CACB',
        fontWeight: 700,
      },
      focused: {
        color: '#C9CACB',
      },
      error: {
        color: '#C9CACB',
      },
    },
    MuiFormHelperText: {
      root: {
        flexBasis: '100%',
      },
      error: {
        color: '#CA0813',
      },
    },
    MuiFormControlLabel: {
      root: {
        marginLeft: -11,
      },
    },
    MuiInputLabel: {
      formControl: {
        position: 'relative',
      },
    },
    MuiList: {
      padding: {
        paddingTop: 0,
        paddingBottom: 0,
      },
    },
    MuiListItem: {
      root: {
        '&.selectHeader': {
          opacity: 1,
          paddingBottom: 4,
          fontWeight: 700,
          fontSize: '1rem',
          color: '#ddd',
        },
      },
      disabled: {
        opacity: 1,
      },
    },
    MuiListItemText: {
      secondary: {
        marginTop: 4,
        lineHeight: '1.2em',
      },
    },
    MuiMenuItem: {
      root: {
        height: 'auto',
        fontWeight: 400,
        fontSize: '.9rem',
        whiteSpace: 'initial',
        textOverflow: 'initial',
        color: '#999',
        transition: `${'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), '}
        ${'color .2s cubic-bezier(0.4, 0, 0.2, 1)'}`,
        '&:hover, &:focus': {
          color: 'white',
        },
        '& em': {
          fontStyle: 'normal !important',
        },
      },
      selected: {
        color: 'white !important',
        cursor: 'initial',
      },
    },
    MuiPaper: {
      root: {
        backgroundColor: '#32363C',
      },
    },
    MuiPopover: {
      paper: {
        boxShadow: '0 0 5px #222',
        borderRadius: 0,
        minWidth: 200,
        [breakpoints.up('lg')]: {
          minWidth: 250,
        },
      },
    },
    MuiSelect: {
      root: {},
      selectMenu: {
        padding: '7px 32px 7px 10px',
        color: '#C9CACB',
        lineHeight: 2.2,
        minHeight: 46,
      },
      select: {
        '&[aria-pressed="true"]': {
          '&+ input + $icon': {
            transform: 'scale(1.25)',
            stroke: '#666',
          },
        },
      },
      icon: {
        marginTop: -5,
        width: 32,
        height: 32,
        fill: 'none',
        stroke: '#999',
        clipPath: 'inset(45% 0 0 0)',
        transition: 'transform 225ms ease-in-out, color 225ms ease-in-out',
      },
      disabled: {
        '&+ input + $icon': {
          opacity: '.5',
        },
      },
    },
    MuiSnackbarContent: {
      root: {
        boxShadow: '0 0 5px #222',
        color: '#666',
        padding: 16,
        margin: 16,
        backgroundColor: 'transparent',
        [breakpoints.up('md')]: {
          margin: 0,
          padding: 24,
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
            borderColor: '#666',
          },
          '& .square': {
            fill: '#aaa',
          },
        },
      },
      checked: {
        transform: 'translateX(20px)',
        color: '#3B85D9 !important',
        '& input': {
          left: -20,
        },
        '& .square': {
          fill: 'white !important',
        },
        '& + $bar': {
          opacity: 1,
          backgroundColor: '#3B85D9 !important',
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
    },
    MuiTab: {
      root: {
        color: '#C9CACB',
        minWidth: 50,
        textTransform: 'inherit',
        fontWeight: 400,
        [breakpoints.up('md')]: {
          minWidth: 75,
        },
      },
      textColorPrimary: {
        color: '#C9CACB',
      },
      textColorPrimarySelected: {
        color: '#3B85D9',
        fontWeight: 700,
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
    },
    MuiTabs: {
      root: {
        margin: '16px 0',
        boxShadow: 'inset 0 -1px 0 #000',
      },
    },
    MuiTabIndicator: {
      root: {
        bottom: 0,
        backgroundColor: '#3B85D9',
      },
    },
    MuiTableCell: {
      root: {
        padding: '18px',
        borderBottom: '1px solid #000',
        '&:last-child': {
          paddingRight: 18,
        },
      },
      head: {
        fontSize: '.9rem',
        fontWeight: 900,
        color: 'white',
      },
      body: {
        fontSize: '.9rem',
      },
    },
    MuiTableHead: {
      root: {
        backgroundColor: '#32363C',
      },
    },
  },
};

export default LinodeTheme;
