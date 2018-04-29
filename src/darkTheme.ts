const LinodeTheme: Linode.Theme = {
  bg: {
    main: '#2F3236',
    navy: '#32363C',
    white: '#000',
  },
  palette: {
    divider: '#000',
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
  overrides: {
    MuiPaper: {
      root: {
        backgroundColor: '#000',
      },
    },
  },
};

export default LinodeTheme;
