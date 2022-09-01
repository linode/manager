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
        backgroundColor: theme.bg.lightBlue1,
        '& [data-qa-copy-ip] button > svg': {
          opacity: 1,
        },
      },
      '& [data-qa-copy-ip] button:focus > svg': {
        opacity: 1,
      },
    },
    progressDisplay: {
      display: 'inline-block',
    },
    statusCell: {
      width: '17%',
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
        color: theme.textColors.linkActiveLight,
        padding: '0 6px',
        position: 'relative',
      },
    },
    statusLink: {
      backgroundColor: 'transparent',
      border: 'none',
      color: theme.textColors.linkActiveLight,
      cursor: 'pointer',
      padding: 0,
      '& p': {
        color: theme.textColors.linkActiveLight,
        fontFamily: theme.font.bold,
      },
    },
    planCell: {
      whiteSpace: 'nowrap',
    },
    ipCell: {
      paddingRight: 0,
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
      '& button:hover': {
        backgroundColor: 'transparent',
      },
      '& [data-qa-copy-ip] button > svg': {
        opacity: 0,
      },
      '& svg': {
        marginTop: 2,
        '&:hover': {
          color: theme.palette.primary.main,
        },
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
