import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';

type ClassNames = 'root' | 'CSVlinkContainer' | 'CSVlink' | 'CSVwrapper';

const styles = (theme: Theme) =>
  createStyles({
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
      [theme.breakpoints.down('sm')]: {
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
  });

export type StyleProps = WithStyles<ClassNames>;

export default withStyles(styles);
