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
    padding: '8px 12px',
    position: 'relative',
    '&:hover, &:focus': {
      color: '#c1c1c0'
    },
    '&:first-of-type': {
      marginLeft: theme.spacing()
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
