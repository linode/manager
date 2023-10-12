import { styled } from '@mui/material/styles';

import { omittedProps } from 'src/utilities/omittedProps';

import type { TableProps } from './Table';

export const StyledTableWrapper = styled('div', {
  label: 'StyledTableWrapper',
  shouldForwardProp: (prop) =>
    omittedProps(
      [
        'noBorder',
        'noOverflow',
        'rowHoverState',
        'spacingBottom',
        'spacingTop',
      ],
      prop
    ),
})<TableProps>(({ theme, ...props }) => ({
  marginBottom: props.spacingBottom !== undefined ? props.spacingBottom : 0,
  marginTop: props.spacingTop !== undefined ? props.spacingTop : 0,
  ...(!props.noOverflow && {
    '& thead': {
      '& th': {
        '&:first-of-type': {
          borderLeft: 'none',
        },
        '&:last-of-type': {
          borderRight: 'none',
        },
        backgroundColor: theme.bg.tableHeader,
        borderBottom: `2px solid ${theme.borderColors.borderTable}`,
        borderLeft: `1px solid ${theme.borderColors.borderTable}`,
        borderRight: `1px solid ${theme.borderColors.borderTable}`,
        borderTop: `2px solid ${theme.borderColors.borderTable}`,
        color: theme.textColors.tableHeader,
        fontFamily: theme.font.bold,
        padding: '10px 15px',
      },
    },
    overflowX: 'auto',
    overflowY: 'hidden',
  }),
  ...(props.noBorder && {
    '& thead th': {
      border: 0,
    },
  }),
  ...(props.rowHoverState && {
    '& tbody tr': {
      '&:hover': {
        backgroundColor: theme.bg.lightBlue1,
      },
    },
  }),
}));
