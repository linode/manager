const LinodeTheme: Linode.Theme = {
  overrides: {
    MuiButton: {
      root: {
        textTransform: 'inherit',
        borderRadius: 0,
        fontSize: '1rem',
        fontWeight: 700,
        padding: '12px 28px 14px',
      },
    },
    Popover: {
      root: {
        borderRadius: 0,
      },
    },
  },
  palette: {
    primary: {
      main: '#3B85D9',
    },
    text: {
      primary: '#666',
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
      fontSize: '1.5rem',
      fontWeight: 700,
      color: '#00B159',
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
  },
  color: {
    headline: '#333',
    green: '#00B159',
    border1: 'rgb(224, 224, 224)',
  },
  bg: {
    main: '#f4f4f4',
    offWhite: '#fbfbfb',
    navy: '#32363C',
    lightBlue: '#D7E3EF',
  },
};

export default LinodeTheme;
