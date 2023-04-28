import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  root: {
    margin: 0,
    width: '100%',
    '& > .MuiGrid-item': {
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
  CSVlink: {
    color: theme.textColors.tableHeader,
    fontSize: '.9rem',
    '&:hover': {
      textDecoration: 'underline',
    },
    [theme.breakpoints.down('md')]: {
      marginRight: theme.spacing(),
    },
  },
  CSVlinkContainer: {
    marginTop: theme.spacing(0.5),
    '&.MuiGrid-item': {
      paddingRight: 0,
    },
  },
  CSVwrapper: {
    marginLeft: 0,
    marginRight: 0,
    width: '100%',
  },
}));
