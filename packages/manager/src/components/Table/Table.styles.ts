import { omittedProps } from '@linode/ui';
import { styled } from '@mui/material/styles';

import type { TableProps } from './Table';

export const StyledTableWrapper = styled('div', {
  label: 'StyledTableWrapper',
  shouldForwardProp: omittedProps([
    'noOverflow',
    'rowHoverState',
    'spacingBottom',
    'spacingTop',
  ]),
})<TableProps>(({ ...props }) => ({
  marginBottom: props.spacingBottom !== undefined ? props.spacingBottom : 0,
  marginTop: props.spacingTop !== undefined ? props.spacingTop : 0,
  ...(!props.noOverflow && {
    overflowX: 'auto',
    overflowY: 'hidden',
  }),
}));
