import { StyledLinkButton } from '@linode/ui';
import { Notice } from '@linode/ui';
import { styled } from '@mui/material/styles';

export const StyledNotice = styled(Notice, { label: 'StyledNotice' })(
  ({ theme }) => ({
    '&&': {
      p: {
        lineHeight: '1.25rem',
      },
    },
    alignItems: 'center',
    background: theme.bg.bgPaper,
    borderRadius: 1,
    display: 'flex',
    flexFlow: 'row nowrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(),
    padding: theme.spacing(2),
  })
);

export const StyledButton = styled(StyledLinkButton, { label: 'StyledButton' })(
  ({ theme }) => ({
    color: theme.textColors.tableStatic,
    display: 'flex',
    marginLeft: 20,
  })
);
