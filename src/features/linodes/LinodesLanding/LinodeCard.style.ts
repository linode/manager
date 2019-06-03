import { WithStyles, WithTheme } from '@material-ui/core/styles';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';

type ClassNames =
  | 'customeMQ'
  | 'cardSection'
  | 'flexContainer'
  | 'cardHeader'
  | 'cardContent'
  | 'cardLoadingContainer'
  | 'distroIcon'
  | 'rightMargin'
  | 'actionMenu'
  | 'cardActions'
  | 'button'
  | 'consoleButton'
  | 'rebootButton'
  | 'loadingStatusText'
  | 'flag'
  | 'flagContainer'
  | 'linkWrapper'
  | 'StatusIndicatorWrapper'
  | 'link'
  | 'statusProgress'
  | 'statusText'
  | 'wrapHeader';

export type StyleProps = WithStyles<ClassNames> & WithTheme;

const styles = (theme: Theme) =>
  createStyles({
    customeMQ: {
      '@media (min-width: 600px) and (max-width: 680px)': {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2)
      },
      '@media (min-width: 1280px) and (max-width: 1400px)': {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2)
      }
    },
    cardSection: {
      ...theme.typography.body1,
      marginBottom: theme.spacing(1),
      paddingTop: theme.spacing(1),
      paddingLeft: 3,
      paddingRight: 3,
      color: theme.palette.text.primary
    },
    flexContainer: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      position: 'relative',
      '& .title': {
        minHeight: 48,
        padding: `0 ${theme.spacing(3)}px`
      }
    },
    cardHeader: {
      fontFamily: theme.font.bold,
      color: 'black',
      marginLeft: theme.spacing(1),
      // This is necessary for text to ellipsis responsively
      // without the need for a hard set width value that won't play well with flexbox.
      minWidth: 0
    },
    cardContent: {
      flex: 1,
      [theme.breakpoints.up('sm')]: {
        minHeight: 230
      }
    },
    cardLoadingContainer: {
      display: 'flex',
      alignItems: 'center',
      height: '100%'
    },
    distroIcon: {
      marginTop: theme.spacing(1),
      width: theme.spacing(3)
    },
    rightMargin: {
      marginRight: theme.spacing(1)
    },
    actionMenu: {
      position: 'relative',
      top: 9,
      '& button': {
        height: 48
      }
    },
    cardActions: {
      backgroundColor: theme.bg.offWhite,
      padding: 0
    },
    button: {
      padding: '12px 12px 14px',
      height: '100%',
      margin: 0,
      borderTop: `1px solid ${theme.palette.divider}`,
      fontFamily: 'LatoWeb',
      fontSize: '.9rem',
      transition: theme.transitions.create(['background-color', 'color']),
      '&:hover': {
        backgroundColor: theme.palette.primary.main,
        color: 'white'
      },
      '&:focus': {
        outline: '1px dotted #999'
      }
    },
    consoleButton: {
      width: '50%',
      /** @todo This was theme.pale, which doesnt exist. */
      // borderColor: theme.pale,
      borderRight: '1px solid ' + theme.palette.divider
    },
    rebootButton: {
      width: '50%'
    },
    loadingStatusText: {
      fontSize: '1.1rem',
      textTransform: 'capitalize',
      position: 'relative',
      top: -theme.spacing(2)
    },
    flagContainer: {
      padding: 0,
      position: 'relative',
      zIndex: 5
    },
    flag: {
      transition: theme.transitions.create('opacity'),
      opaity: 1,
      '&:hover': {
        opacity: 0.75
      }
    },
    link: {
      position: 'absolute',
      left: 0,
      top: 0,
      height: 48,
      width: '100%',
      '&:hover': {
        backgroundColor: 'transparent',
        '& + .title h3': {
          color: theme.palette.primary.main
        }
      }
    },
    StatusIndicatorWrapper: {
      position: 'relative',
      top: 2
    },
    linkWrapper: {
      display: 'flex',
      alignItems: 'center',
      flex: 1,
      // This is necessary for text to ellipsis responsively without the need for a hard set width value that won't play well with flexbox.
      minWidth: 0
    },
    wrapHeader: {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    statusProgress: {
      paddingRight: 0,
      paddingTop: 6
    },
    statusText: {}
  });

export default withStyles(styles, { withTheme: true });
