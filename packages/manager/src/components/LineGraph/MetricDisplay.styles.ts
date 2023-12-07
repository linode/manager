import { Theme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';

export const useMetricsDiaplyStyles = makeStyles()((theme: Theme) => ({
  blue: {
    '&:before': {
      backgroundColor: theme.graphs.blue,
    },
  },
  darkGreen: {
    '&:before': {
      backgroundColor: theme.graphs.network.inbound,
    },
  },
  green: {
    '&:before': {
      backgroundColor: theme.graphs.green,
    },
  },
  legend: {
    '& > div': {
      '&:before': {
        content: '""',
        display: 'inline-block',
        height: 20,
        marginRight: theme.spacing(1),
        width: 20,
      },
      alignItems: 'center',
      display: 'flex',
    },
    [theme.breakpoints.up('md')]: {
      width: '38%',
    },
  },
  lightGreen: {
    '&:before': {
      backgroundColor: theme.graphs.network.outbound,
    },
  },
  purple: {
    '&:before': {
      backgroundColor: theme.graphs.purple,
    },
  },
  red: {
    '&:before': {
      backgroundColor: theme.graphs.red,
    },
  },
  root: {
    '& *': {
      backgroundColor: 'transparent',
      border: 'none',
      height: 'auto',
    },
    '& .data': {
      minWidth: 100,
    },
    '& td:first-of-type': {
      backgroundColor: 'transparent !important',
    },
    maxWidth: 600,
    [theme.breakpoints.down('md')]: {
      '& td': {
        justifyContent: 'normal',
        minHeight: 'auto',
      },
      maxWidth: '100%',
    },
    [theme.breakpoints.down('xl')]: {
      '& th, & td': {
        padding: '4px !important',
      },
    },
    [theme.breakpoints.only('sm')]: {
      '& tbody': {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
      },
      '& tr': {
        flexBasis: '45%',
      },
      '& tr:not(:nth-last-child(n+3)) td:first-of-type': {
        marginTop: theme.spacing(2),
      },
    },
    [theme.breakpoints.only('xs')]: {
      '& tr:not(:first-of-type) td': {
        '&:first-of-type': {
          marginTop: theme.spacing(2),
        },
      },
    },
  },
  tableHeadInner: {
    paddingBottom: 4,
  },
  text: {
    color: theme.color.black,
  },
  yellow: {
    '&:before': {
      backgroundColor: theme.graphs.yellow,
    },
  },
}));
