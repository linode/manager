import { Typography, omittedProps } from '@linode/ui';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';

import type { DescriptionListProps } from './DescriptionList';
import type { TypographyProps } from '@mui/material';
import type { GridProps } from '@mui/material/Grid';

interface StyledDLProps extends Omit<DescriptionListProps, 'items'> {
  component: GridProps['component'];
  gridColumns?: number;
  isStacked: boolean;
}

export const StyledDL = styled(Grid, {
  label: 'StyledDL',
  shouldForwardProp: omittedProps(['gridColumns', 'isStacked', 'displayMode']),
})<StyledDLProps>(({ ...props }) => ({
  '& dt, & dd': {
    fontSize: props.fontSize ? props.fontSize : '0.9rem',
  },
  display: 'flex',
  flexDirection: props.displayMode === 'column' ? 'column' : 'row',
  ...(props.displayMode === 'grid' &&
    !props.isStacked &&
    props.gridColumns &&
    props.gridColumns > 1 && {
      display: 'grid',
      gap: '0px 0px',
      gridTemplateColumns: `repeat(${props.gridColumns}, 1fr)`,
    }),
}));

export const StyledDLItemSeparator = styled(Grid, {
  label: 'StyledDLItemSeparator',
})(() => ({
  display: 'flex',
  flexWrap: 'wrap',
}));

export const StyledDT = styled(Typography, {
  label: 'StyledDT',
})<TypographyProps>(({ theme }) => ({
  font: theme.font.bold,
  marginRight: theme.spacing(0.75),
}));
