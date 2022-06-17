import { makeStyles, Theme } from 'src/components/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  icon: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'inherit',
    border: 'none',
    color: '#c9c7c7',
    cursor: 'pointer',
    height: '100%',
    outlineOffset: 'initial',
    position: 'relative',
    padding: 8,
    margin: 0,
    [theme.breakpoints.up('sm')]: {
      padding: '8px 12px',
    },
    [theme.breakpoints.down(370)]: {
      padding: 3,
    },
    '&:hover, &:focus': {
      color: '#606469',
    },
    '&:first-of-type': {
      [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(),
      },
    },
    '& svg': {
      height: 20,
      width: 20,
      marginTop: 4,
    },
  },
  hover: {
    color: '#606469',
  },
  badge: {
    display: 'flex',
    position: 'absolute',
    top: 2,
    left: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.color.green,
    borderRadius: '50%',
    width: '1rem',
    height: '1rem',
    '& p': {
      fontSize: '0.72rem',
      color: 'white',
    },
  },
}));
