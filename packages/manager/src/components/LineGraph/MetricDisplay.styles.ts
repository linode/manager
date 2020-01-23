import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
  WithTheme
} from 'src/components/core/styles';

export type ClassNames =
  | 'root'
  | 'legend'
  | 'red'
  | 'yellow'
  | 'blue'
  | 'green'
  | 'text'
  | 'tableHeadInner'
  | 'simpleLegend'
  | 'simpleLegendRoot';

export type StyleProps = WithStyles<ClassNames> & WithTheme;

const styles = (theme: Theme) =>
  createStyles({
    root: {
      maxWidth: 600,
      '& *': {
        height: 'auto',
        border: 'none',
        backgroundColor: 'transparent'
      },
      '& td:first-child': {
        backgroundColor: 'transparent !important'
      },
      '& .data': {
        minWidth: 100
      },
      [theme.breakpoints.down('lg')]: {
        '& th, & td': {
          padding: '4px !important'
        }
      },
      [theme.breakpoints.down('sm')]: {
        maxWidth: '100%',
        '& td': {
          justifyContent: 'normal',
          minHeight: 'auto'
        }
      },
      [theme.breakpoints.only('xs')]: {
        '& tr:not(:first-child) td': {
          '&:first-child': {
            marginTop: theme.spacing(2)
          }
        }
      },
      [theme.breakpoints.only('sm')]: {
        '& tr:not(:nth-last-child(n+3)) td:first-child': {
          marginTop: theme.spacing(2)
        },
        '& tbody': {
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between'
        },
        '& tr': {
          flexBasis: '45%'
        }
      }
    },
    tableHeadInner: {
      paddingBottom: 4
    },
    red: {
      '&:before': {
        backgroundColor: theme.graphs.red
      }
    },
    purple: {
      '&:before': {
        backgroundColor: theme.graphs.purple
      }
    },
    yellow: {
      '&:before': {
        backgroundColor: theme.graphs.yellow
      }
    },
    blue: {
      '&:before': {
        backgroundColor: theme.graphs.blue
      }
    },
    green: {
      '&:before': {
        backgroundColor: theme.graphs.green
      }
    },
    legend: {
      [theme.breakpoints.up('md')]: {
        width: '38%'
      },
      '& > div': {
        display: 'flex',
        alignItems: 'center',
        '&:before': {
          content: '""',
          display: 'inline-block',
          width: 20,
          height: 20,
          marginRight: theme.spacing(1)
        }
      }
    },
    text: {
      color: theme.color.black
    },
    simpleLegendRoot: {
      maxWidth: 'initial',
      display: 'flex'
    },
    simpleLegend: {
      width: 'auto',
      marginTop: theme.spacing(2)
    }
  });

export default withStyles(styles, { withTheme: true });
