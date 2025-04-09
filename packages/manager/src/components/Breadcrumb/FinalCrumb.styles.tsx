import { EditableText, H1Header } from '@linode/ui';
import { styled } from '@mui/material';

import type { EditableTextProps } from '@linode/ui';

export const StyledDiv = styled('div', { label: 'StyledDiv' })({
  display: 'flex',
  flexDirection: 'column',
});

export const StyledEditableText = styled(EditableText, {
  label: 'StyledEditableText',
})<EditableTextProps>(({ theme }) => ({
  '& > div': {
    width: 250,
  },
  marginLeft: `-${theme.spacing()}`,
}));

export const StyledH1Header = styled(H1Header, { label: 'StyledH1Header' })(
  ({ theme }) => ({
    color: theme.textColors.tableStatic,
    fontSize: '1.125rem',
    textTransform: 'capitalize',
    [theme.breakpoints.up('lg')]: {
      fontSize: '1.125rem',
    },
  })
);
