import { StyleRulesCallback, withStyles, WithStyles, WithTheme } from 'src/components/core/styles';

export type StyleProps = WithStyles<ClassNames> & WithTheme;

type ClassNames =
  'actionCell'
  | 'actionInner'
  | 'bodyRow'
  | 'ipCell'
  | 'ipCellWrapper'
  | 'planCell'
  | 'regionCell'

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  actionCell: {
    width: '5%',
    textAlign: 'right',
    '& button': {
      width: 30,
    },
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    },
  },
  actionInner: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  bodyRow: {
    height: 77,
    backgroundColor: theme.bg.white,
    '&:hover .backupIcon': {
      fill: theme.palette.primary.main,
    },
  },
  ipCell: {
    width: '25%',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    },
  },
  ipCellWrapper: {
    display: 'inline-flex',
    flexDirection: 'column',
  },
  planCell: {
    width: '15%',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    },
  },
  regionCell: {
    width: '10%',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    },
  },
});

export default withStyles(styles, { withTheme: true });;
