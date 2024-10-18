import { Box, omittedProps } from '@linode/ui';
import { styled } from '@mui/material/styles';

import DragIndicator from 'src/assets/icons/drag-indicator.svg';
import { Button } from 'src/components/Button/Button';
import { StyledLinkButton } from 'src/components/Button/StyledLinkButton';
import { TableRow } from 'src/components/TableRow';

import type { FirewallRuleTableRowProps } from './FirewallRuleTable';

type StyledFirewallRuleButtonProps = Pick<FirewallRuleTableRowProps, 'status'>;

interface FirewallRuleTableRowPropsWithRuleIndex
  extends Pick<FirewallRuleTableRowProps, 'disabled' | 'originalIndex'> {
  ruleIndex: number;
}

interface StyledFirewallRuleTableRowProps
  extends FirewallRuleTableRowPropsWithRuleIndex {
  status: FirewallRuleTableRowProps['status'];
}

export const StyledTableRow = styled(TableRow, {
  label: 'StyledTableRow',
  shouldForwardProp: omittedProps(['originalIndex', 'ruleIndex']),
})<StyledFirewallRuleTableRowProps>(
  ({ disabled, originalIndex, ruleIndex, status, theme }) => ({
    cursor: 'grab',
    // Conditional styles
    // Highlight the row if it's been modified or reordered. ruleIndex is the current index,
    // so if it doesn't match the original index we know that the rule has been moved.
    ...(status === 'PENDING_DELETION' || disabled
      ? {
          '& td': { color: '#D2D3D4' },
          backgroundColor: 'rgba(247, 247, 247, 0.25)',
        }
      : {}),
    ...(status === 'MODIFIED' || status === 'NEW' || originalIndex !== ruleIndex
      ? { backgroundColor: theme.bg.lightBlue1 }
      : {}),
    ...(status === 'NOT_MODIFIED' ? { backgroundColor: theme.bg.bgPaper } : {}),
  })
);

export const StyledInnerBox = styled(Box, { label: 'StyledInnerBox' })(
  ({ theme }) => ({
    backgroundColor: theme.bg.tableHeader,
    fontFamily: theme.font.bold,
    fontSize: '.875rem',
  })
);

export const StyledFirewallRuleButton = styled('button', {
  label: 'StyledFirewallRuleButton',
})<StyledFirewallRuleButtonProps>(({ status, theme }) => ({
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',

  // Conditional styles
  ...(status !== 'PENDING_DELETION'
    ? { backgroundColor: theme.bg.lightBlue1 }
    : {}),
}));

export const StyledFirewallTableButton = styled(Button, {
  label: 'StyledFirewallTableButton',
})(({ theme }) => ({
  margin: `${theme.spacing(1)} 0px`,
}));

export const MoreStyledLinkButton = styled(StyledLinkButton, {
  label: 'MoreStyledLinkButton',
})(({ ...props }) => ({
  color: props.disabled ? 'inherit' : '',
}));

export const StyledButtonDiv = styled('div', { label: 'StyledButtonDiv' })({
  alignContent: 'center',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
});

export const StyledErrorDiv = styled('div', { label: 'StyledErrorDiv' })(
  ({ theme }) => ({
    '& p': { color: theme.color.red },
  })
);

export const StyledHeaderDiv = styled('div', { label: 'StyledHeaderDiv' })(
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

export const StyledDragIndicator = styled(DragIndicator, {
  label: 'StyledDragIndicator',
})(({ theme }) => ({
  color: theme.color.grey8,
  marginRight: theme.spacing(1.5),
  position: 'relative',
  top: 2,
}));
