import { styled } from '@mui/material/styles';

import { Table } from 'src/components/Table';

export const StyledDiv = styled('div', {
  label: 'StyledDiv',
})(({ theme }) => ({
  '& .MuiAccordionDetails-root': {
    padding: 0,
  },
  marginBottom: theme.spacing(2),
}));

export const StyledTable = styled(Table, {
  label: 'StyledTable',
})({
  width: '100%',
});
