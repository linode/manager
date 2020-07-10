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
  | 'ipCell'
  | 'ipCellWrapper'
  | 'planCell'
  | 'progressDisplay'
  | 'regionCell'
  | 'iconTableCell'
  | 'icon'
  | 'iconGridCell'
  | 'tagCell';

const styles = (theme: Theme) =>
  createStyles({
    actionCell: {
      paddingTop: 0,
      paddingBottom: 0,
      paddingLeft: 0,
      width: '22%',
      textAlign: 'right',
      [theme.breakpoints.down('sm')]: {
        width: '100%'
      },
      '&:last-child': {
        paddingRight: 0
      }
    },
    actionInner: {
      display: 'flex',
      justifyContent: 'flex-end',
      '& a': {
        lineHeight: '1rem'
      }
    },
    bodyRow: {
      height: 'auto'
    },
    iconTableCell: {
      [theme.breakpoints.up('md')]: {
        width: '4%',
        padding: 4
      }
    },
    icon: {
      position: 'relative',
      top: 1,
      width: 40,
      height: 40,
      '& .circle': {
        fill: theme.bg.offWhiteDT
      },
      '& .outerCircle': {
        stroke: theme.bg.main
      }
    },
    iconGridCell: {
      display: 'flex',
      alignItems: 'center',
      padding: 4
    },
    progressDisplay: {
      display: 'inline-block'
    },
    statusCell: {
      whiteSpace: 'nowrap',
      width: '17%',
      [theme.breakpoints.down('sm')]: {
        width: '100%'
      }
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
        [theme.breakpoints.down('sm')]: {
          minWidth: 200,
          justifyContent: 'flex-end'
        },
        [theme.breakpoints.up('md')]: {
          minWidth: 200
        }
      },
      '& button': {
        padding: '0 6px',
        position: 'relative',
        top: 1,
        [theme.breakpoints.up('md')]: {
          padding: 6
        }
      }
    },
    statusHelpIcon: {
      position: 'relative',
      top: -2
    },
    ipCell: {
      width: '14%',
      [theme.breakpoints.down('sm')]: {
        width: '100%'
      }
    },
    ipCellWrapper: {
      display: 'inline-flex',
      flexDirection: 'column',

      '& *': {
        fontSize: '.875rem',
        paddingBottom: 0
      }
    },
    planCell: {
      width: '14%',
      [theme.breakpoints.down('sm')]: {
        width: '100%'
      }
    },
    regionCell: {
      width: '14%',
      [theme.breakpoints.down('sm')]: {
        width: '100%'
      }
    },
    tagCell: {
      borderRight: 'none'
    }
  });

export default withStyles(styles, { withTheme: true });
