import { styled } from '@mui/material/styles';
import { Button } from 'src/components/Button/Button';
import { StyledLinkButton } from 'src/components/Button/StyledLinkButton';
import DragIndicator from 'src/assets/icons/drag-indicator.svg';
import Box from '@mui/material/Box';
import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';

export const useStyles = makeStyles()((theme: Theme) => ({
  disabled: {
    '& td': {
      color: '#D2D3D4',
    },
    backgroundColor: 'rgba(247, 247, 247, 0.25)',
  },
  highlight: {
    backgroundColor: theme.bg.lightBlue1,
  },
  ruleGrid: {
    margin: 0,
    width: '100%',
  },
  ruleRow: {
    borderBottom: `1px solid ${theme.borderColors.borderTable}`,
    color: theme.textColors.tableStatic,
  },
  undoButton: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },
  unmodified: {
    backgroundColor: theme.bg.bgPaper,
  },
}));

export const sxBox = {
  alignItems: 'center',
  display: 'flex',
  width: '100%',
};

export const sxItemSpacing = {
  padding: `0 8px`,
};

export const StyledButton = styled(Button, { label: 'StyledButton' })({
  margin: '8px 0px',
});

export const MoreStyledLinkButton = styled(StyledLinkButton, {
  label: 'MoreStyledLinkButton',
})(({ theme, ...props }) => ({
  color: props.disabled ? 'inherit' : '',
}));

// const Disabled = styled(Grid, { name: 'Disabled' })(({ theme }) => ({
//   '& td': {
//     color: '#D2D3D4',
//   },
//   backgroundColor: 'rgba(247, 247, 247, 0.25)',
// }));

export const StyledDragIndicator = styled(DragIndicator, {
  name: 'StyledDragIndicator',
})(({ theme }) => ({
  color: theme.color.grey8,
  marginRight: theme.spacing(1.5),
  position: 'relative',
  top: 2,
}));

export const StyledErrorDiv = styled('div', { name: 'StyledErrorDiv' })(
  ({ theme }) => ({
    '& p': { color: theme.color.red },
  })
);

export const StyledHeaderDiv = styled('div', { name: 'StyledHeaderDiv' })(
  ({ theme }) => ({
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    [theme.breakpoints.down('md')]: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
  })
);

// const Highlight = styled(Grid, { name: 'Highlight' })(({ theme }) => ({
//   backgroundColor: theme.bg.lightBlue1,
// }));

// const RuleGrid = styled(Grid, { name: 'RuleGrid' })({
//   margin: 0,
//   width: '100%',
// });

export const StyledBox = styled(Box, { name: 'StyledBox' })(({ theme }) => ({
  backgroundColor: theme.bg.tableHeader,
  color: theme.textColors.tableHeader,
  fontSize: '.875rem',
  fontWeight: 'bold',
  height: '46px',
}));

export const StyledUl = styled('ul', { name: 'StyledUl' })(({ theme }) => ({
  backgroundColor: theme.color.border3,
  listStyle: 'none',
  margin: 0,
  paddingLeft: 0,
  width: '100%',
}));

// const RuleRow = styled(Grid, { name: 'RuleRow' })(({ theme }) => ({
//   borderBottom: `1px solid ${theme.borderColors.borderTable}`,
//   color: theme.textColors.tableStatic,
// }));

// const UndoButton = styled(Grid, { name: 'UndoButton' })({
//   backgroundColor: 'transparent',
//   border: 'none',
//   cursor: 'pointer',
// });

export const StyledButtonDiv = styled('div', { name: 'StyledButtonDiv' })({
  alignContent: 'center',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
});

// const Unmodified = styled(Grid, { name: 'Unmodified' })(({ theme }) => ({
//   backgroundColor: theme.bg.bgPaper,
// }));
