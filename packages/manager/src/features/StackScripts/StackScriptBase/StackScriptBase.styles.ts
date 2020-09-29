import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';

type ClassNames =
  | 'root'
  | 'loaderWrapper'
  | 'emptyState'
  | 'table'
  | 'searchWrapper'
  | 'searchBar'
  | 'stackscriptPlaceholder'
  | 'cmrSpacing'
  | 'button'
  | 'cmrHeaderWrapper'
  | 'searchBarCMR'
  | 'cmrActions';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    loaderWrapper: {
      display: 'flex',
      justifyContent: 'center',
      padding: theme.spacing(2)
    },
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
      paddingBottom: '40px !important',
      backgroundColor: theme.bg.white
    },
    cmrHeaderWrapper: {
      position: 'static',
      [theme.breakpoints.up('sm')]: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }
    },
    searchBar: {
      marginTop: 0,
      backgroundColor: theme.color.white,
      '& > div': {
        marginRight: 0
      }
    },
    searchBarCMR: {
      flexBasis: '100%'
    },
    cmrSpacing: {
      paddingTop: 4,
      paddingBottom: `0 !important`,
      paddingLeft: 4
    },
    // Styles to override base placeholder styles for StackScript null state
    stackscriptPlaceholder: {
      padding: `${theme.spacing(1)}px 0`,
      margin: 0,
      width: '100%'
    },
    button: {
      width: 180,
      borderRadius: 3,
      height: 34,
      padding: 0,
      marginRight: 8
    },
    cmrActions: {
      display: 'flex',
      alignItems: 'center'
    }
  });

export type StyleProps = WithStyles<ClassNames>;

export default withStyles(styles);
