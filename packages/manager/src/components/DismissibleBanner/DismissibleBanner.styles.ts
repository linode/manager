import { styled } from '@mui/material/styles';

import { Notice } from 'src/components/Notice/Notice';

export const StyledNotice = styled(Notice)(({ theme }) => ({
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
}));

export const StyledButton = styled('button')(({ theme }) => ({
  ...theme.applyLinkStyles,
  color: theme.textColors.tableStatic,
  display: 'flex',
  marginLeft: 20,
}));
