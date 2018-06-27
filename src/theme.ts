import createBreakpoints from '@material-ui/core/styles/createBreakpoints';

const breakpoints = createBreakpoints({});

const LinodeTheme: Linode.Theme = {
  '@keyframes rotate': {
    from: {
      transform: 'rotate(0deg)',
    },
    to: {
      transform: 'rotate(360deg)',
    },
  },
  name: 'lightTheme',
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
        '&:hover': {
          backgroundColor: '#fff',
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
        '&.cancel': {
          '&:hover, &:focus': {
            borderColor: '#222',
          },
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
          '&:hover, &:focus': {
            borderColor: '#5F99EA',
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
    MuiCollapse: {
      container: {
        width: '100%',
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
      },
    },
    MuiDrawer: {
      paper: {
        boxShadow: '0 0 5px #bbb',
        overflowY: 'overlay',
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
            color: '#5F99EA',
          },
          '& $expandIcon': {
            '& svg': {
              fill: '#5F99EA',
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
        color: '#3B85D9',
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
          stroke: '#5F99EA !important',
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
        color: '#3B85D9',
        '&:hover': {
          color: '#5F99EA',
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
        boxSizing: 'border-box',
        backgroundColor: 'white',
        [breakpoints.down('xs')]: {
          maxWidth: 250,
        },
        '& svg': {
          fontSize: 18,
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
      inputMultiline: {
        minHeight: 125,
        padding: '5px 12px',
      },
      focused: {
        borderColor: '#999',
      },
      error: {
        borderColor: '#CA0813',
      },
      disabled: {
        borderColor: '#ccc',
        color: '#666',
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
        '& p': {
          fontSize: '.9rem',
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
    },
    MuiListItem: {
      root: {
        '&.selectHeader': {
          opacity: 1,
          fontWeight: 700,
          fontSize: '1rem',
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
            color: '#666',
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
        color: '#3B85D9',
        transition: `${'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), '}
        ${'color .2s cubic-bezier(0.4, 0, 0.2, 1)'}`,
        '&:hover, &:focus': {
          backgroundColor: '#3B85D9',
          color: 'white',
        },
        '& em': {
          fontStyle: 'normal !important',
        },
      },
      selected: {
        backgroundColor: 'white !important',
        color: '#3B85D9 !important',
        opacity: 1,
        '&:focus': {
          backgroundColor: '#f4f4f4 !important',
        },
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
        padding: '5px 32px 5px 16px',
        color: '#666',
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
        transition: 'color 225ms ease-in-out',
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
        boxShadow: 'inset 0 -1px 0 #C5C6C8',
      },
      fixed: {
        overflowX: 'auto',
      },
    },
    MuiTooltip: {
      tooltip: {
        borderRadius: 0,
        maxWidth: 200,
        backgroundColor: 'white',
        boxShadow: '0 0 5px #bbb',
        color: '#666',
        textAlign: 'left',
        [breakpoints.up('sm')]: {
          padding: '12px  16px',
          fontSize: '.9rem',
        },
        '&$open': {
          opacity: 1,
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
    yellow: '#FECF2F',
    border1: '#ABADAF',
    border2: '#C5C6C8',
    border3: '#eee',
    grey1: '#abadaf',
    grey2: '#E7E7E7',
    grey3: '#ccc',
    white: '#fff',
    black: '#222',
    boxShadow: '#ddd',
    focusBorder: '#999',
  },
  bg: {
    main: '#f4f4f4',
    offWhite: '#fbfbfb',
    navy: '#32363C',
    lightBlue: '#D7E3EF',
    white: '#fff',
  },
};

export default LinodeTheme;
