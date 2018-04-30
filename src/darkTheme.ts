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
    border1: '#ABADAF',
    border2: '#C5C6C8',
    border3: '#eee',
    grey1: '#abadaf',
    grey2: '#E7E7E7',
    grey3: '#ccc',
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
    headline: {
      color: '#fff',
    },
    title: {
      color: '#f4f4f4',
    },
    subheading: {
      color: '#fff',
    },
  },
  overrides: {
    MuiAppBar: {
      colorDefault: {
        backgroundColor: '#000',
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
    MuiPaper: {
      root: {
        backgroundColor: '#000',
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
  },
};

export default LinodeTheme;
