import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';

export const useSelectPlanQuantityStyles = makeStyles()((theme: Theme) => ({
  root: {
    padding: 0,
    paddingTop: theme.spacing(3),
  },
  copy: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(3),
  },
  disabledRow: {
    backgroundColor: theme.bg.tableHeader,
    cursor: 'not-allowed',
  },
  headingCellContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  chip: {
    backgroundColor: theme.color.green,
    color: '#fff',
    textTransform: 'uppercase',
    marginLeft: theme.spacing(2),
  },
  currentPlanChipCell: {
    width: '13%',
  },
  radioCell: {
    width: '5%',
    height: 55,
  },
  enhancedInputOuter: {
    display: 'flex',
    justifyContent: 'flex-end',
    [theme.breakpoints.down('md')]: {
      justifyContent: 'flex-start',
    },
    alignItems: 'center',
  },
  enhancedInputButton: {
    marginLeft: 10,
    minWidth: 85,
    paddingTop: 7,
    paddingBottom: 7,
    [theme.breakpoints.down('md')]: {
      minWidth: 80,
      paddingTop: 12,
      paddingBottom: 12,
      '& span': {
        color: '#fff !important',
      },
    },
  },
}));
