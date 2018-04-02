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
    MuiExpansionPanel: {},
    MuiExpansionPanelActions: {
      root: {
        justifyContent: 'flex-start',
        backgroundColor: 'white',
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
    MuiDrawer: {
      paper: {
        boxShadow: '0 0 5px #ddd',
      },
    },
    MuiInput: {
      root: {
        maxWidth: 415,
        border: '1px solid #ccc',
        alignItems: 'center',
        transition: 'border-color 225ms ease-in-out',
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
    },
    MuiFormControl: {
      root: {
        marginTop: 16,
      },
    },
    MuiFormControlLabel: {
      root: {
        marginLeft: -10,
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
        color: '#CA0813',
      },
    },
    MuiFormHelperText: {
      error: {
        color: '#CA0813',
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
        minHeight: 38,
        padding: '9px 32px 7px 10px',
        borderColor: '#e7e7e7',
        color: '#666',
        backgroundColor: '#fff',
        '&:focus': {
          backgroundColor: '#fff',
        },
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
      scroller: {
        boxShadow: 'inset 0 -1px 0 #C5C6C8',
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
