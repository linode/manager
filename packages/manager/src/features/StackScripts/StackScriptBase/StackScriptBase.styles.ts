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
  | 'searchBarCMR'
  | 'stackscriptPlaceholder'
  | 'button'
  | 'cmrHeaderWrapper'
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
    searchBar: {
      backgroundColor: theme.color.white,
      marginTop: 0,
      minHeight: 'auto',
      '& .input': {
        border: 'none',
        borderRadius: 3,
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
      width: 180,
      borderRadius: 3,
      height: 34,
      padding: 0,
      marginRight: 8
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
