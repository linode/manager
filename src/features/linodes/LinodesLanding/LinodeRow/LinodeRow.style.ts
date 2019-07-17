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
  | 'regionCell'
  | 'iconTableCell'
  | 'icon'
  | 'iconGridCell';

const styles = (theme: Theme) =>
  createStyles({
    actionCell: {
      width: '5%',
      textAlign: 'right',
      '& button': {
        width: 30
      },
      [theme.breakpoints.down('sm')]: {
        width: '100%'
      }
    },
    actionInner: {
      display: 'flex',
      justifyContent: 'flex-end'
    },
    bodyRow: {
      height: 'auto',
      '&:hover .backupIcon': {
        fill: theme.palette.primary.main
      }
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
    statusCell: {
      width: '14%',
      textTransform: 'capitalize',
      [theme.breakpoints.down('sm')]: {
        width: '100%'
      }
    },
    statusCellMaintenance: {
      '& .data': {
        display: 'flex',
        minWidth: 190,
        alignItems: 'center',
        lineHeight: 1.2,
        marginRight: -12,
        [theme.breakpoints.up('md')]: {
          minWidth: 125,
          marginRight: 0
        }
      },
      '& button': {
        padding: '0 6px',
        position: 'relative',
        top: 1,
        [theme.breakpoints.up('md')]: {
          padding: 6,
          top: 2
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
      flexDirection: 'column'
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
    }
  });

export default withStyles(styles, { withTheme: true });
