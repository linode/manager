import { Theme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';

export const useMetricsDisplayStyles = makeStyles()((theme: Theme) => ({
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
    '& > button': {
      '&:before': {
        content: '""',
        display: 'inline-block',
        height: 20,
        marginRight: theme.spacing(1),
        width: 20,
      },
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'flex-start',
      [theme.breakpoints.down('sm')]: {
        padding: 0,
      },
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
    border: `1px solid ${theme.borderColors.borderTable}`,
  },
  yellow: {
    '&:before': {
      backgroundColor: theme.graphs.yellow,
    },
  },
}));
