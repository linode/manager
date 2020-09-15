import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
  WithTheme
} from 'src/components/core/styles';

export type StyleProps = WithStyles<ClassNames> & WithTheme;

type ClassNames =
  | 'actionCell'
  | 'actionInner'
  | 'bodyRow'
  | 'statusCell'
  | 'statusCellMaintenance'
  | 'statusHelpIcon'
  | 'statusLink'
  | 'ipCell'
  | 'ipCellWrapper'
  | 'planCell'
  | 'progressDisplay'
  | 'regionCell'
  | 'tagCell'
  | 'maintenanceOuter';

const styles = (theme: Theme) =>
  createStyles({
    actionCell: {
      paddingTop: 0,
      paddingBottom: 0,
      paddingLeft: 0,
      width: '22%',
      textAlign: 'right',
      '&:last-child': {
        paddingRight: 0
      },
      [theme.breakpoints.down('sm')]: {
        width: '5%'
      }
    },
    actionInner: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginRight: 1,
      '& a': {
        lineHeight: '1rem'
      }
    },
    bodyRow: {
      height: 'auto'
    },
    progressDisplay: {
      display: 'inline-block'
    },
    statusCell: {
      whiteSpace: 'nowrap',
      width: '17%'
    },
    statusCellMaintenance: {
      [theme.breakpoints.up('md')]: {
        width: '20%'
      },
      '& .data': {
        display: 'flex',
        alignItems: 'center',
        lineHeight: 1.2,
        marginRight: -12,
        [theme.breakpoints.up('md')]: {
          minWidth: 200
        }
      },
      '& button': {
        padding: '0 6px',
        position: 'relative',
        top: 1
      }
    },
    statusHelpIcon: {
      position: 'relative',
      top: -2
    },
    statusLink: {
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      padding: 0,
      '& p': {
        color: theme.palette.primary.main,
        fontFamily: theme.font.bold
      }
    },
    ipCell: {
      width: '14%'
    },
    ipCellWrapper: {
      display: 'inline-flex',
      flexDirection: 'column',

      '& *': {
        fontSize: '.875rem',
        paddingBottom: 0
      }
    },
    regionCell: {
      width: '14%'
    },
    tagCell: {
      borderRight: 'none'
    },
    maintenanceOuter: {
      display: 'flex',
      alignItems: 'center'
    }
  });

export default withStyles(styles, { withTheme: true });
