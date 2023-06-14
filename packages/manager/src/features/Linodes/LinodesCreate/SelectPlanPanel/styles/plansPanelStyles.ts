import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';

export const useSelectPlanPanelStyles = makeStyles()((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(3),
    width: '100%',
  },
  copy: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(3),
  },
  disabledRow: {
    backgroundColor: theme.bg.tableHeader,
    cursor: 'not-allowed',
    opacity: 0.4,
  },
  table: {
    borderLeft: `1px solid ${theme.borderColors.borderTable}`,
    borderRight: `1px solid ${theme.borderColors.borderTable}`,
    overflowX: 'hidden',
  },
  headingCellContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  headerCell: {
    borderTop: `1px solid ${theme.borderColors.borderTable} !important`,
    borderBottom: `1px solid ${theme.borderColors.borderTable} !important`,
    '&.emptyCell': {
      borderRight: 'none',
    },
    '&:not(.emptyCell)': {
      borderLeft: 'none !important',
    },
    '&:last-child': {
      paddingRight: 15,
    },
  },
  chip: {
    backgroundColor: theme.color.green,
    color: '#fff',
    textTransform: 'uppercase',
    marginLeft: theme.spacing(2),
  },
  radioCell: {
    height: theme.spacing(6),
    width: '5%',
    paddingRight: 0,
  },
  focusedRow: {
    '&:focus-within': {
      backgroundColor: theme.bg.lightBlue1,
    },
  },
  gpuGuideLink: {
    fontSize: '0.9em',
    '& a': {
      color: theme.textColors.linkActiveLight,
    },
    '& a:hover': {
      color: '#3683dc',
    },
    '& p': {
      fontFamily: '"LatoWebBold", sans-serif',
    },
  },
}));
