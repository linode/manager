import { omittedProps } from '@linode/ui';
import { styled } from '@mui/material/styles';

import type { TableProps } from './Table';

export const StyledTableWrapper = styled('div', {
  label: 'StyledTableWrapper',
  shouldForwardProp: omittedProps([
    'noBorder',
    'noOverflow',
    'rowHoverState',
    'spacingBottom',
    'spacingTop',
  ]),
})<TableProps>(({ theme, ...props }) => ({
  marginBottom: props.spacingBottom !== undefined ? props.spacingBottom : 0,
  marginTop: props.spacingTop !== undefined ? props.spacingTop : 0,
  ...(!props.noOverflow && {
    overflowX: 'auto',
    overflowY: 'hidden',
  }),
  // TODO: DO this????????  CHECK PLEASE
  ...(props.noBorder &&
    {
      // '& thead th': {
      //   border: 0,
      // },
    }),
}));
