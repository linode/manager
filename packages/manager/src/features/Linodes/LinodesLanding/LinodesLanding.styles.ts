import { Theme } from '@mui/material/styles';

type ClassNames = 'CSVlink' | 'CSVlinkContainer' | 'CSVwrapper' | 'root';

export const styles = (theme: Theme) => ({
  CSVlink: {
    '&:hover': {
      textDecoration: 'underline',
    },
    color: theme.textColors.tableHeader,
    fontSize: '.9rem',
    [theme.breakpoints.down('md')]: {
      marginRight: theme.spacing(),
    },
  },
  CSVlinkContainer: {
    '&.MuiGrid-item': {
      paddingRight: 0,
    },
    marginTop: theme.spacing(0.5),
  },
  CSVwrapper: {
    marginLeft: 0,
    marginRight: 0,
    width: '100%',
  },
  root: {
    '& > .MuiGrid-item': {
      paddingLeft: 0,
      paddingRight: 0,
    },
    margin: 0,
    width: '100%',
  },
});

export type StyleProps = Partial<Record<ClassNames, string>>;
