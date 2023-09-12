import { styled } from '@mui/material/styles';

import { Table } from 'src/components/Table';

export const StyledDiv = styled('div', { label: 'StyledDiv' })({
  alignItems: 'center',
  display: 'flex',
  flexFlow: 'row nowrap',
  wordBreak: 'break-all',
});

export const StyledTable = styled(Table, { label: 'StyledTable' })(
  ({ theme }) => ({
    '& tbody': {
      transition: theme.transitions.create(['opacity']),
    },
    '& tbody.sorting': {
      opacity: 0.5,
    },
    '& thead': {
      '& th': {
        '&:first-of-type': {
          borderLeft: 'none',
        },
        '&:last-of-type': {
          borderRight: 'none',
        },
        borderBottom: `2px solid ${theme.color.grey9}`,
        borderLeft: `1px solid ${theme.color.grey9}`,
        borderRight: `1px solid ${theme.color.grey9}`,
        borderTop: `2px solid ${theme.color.grey9}`,
        color: theme.palette.text.primary,
        fontFamily: theme.font.bold,
        fontSize: '0.875em',
        padding: '10px 15px',
      },
    },
  })
);
