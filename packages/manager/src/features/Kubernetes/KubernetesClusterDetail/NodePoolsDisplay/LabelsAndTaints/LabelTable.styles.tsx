import { styled } from '@mui/material/styles';

import { Table } from 'src/components/Table';

export const StyledLabelTable = styled(Table, {
  label: 'StyledLabelTable',
})(({ theme }) => ({
  margin: `${theme.spacing()} 0 ${theme.spacing(1.5)}`,
}));
