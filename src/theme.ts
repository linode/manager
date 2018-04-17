import createBreakpoints from 'material-ui/styles/createBreakpoints';

const breakpoints = createBreakpoints({});

const LinodeTheme: Linode.Theme = {
  breakpoints: { breakpoints },
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
        color: '#3B85D9',
        padding: '12px 28px 14px',
        '&:hover, &:focus': {
          backgroundColor: '#fff',
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
          color: '#222',
          '&:hover, &:focus': {
            borderColor: '#222',
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
        height: 20,
        borderRadius: 4,
        color: '#555',
      },
      label: {
        paddingLeft: 4,
        paddingRight: 4,
      },
      deleteIcon: {
        color: '#aaa',
        width: 20,
        height: 20,
        marginLeft: 2,
      },
    },
    MuiCircularProgress: {
      circle: {
        strokeLinecap: 'inherit',
      },
    },
    MuiDialog: {
      paper: {
        boxShadow: '0 0 5px #bbb',
        maxWidth: '768px !important',
      },
    },
    MuiDialogActions: {
      root: {
        margin: 0,
        padding: '0 24px 24px 24px',
        justifyContent: 'flex-start',
        '& button': {
          marginRight: 16,
          '&:last-child': {
            marginRight: 0,
          },
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
      },
    },
    MuiDrawer: {
      paper: {
        boxShadow: '0 0 5px #bbb',
        overflowY: 'overlay',
        fallbacks: {
          overflowY: 'auto',
        },
      },
    },
    MuiExpansionPanel: {},
    MuiExpansionPanelActions: {
      root: {
        justifyContent: 'flex-start',
        backgroundColor: 'white',
      },
      action: {},
    },
    MuiExpansionPanelDetails: {
      root: {
        padding: 16,
        backgroundColor: 'white',
      },
    },
    MuiExpansionPanelSummary: {
      root: {
        padding: '0 16px',
        backgroundColor: 'white',
        '&:hover, &:focus': {
          backgroundColor: 'white',
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
        color: '#3B85D9',
        '& svg': {
          width: 22,
          height: 22,
        },
      },
      expandIconExpanded: {
        transform: 'none',
      },
    },
    MuiFormControl: {
      root: {
        minHeight: 60,
        marginTop: 16,
        minWidth: 200,
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
      },
      focused: {
        color: '#555',
      },
      error: {
        color: '#555',
      },
    },
    MuiFormHelperText: {
      error: {
        color: '#CA0813',
      },
    },
    MuiInput: {
      root: {
        maxWidth: 415,
        border: '1px solid #ccc',
        alignItems: 'center',
        transition: 'border-color 225ms ease-in-out',
        lineHeight: 1,
        minHeight: 44,
        boxSizing: 'border-box',
        '& svg': {
          fontSize: 18,
          marginLeft: 8,
          cursor: 'pointer',
          color: '#3B85D9',
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
        borderColor: '#f4f4f4',
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
        color: '#666',
        '&:hover, &:focus': {
          backgroundColor: 'white',
        },
        '& em': {
          fontStyle: 'normal !important',
        },
      },
      selected: {
        backgroundColor: 'white !important',
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
      root: {},
      selectMenu: {
        padding: '7px 32px 7px 10px',
        color: '#666',
        backgroundColor: '#fff',
        lineHeight: .9,
        '&:focus': {
          backgroundColor: '#fff',
          borderColor: 'pink',
        },
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
        backgroundColor: 'white',
        boxShadow: '0 0 5px #ddd',
        color: '#666',
        padding: 8,
        [breakpoints.up('md')]: {
          width: 800,
          borderRadius: 2,
          maxWidth: 'auto',
        },
      },
      message: {
        margin: '0 auto',
        width: '100%',
        padding: 0,
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
      },
      textColorPrimarySelected: {
        color: '#32363C',
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
    MuiTabIndicator: {
      root: {
        bottom: 0,
        backgroundColor: '#3B85D9',
      },
    },
    MuiTable: {
      root: {},
    },
    MuiTableCell: {
      root: {
        padding: '18px',
        borderBottom: '1px solid #f4f4f4',
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
    MuiTableHead: {
      root: {
        backgroundColor: '#fbfbfb',
      },
    },
    MuiTabs: {
      root: {
        margin: '16px 0',
      },
      scroller: {
        boxShadow: 'inset 0 -1px 0 #C5C6C8',
      },
    },
    MuiTooltip: {
      tooltip: {
        borderRadius: 0,
        maxWidth: 200,
        backgroundColor: 'white',
        boxShadow: '0 0 5px #bbb',
        color: '#666',
        textAlign: 'center',
        [breakpoints.up('sm')]: {
          padding: '12px  16px',
          fontSize: '.9rem',
        },
      },
    },
    Popover: {
      root: {
        borderRadius: 0,
      },
    },
    Notice: {
      root: {
        marginTop: 0,
      },
    },
  },
  palette: {
    primary: {
      main: '#3B85D9',
      light: '#5F99EA',
      dark: '#3566AE',
    },
    text: {
      primary: '#666',
    },
    divider: '#f4f4f4',
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
      color: '#333',
      fontSize: '1.5rem',
      fontWeight: 700,
    },
    title: {
      fontSize: '1.125rem',
      fontWeight: 700,
      color: '#32363C',
      lineHeight: '1.35417em',
    },
    subheading: {
      color: '#333',
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
    },
  },
  color: {
    headline: '#32363C',
    red: '#CA0813',
    green: '#00B159',
    border1: '#ABADAF',
    border2: '#C5C6C8',
    border3: '#eee',
    grey1: '#abadaf',
    grey2: '#E7E7E7',
    grey3: '#ccc',
  },
  bg: {
    main: '#f4f4f4',
    offWhite: '#fbfbfb',
    navy: '#32363C',
    lightBlue: '#D7E3EF',
  },
};

export default LinodeTheme;
