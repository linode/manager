import { styled } from '@mui/material';

import { EditableText } from 'src/components/EditableText/EditableText';
import { H1Header } from 'src/components/H1Header/H1Header';

export const StyledDiv = styled('div', { label: 'StyledDiv' })({
  display: 'flex',
  flexDirection: 'column',
});

export const StyledEditableText = styled(EditableText, {
  label: 'StyledEditableText',
})(({ theme }) => ({
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
