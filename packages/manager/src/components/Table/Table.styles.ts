import { isPropValid } from 'src/utilities/isPropValid';
import { styled } from '@mui/material/styles';
import type { TableProps } from './Table';

export const StyledTableWrapper = styled('div', {
  label: 'StyledTableWrapper',
  shouldForwardProp: (prop) =>
    isPropValid(
      ['noBorder', 'noOverflow', 'spacingBottom', 'spacingTop'],
      prop
    ),
})<TableProps>(({ theme, ...props }) => ({
  marginBottom: props.spacingBottom !== undefined ? props.spacingBottom : 0,
  marginTop: props.spacingTop !== undefined ? props.spacingTop : 0,
  ...(!props.noOverflow && {
    overflowX: 'auto',
    overflowY: 'hidden',
    '& thead': {
      '& th': {
        backgroundColor: theme.bg.tableHeader,
        borderTop: `2px solid ${theme.borderColors.borderTable}`,
        borderRight: `1px solid ${theme.borderColors.borderTable}`,
        borderBottom: `2px solid ${theme.borderColors.borderTable}`,
        borderLeft: `1px solid ${theme.borderColors.borderTable}`,
        fontFamily: theme.font.bold,
        fontSize: '0.875em !important',
        color: theme.textColors.tableHeader,
        padding: '10px 15px',
        '&:first-of-type': {
          borderLeft: 'none',
        },
        '&:last-of-type': {
          borderRight: 'none',
        },
      },
    },
  }),
  ...(props.noBorder && {
    '& thead th': {
      border: 0,
    },
  }),
}));
