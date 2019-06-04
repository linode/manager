import { createStyles, Theme, withStyles } from 'src/components/core/styles';


type ClassNames =
  | 'root'
  | 'emptyState'
  | 'table'
  | 'searchWrapper'
  | 'searchBar'
  | 'stackscriptPlaceholder';

const styles = (theme: Theme) =>
  createStyles({
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
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(3),
    backgroundColor: theme.bg.white
  },
  searchBar: {
    marginTop: 0,
    backgroundColor: theme.color.white,
    '& > div': {
      marginRight: 0
    }
  },
  // Styles to override base placeholder styles for StackScript null state
  stackscriptPlaceholder: {
    padding: `${theme.spacing(1)}px 0`,
    margin: 0,
    width: '100%'
  }
});

export type StyleProps = WithStyles<ClassNames>;

export default withStyles(styles);
