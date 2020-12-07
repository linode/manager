import { makeStyles, Theme } from 'src/components/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  icon: {
    cursor: 'pointer',
    position: 'relative',
    padding: theme.spacing(),
    marginLeft: theme.spacing(),
    color: '#c9c7c7',
    border: 'none',
    backgroundColor: 'inherit',
    '&:hover, &:focus': {
      color: '#c1c1c0'
    },
    '& svg': {
      width: 20,
      height: 20
    }
  },
  badge: {
    display: 'flex',
    position: 'absolute',
    padding: theme.spacing(0.25),
    top: 5,
    left: 20,
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    backgroundColor: theme.color.green,
    fontSize: '0.72rem',
    borderRadius: '50%',
    minWidth: 16,
    minHeight: 16
  }
}));
