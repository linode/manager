import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme: Theme) => ({
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
  ipCellWrapper: {
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
  maintenanceOuter: {
    display: 'flex',
    alignItems: 'center',
  },
  maintenanceTooltip: {
    maxWidth: 300,
  },
}));
