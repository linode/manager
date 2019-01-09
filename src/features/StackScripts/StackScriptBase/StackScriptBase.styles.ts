import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from '@material-ui/core/styles';

type ClassNames = 'root'
  | 'emptyState'
  | 'table'
  | 'searchWrapper'
  | 'searchBar';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  table: {
    overflow: 'scroll',
  },
  emptyState: {
    textAlign: 'center',
    padding: '5em 2em',
    [theme.breakpoints.up('sm')]: {
      padding: '10em',
    },
  },
  searchWrapper: {
    position: 'sticky',
    width: '100%',
    top: 0,
    zIndex: 11,
    paddingBottom: theme.spacing.unit * 3,
    backgroundColor: theme.bg.white,
  },
  searchBar: {
    marginTop: 0,
    backgroundColor: theme.color.white,
  },
});

export type StyleProps = WithStyles<ClassNames>;

export default withStyles(styles);
