import { Theme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles<void, 'buttonTitle' | 'icon'>()(
  (theme: Theme, _params, classes) => ({
    buttonTitle: {
      '&:hover': {
        color: theme.color.black,
        textDecoration: 'underline',
      },
      color: theme.color.black,
      cursor: 'pointer',
      fontSize: '1.2rem',
      padding: 0,
    },
    card: {
      alignItems: 'center',
      backgroundColor: theme.bg.bgPaper,
      border: `1px solid ${theme.borderColors.divider}`,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: theme.spacing(4),
    },
    clickableTile: {
      '& .tile-link::after': {
        content: "''",
        height: '100%',
        left: 0,
        position: 'absolute',
        top: 0,
        width: '100%',
      },
      '&:hover': {
        '& svg .outerCircle': {
          fill: theme.palette.primary.main,
          transition: 'fill .2s ease-in-out .2s',
        },
        [`& .${classes.buttonTitle}`]: {
          color: theme.color.black,
          textDecoration: 'underline',
        },
        [`& .${classes.icon}`]: {
          ...theme.animateCircleIcon,
        },
      },
      cursor: 'pointer',
      position: 'relative',
      transition: 'border-color 225ms ease-in-out',
    },
    icon: {
      '& .insidePath': {
        fill: 'none',
        stroke: theme.palette.primary.main,
        strokeLinejoin: 'round',
        strokeWidth: 1.25,
      },
      '& .outerCircle': {
        fill: theme.bg.offWhite,
        stroke: theme.bg.main,
      },
      '& svg': {
        height: 70,
        width: 70,
      },
      display: 'block',
      margin: '0 auto 16px',
    },
    tileTitle: {
      fontSize: '1.2rem',
      marginBottom: theme.spacing(1),
      marginTop: theme.spacing(1),
      textAlign: 'center',
    },
  })
);
