import { Theme } from '@mui/material/styles';
import { createStyles, withStyles, WithStyles, WithTheme } from '@mui/styles';

export type ClassNames =
  | 'root'
  | 'legend'
  | 'red'
  | 'yellow'
  | 'blue'
  | 'green'
  | 'lightGreen'
  | 'darkGreen'
  | 'text'
  | 'tableHeadInner';

export type StyleProps = WithStyles<ClassNames> & WithTheme;

const styles = (theme: Theme) =>
  createStyles({
    root: {
      maxWidth: 600,
      '& *': {
        height: 'auto',
        border: 'none',
        backgroundColor: 'transparent',
      },
      '& td:first-of-type': {
        backgroundColor: 'transparent !important',
      },
      '& .data': {
        minWidth: 100,
      },
      [theme.breakpoints.down('xl')]: {
        '& th, & td': {
          padding: '4px !important',
        },
      },
      [theme.breakpoints.down('md')]: {
        maxWidth: '100%',
        '& td': {
          justifyContent: 'normal',
          minHeight: 'auto',
        },
      },
      [theme.breakpoints.only('xs')]: {
        '& tr:not(:first-of-type) td': {
          '&:first-of-type': {
            marginTop: theme.spacing(2),
          },
        },
      },
      [theme.breakpoints.only('sm')]: {
        '& tr:not(:nth-last-child(n+3)) td:first-of-type': {
          marginTop: theme.spacing(2),
        },
        '& tbody': {
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        },
        '& tr': {
          flexBasis: '45%',
        },
      },
    },
    tableHeadInner: {
      paddingBottom: 4,
    },
    red: {
      '&:before': {
        backgroundColor: theme.graphs.red,
      },
    },
    purple: {
      '&:before': {
        backgroundColor: theme.graphs.purple,
      },
    },
    yellow: {
      '&:before': {
        backgroundColor: theme.graphs.yellow,
      },
    },
    blue: {
      '&:before': {
        backgroundColor: theme.graphs.blue,
      },
    },
    green: {
      '&:before': {
        backgroundColor: theme.graphs.green,
      },
    },
    lightGreen: {
      '&:before': {
        backgroundColor: theme.graphs.network.outbound,
      },
    },
    darkGreen: {
      '&:before': {
        backgroundColor: theme.graphs.network.inbound,
      },
    },
    legend: {
      [theme.breakpoints.up('md')]: {
        width: '38%',
      },
      '& > div': {
        display: 'flex',
        alignItems: 'center',
        '&:before': {
          content: '""',
          display: 'inline-block',
          width: 20,
          height: 20,
          marginRight: theme.spacing(1),
        },
      },
    },
    text: {
      color: theme.color.black,
    },
  });

export default withStyles(styles, { withTheme: true });
