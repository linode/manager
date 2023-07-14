import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  bodyRow: {
    '& [data-qa-copy-ip] button:focus > svg': {
      opacity: 1,
    },
    '&:hover': {
      '& [data-qa-copy-ip] button > svg': {
        opacity: 1,
      },
    },
    height: 'auto',
  },
  ipCellWrapper: {
    '& *': {
      fontSize: '.875rem',
      paddingBottom: 0,
      paddingTop: 0,
    },
    '& [data-qa-copy-ip] button > svg': {
      opacity: 0,
    },
    '& button:hover': {
      backgroundColor: 'transparent',
    },
    '& svg': {
      '&:hover': {
        color: theme.palette.primary.main,
      },
      marginTop: 2,
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
