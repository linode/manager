import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
  WithTheme,
} from 'src/components/core/styles';

export type StyleProps = WithStyles<ClassNames> & WithTheme;

type ClassNames =
  | 'bodyRow'
  | 'status'
  | 'statusCell'
  | 'statusCellMaintenance'
  | 'statusLink'
  | 'ipCell'
  | 'ipCellWrapper'
  | 'planCell'
  | 'progressDisplay'
  | 'regionCell'
  | 'tagCell'
  | 'maintenanceOuter'
  | 'vlan_Status'
  | 'maintenanceTooltip';

const styles = (theme: Theme) =>
  createStyles({
    bodyRow: {
      height: 'auto',
      '&:hover': {
        '& [data-qa-copy-ip]': {
          opacity: 1,
        },
      },
    },
    progressDisplay: {
      display: 'inline-block',
    },
    statusCell: {
      whiteSpace: 'nowrap',
      width: '17%',
    },
    status: {
      display: 'flex',
      alignItems: 'center',
    },
    statusCellMaintenance: {
      [theme.breakpoints.up('md')]: {
        width: '20%',
      },
      '& .data': {
        display: 'flex',
        alignItems: 'center',
        lineHeight: 1.2,
        marginRight: -12,
        [theme.breakpoints.up('md')]: {
          minWidth: 200,
        },
      },
      '& button': {
        color: theme.cmrTextColors.linkActiveLight,
        padding: '0 6px',
        position: 'relative',
      },
    },
    statusLink: {
      backgroundColor: 'transparent',
      border: 'none',
      color: theme.cmrTextColors.linkActiveLight,
      cursor: 'pointer',
      padding: 0,
      '& p': {
        color: theme.cmrTextColors.linkActiveLight,
        fontFamily: theme.font.bold,
      },
    },
    planCell: {
      whiteSpace: 'nowrap',
    },
    ipCell: {
      width: '14%',
    },
    ipCellWrapper: {
      display: 'inline-flex',
      flexDirection: 'column',

      '& *': {
        fontSize: '.875rem',
        paddingTop: 0,
        paddingBottom: 0,
      },
      '& [data-qa-copy-ip]': {
        opacity: 0,
      },
      '& svg': {
        marginTop: 2,
      },
    },
    regionCell: {
      width: '14%',
    },
    tagCell: {
      borderRight: 'none',
    },
    maintenanceOuter: {
      display: 'flex',
      alignItems: 'center',
    },

    // The "Status" cell in the VLAN Detail context.
    vlan_Status: {
      width: '14%',
    },
    maintenanceTooltip: {
      maxWidth: 300,
    },
  });

export default withStyles(styles, { withTheme: true });
