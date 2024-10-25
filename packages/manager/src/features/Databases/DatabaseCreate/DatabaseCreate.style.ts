import { makeStyles } from 'tss-react/mui';

import type { Theme } from '@mui/material';

export const useStyles = makeStyles()((theme: Theme) => ({
  btnCtn: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      alignItems: 'flex-end',
      flexDirection: 'column',
      marginTop: theme.spacing(),
    },
  },
  chip: {
    marginLeft: 6,
    marginTop: 4,
  },
  createBtn: {
    [theme.breakpoints.down('md')]: {
      marginRight: theme.spacing(),
    },
    whiteSpace: 'nowrap',
  },
  createText: {
    marginLeft: theme.spacing(),
    marginRight: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      marginRight: 0,
      padding: theme.spacing(),
    },
  },
  disabledOptionLabel: {
    color:
      theme.palette.mode === 'dark' ? theme.color.grey6 : theme.color.grey1,
  },
  engineSelect: {
    '& .react-select__option--is-focused': {
      '&:not(.react-select__option--is-selected)': {
        '& svg': {
          filter: 'brightness(0) invert(1)',
        },
      },
    },
  },
  formControlLabel: {
    marginBottom: theme.spacing(),
  },
  labelToolTipCtn: {
    '& strong': {
      padding: 8,
    },
    '& ul': {
      margin: '4px',
    },
  },
  nodeHelpIcon: {
    marginTop: '-2px',
    padding: '0px 0px 0px 2px',
  },
  nodeSpanSpacing: {
    marginRight: theme.spacing(1),
  },
  notice: {
    fontSize: 15,
    lineHeight: '18px',
  },
  selectPlanPanel: {
    margin: 0,
    padding: 0,
  },
  summarySpanBorder: {
    borderRight: `1px solid ${theme.borderColors.borderTypography}`,
    color: theme.textColors.tableStatic,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  tooltip: {
    '& .MuiTooltip-tooltip': {
      [theme.breakpoints.up('md')]: {
        minWidth: 350,
      },
    },
  },
}));
