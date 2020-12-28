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
  | 'landing'
  | 'stackscriptPlaceholder';

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
      backgroundColor: theme.cmrBGColors.bgPaper,
      overflow: 'scroll'
    },
    searchWrapper: {
      display: 'flex',
      flexWrap: 'nowrap',
      backgroundColor: theme.cmrBGColors.bgPaper,
      paddingTop: theme.spacing(),
      paddingBottom: '8px !important',
      position: 'sticky',
      top: 0,
      width: '100%',
      zIndex: 11,
      [theme.breakpoints.up('sm')]: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }
    },
    searchBar: {
      backgroundColor: theme.color.white,
      flexBasis: '100%',
      marginTop: 0,
      '& .input': {
        backgroundColor: theme.cmrBGColors.bgPaper,
        border: `1px solid ${theme.color.grey3}`,
        borderRadius: 0,
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
    landing: {
      backgroundColor: `${theme.cmrBGColors.bgApp} !important`,
      marginTop: -theme.spacing(2.5)
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
    }
  });

export type StyleProps = WithStyles<ClassNames>;

export default withStyles(styles);
