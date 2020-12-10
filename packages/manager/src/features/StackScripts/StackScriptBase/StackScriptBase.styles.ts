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
      display: 'flex',
      flexWrap: 'nowrap',
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
      backgroundColor: theme.color.white,
      marginTop: 0,
      minHeight: 'auto',
      '& .input': {
        backgroundColor: theme.cmrBGColors.bgSearchBar,
        border: 'none',
        borderRadius: 3
      },
      '& > div': {
        marginRight: 0
      },
      '& > input': {
        padding: theme.spacing()
      },
      '& + button': {
        paddingTop: 0,
        paddingBottom: 0
      }
    },
    searchBarCMR: {
      flexBasis: '100%'
    },
    cmrSpacing: {
      paddingTop: 4,
      paddingBottom: `4px !important`,
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
