import { styled } from '@mui/material/styles';

import { TableRow, TableRowProps } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';
import { isPropValid } from 'src/utilities/isPropValid';

type StyledDisabledTableRowProps = Pick<TableRowProps, 'disabled'>;

export const StyledTypography = styled(Typography, {
  label: 'StyledTypography',
})(({ theme }) => ({
  '& a': {
    color: theme.textColors.linkActiveLight,
  },
  '& a:hover': {
    color: '#3683dc',
  },
  '& p': {
    fontFamily: '"LatoWebBold", sans-serif',
  },
  fontSize: '0.9em',
}));

export const StyledDisabledTableRow = styled(TableRow, {
  label: 'StyledDisabledTableRow',
  shouldForwardProp: (prop) => isPropValid(['disabled'], prop),
})<StyledDisabledTableRowProps>(({ theme, ...props }) => ({
  ...(props.disabled && {
    backgroundColor: theme.bg.tableHeader,
    cursor: 'not-allowed',
    opacity: 0.4,
  }),
  '&:focus-within': {
    backgroundColor: theme.bg.lightBlue1,
  },
}));
