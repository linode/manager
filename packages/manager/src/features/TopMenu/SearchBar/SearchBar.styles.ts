import { Theme } from '@mui/material/styles';
import { WithStyles, createStyles, withStyles } from '@mui/styles';

type ClassNames =
  | 'close'
  | 'icon'
  | 'input'
  | 'navIconHide'
  | 'root'
  | 'textfield'
  | 'textfieldContainer';

export type StyleProps = WithStyles<ClassNames>;

const styles = (theme: Theme) =>
  createStyles({
    close: {
      '& > span': {
        padding: 2,
      },
      '&:hover, &:focus': {
        color: theme.palette.primary.main,
      },
    },
    icon: {
      color: '#c9cacb',
      fontSize: '2rem',
    },
    input: {
      '& input': {
        fontSize: '1.0em',
        [theme.breakpoints.down('md')]: {},
        transition: theme.transitions.create(['opacity']),
      },
      background: 'transparent',
      border: 0,
      maxWidth: '100%',
    },
    navIconHide: {
      '& > span': {
        justifyContent: 'flex-end',
      },
      '& svg': {
        height: 25,
        width: 25,
      },
      '&:hover, &:focus': {
        color: '#c1c1c0',
      },
      backgroundColor: 'inherit',
      border: 'none',
      color: '#c9c7c7',
      cursor: 'pointer',
      padding: theme.spacing(),
      position: 'relative',
      [theme.breakpoints.up('md')]: {
        display: 'none',
      },
      top: 1,
    },
    root: {
      '& .react-select__control': {
        backgroundColor: 'transparent',
      },
      '& .react-select__indicators': {
        display: 'none',
      },
      '& .react-select__menu': {
        border: 0,
        borderRadius: 4,
        boxShadow: `0 0 10px ${theme.color.boxShadowDark}`,
        marginTop: 12,
        maxHeight: 350,
        overflowY: 'auto',
      },
      '& .react-select__menu-list': {
        overflowX: 'hidden',
        padding: 0,
      },
      '& .react-select__value-container': {
        '& p': {
          overflow: 'visible',
        },
        fontSize: '0.875rem',
        overflow: 'hidden',
      },
      '& .select-placeholder': {
        opacity: 1,
        transition: theme.transitions.create(['opacity'], {
          duration: theme.transitions.duration.shortest,
        }),
      },
      '&.active': {
        '& .select-placeholder': {
          opacity: 0.5,
        },
      },
      alignItems: 'center',
      backgroundColor: theme.bg.app,
      borderRadius: 3,
      display: 'flex',
      flex: 1,
      height: 34,
      marginLeft: theme.spacing(1),
      padding: theme.spacing(1),
      position: 'relative' /* for search results */,
      [theme.breakpoints.down('md')]: {
        '&.active': {
          opacity: 1,
          visibility: 'visible',
          zIndex: 3,
        },
        backgroundColor: theme.bg.white,
        left: 0,
        margin: 0,
        opacity: 0,
        position: 'absolute',
        visibility: 'hidden',
        width: 'calc(100% - 100px)',
        zIndex: -1,
      },
      [theme.breakpoints.down('sm')]: {
        width: '100%',
      },
      transition: theme.transitions.create(['opacity']),
    },
    textfield: {
      '& input:focus': {
        outline: '1px dotted #606469',
      },
      flex: 1,
      margin: 0,
      minHeight: 'initial',
    },
    textfieldContainer: {
      [theme.breakpoints.down('md')]: {},
      width: '100%',
    },
  });

export default withStyles(styles);
