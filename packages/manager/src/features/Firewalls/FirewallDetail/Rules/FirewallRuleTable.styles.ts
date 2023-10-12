import { styled } from '@mui/material/styles';
import { Button } from 'src/components/Button/Button';
import { StyledLinkButton } from 'src/components/Button/StyledLinkButton';
import DragIndicator from 'src/assets/icons/drag-indicator.svg';
import { Box } from 'src/components/Box';
import { omittedProps } from 'src/utilities/omittedProps';
import type { FirewallRuleTableRowProps } from './FirewallRuleTable';

type StyledFirewallRuleButtonProps = Pick<FirewallRuleTableRowProps, 'status'>;

type StyledFirewallRuleBoxProps = StyledFirewallRuleButtonProps &
  Pick<FirewallRuleTableRowProps, 'disabled' | 'originalIndex'> & {
    ruleId: number;
  };

export const sxBox = {
  alignItems: 'center',
  display: 'flex',
  width: '100%',
};

export const sxItemSpacing = {
  padding: `0 8px`,
};

export const StyledFirewallRuleBox = styled(Box, {
  label: 'StyledFirewallRuleBox',
  shouldForwardProp: (prop) => omittedProps(['originalIndex', 'ruleId'], prop),
})<StyledFirewallRuleBoxProps>(
  ({ theme, status, disabled, originalIndex, ruleId }) => ({
    margin: 0,
    fontSize: '0.875rem',
    borderBottom: `1px solid ${theme.borderColors.borderTable}`,
    color: theme.textColors.tableStatic,
    ...sxBox,

    // Conditional styles
    // Highlight the row if it's been modified or reordered. ID is the current index,
    // so if it doesn't match the original index we know that the rule has been moved.
    ...(status === 'PENDING_DELETION' || disabled
      ? {
          '& td': { color: '#D2D3D4' },
          backgroundColor: 'rgba(247, 247, 247, 0.25)',
        }
      : {}),
    ...(status === 'MODIFIED' || status === 'NEW' || originalIndex !== ruleId
      ? { backgroundColor: theme.bg.lightBlue1 }
      : {}),
    ...(status === 'NOT_MODIFIED' ? { backgroundColor: theme.bg.bgPaper } : {}),
  })
);

export const StyledInnerBox = styled(Box, { label: 'StyledInnerBox' })(
  ({ theme }) => ({
    backgroundColor: theme.bg.tableHeader,
    color: theme.textColors.tableHeader,
    fontSize: '.875rem',
    fontWeight: 'bold',
    height: '46px',
  })
);

export const StyledUlBox = styled(Box, { label: 'StyledUlBox' })(
  ({ theme }) => ({
    backgroundColor: theme.bg.bgPaper,
    borderBottom: `1px solid ${theme.borderColors.borderTable}`,
    color: theme.textColors.tableStatic,
    alignItems: 'center',
    display: 'flex',
    fontSize: '0.875rem',
    justifyContent: 'center',
    padding: theme.spacing(1),
    width: '100%',
  })
);

export const StyledFirewallRuleButton = styled('button', {
  label: 'StyledFirewallRuleButton',
})<StyledFirewallRuleButtonProps>(({ theme, status }) => ({
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
})(({ theme, ...props }) => ({
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

export const StyledUl = styled('ul', { label: 'StyledUl' })(({ theme }) => ({
  backgroundColor: theme.color.border3,
  listStyle: 'none',
  margin: 0,
  paddingLeft: 0,
  width: '100%',
}));
