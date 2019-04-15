import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from '@material-ui/core/styles';

type ClassNames =
  | 'root'
  | 'emptyState'
  | 'table'
  | 'searchWrapper'
  | 'searchBar'
  | 'stackscriptPlaceholder';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  table: {
    overflow: 'scroll'
  },
  emptyState: {
    textAlign: 'center',
    color: theme.palette.text.primary
  },
  searchWrapper: {
    position: 'sticky',
    width: '100%',
    top: 0,
    zIndex: 11,
    paddingBottom: theme.spacing.unit * 3,
    backgroundColor: theme.bg.white
  },
  searchBar: {
    marginTop: 0,
    backgroundColor: theme.color.white
  },
  // Styles to override base placeholder styles for StackScript null state
  stackscriptPlaceholder: {
    padding: `${theme.spacing.unit}px 0`,
    margin: 0,
    width: '100%'
  }
});

export type StyleProps = WithStyles<ClassNames>;

export default withStyles(styles);
