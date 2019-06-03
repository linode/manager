import { WithStyles, WithTheme } from '@material-ui/core/styles';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';

export type StyleProps = WithStyles<ClassNames> & WithTheme;

type ClassNames =
  | 'actionCell'
  | 'actionInner'
  | 'bodyRow'
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
    ipCell: {
      width: '15%',
      [theme.breakpoints.down('sm')]: {
        width: '100%'
      }
    },
    ipCellWrapper: {
      display: 'inline-flex',
      flexDirection: 'column'
    },
    planCell: {
      width: '15%',
      [theme.breakpoints.down('sm')]: {
        width: '100%'
      }
    },
    regionCell: {
      width: '15%',
      [theme.breakpoints.down('sm')]: {
        width: '100%'
      }
    }
  });

export default withStyles(styles, { withTheme: true });
