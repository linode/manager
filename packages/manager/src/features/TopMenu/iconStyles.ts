import { makeStyles, Theme } from 'src/components/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  icon: {
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
    top: 5,
    left: 23,
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    backgroundColor: theme.color.green,
    fontSize: '0.75rem',
    borderRadius: '50%',
    height: 12,
    width: 12
  }
}));
