import { Theme } from '@mui/material/styles';
import { withStyles } from 'tss-react/mui';
import { WithStyles } from '@mui/styles';

type ClassNames =
  | 'emptyState'
  | 'landing'
  | 'loaderWrapper'
  | 'searchBar'
  | 'searchWrapper'
  | 'stackscriptPlaceholder'
  | 'table';

const styles = (theme: Theme) =>
  createStyles({
    emptyState: {
      color: theme.palette.text.primary,
    },
    landing: {
      backgroundColor: `${theme.bg.app} !important`,
      marginTop: `-${theme.spacing()}`,
    },
    loaderWrapper: {
      display: 'flex',
      justifyContent: 'center',
      padding: theme.spacing(2),
    },
    searchBar: {
      '& + button': {
        paddingBottom: 0,
        paddingTop: 0,
      },
      '& .input': {
        backgroundColor: theme.bg.bgPaper,
        border: `1px solid ${theme.color.grey3}`,
        borderRadius: 0,
        minHeight: 'auto',
        minWidth: 415,
      },
      '& > div': {
        marginRight: 0,
      },
      '& > input': {
        padding: theme.spacing(),
      },
      backgroundColor: theme.color.white,
      flexBasis: '100%',
      marginTop: 0,
    },
    searchWrapper: {
      backgroundColor: theme.bg.bgPaper,
      display: 'flex',
      flexWrap: 'nowrap',
      paddingBottom: '8px !important',
      paddingTop: theme.spacing(),
      position: 'sticky',
      [theme.breakpoints.up('sm')]: {
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'space-between',
      },
      top: 0,
      width: '100%',
      zIndex: 11,
    },
    // Styles to override base placeholder styles for StackScript null state
    stackscriptPlaceholder: {
      '& svg': {
        marginTop: 4,
        transform: 'scale(0.8)',
      },
      margin: 0,
      padding: `${theme.spacing(1)} 0`,
      width: '100%',
    },
    table: {
      backgroundColor: theme.bg.bgPaper,
      overflow: 'scroll',
    },
  });

export type StyleProps = WithStyles<ClassNames>;

export default withStyles(styles);
