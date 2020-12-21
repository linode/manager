import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';

type ClassNames =
  | 'loaderWrapper'
  | 'emptyState'
  | 'table'
  | 'searchWrapper'
  | 'searchBar'
  | 'searchBarCMR'
  | 'stackscriptPlaceholder'
  | 'button'
  | 'cmrHeaderWrapper'
  | 'cmrActions';

const styles = (theme: Theme) =>
  createStyles({
    loaderWrapper: {
      display: 'flex',
      justifyContent: 'center',
      padding: theme.spacing(2)
    },
    emptyState: {
      color: theme.palette.text.primary,
      textAlign: 'center'
    },
    table: {
      overflow: 'scroll'
    },
    searchWrapper: {
      display: 'flex',
      flexWrap: 'nowrap',
      backgroundColor: theme.bg.white,
      paddingTop: theme.spacing(2),
      paddingBottom: '40px !important',
      position: 'sticky',
      top: 0,
      width: '100%',
      zIndex: 11
    },
    searchBar: {
      backgroundColor: theme.color.white,
      marginTop: 0,
      '& .input': {
        backgroundColor: theme.cmrBGColors.bgSearchBar,
        border: 'none',
        borderRadius: 3,
        minHeight: 'auto',
        minWidth: 415
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
      flexBasis: '100%',
      '& .input': {
        backgroundColor: theme.cmrBGColors.bgPaper,
        border: `1px solid ${theme.color.grey3}`,
        borderRadius: 0
      }
    },
    // Styles to override base placeholder styles for StackScript null state
    stackscriptPlaceholder: {
      padding: `${theme.spacing(1)}px 0`,
      margin: 0,
      width: '100%',
      '& svg': {
        marginTop: 4,
        transform: 'scale(0.8)'
      }
    },
    button: {
      borderRadius: 3,
      height: 34,
      width: 180,
      marginRight: 8,
      padding: 0
    },
    cmrHeaderWrapper: {
      backgroundColor: 'transparent',
      position: 'static',
      paddingTop: 0,
      paddingBottom: '8px !important',
      [theme.breakpoints.up('sm')]: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }
    },
    cmrActions: {
      display: 'flex',
      alignItems: 'center'
    }
  });

export type StyleProps = WithStyles<ClassNames>;

export default withStyles(styles);
