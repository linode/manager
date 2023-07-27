import { Theme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';

// source of styling change for homepage of a linode row's ip link being slightly shifted upwards
// and the only thing that happened was the codemod :(
export const useStyles = makeStyles()((theme: Theme) => ({
  bodyRow: {
    height: 'auto',
  },
  ipCellWrapper: {
    '& *': {
      fontSize: '.875rem',
      paddingBottom: 0,
      paddingTop: 0,
    },
    '& button:hover': {
      backgroundColor: 'transparent',
    },
  },
  maintenanceOuter: {
    alignItems: 'center',
    display: 'flex',
  },
  maintenanceTooltip: {
    maxWidth: 300,
  },
  progressDisplay: {
    display: 'inline-block',
  },
  statusCellMaintenance: {
    '& .data': {
      alignItems: 'center',
      display: 'flex',
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
    [theme.breakpoints.up('md')]: {
      width: '20%',
    },
  },
  statusLink: {
    '& p': {
      color: theme.textColors.linkActiveLight,
      fontFamily: theme.font.bold,
    },
    backgroundColor: 'transparent',
    border: 'none',
    color: theme.textColors.linkActiveLight,
    cursor: 'pointer',
    padding: 0,
  },
}));
