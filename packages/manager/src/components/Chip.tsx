import { default as _Chip, ChipProps as _ChipProps } from '@mui/material/Chip';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { isPropValid } from 'src/utilities/isPropValid';

export interface ChipProps extends _ChipProps {
  /**
   * Optional component to render instead of a span.
   */
  component?: string;
  /**
   * If true, the chip will inherit styles to allow for use in a table.
   * @default false
   */
  inTable?: boolean;
  /**
   * The color of the outline when the variant is outlined.
   * @default 'gray'
   */
  outlineColor?: 'gray' | 'green';
}

export const Chip = ({
  className,
  inTable,
  outlineColor = 'gray',
  ...props
}: ChipProps) => {
  return (
    <StyledChip
      className={className}
      inTable={inTable}
      outlineColor={outlineColor}
      {...props}
    />
  );
};

const StyledChip = styled(_Chip, {
  label: 'StyledChip',
  shouldForwardProp: (prop) => isPropValid(['inTable', 'outlineColor'], prop),
})<ChipProps>(({ theme, ...props }) => ({
  ...(props.inTable && {
    marginBottom: 0,
    marginLeft: theme.spacing(2),
    marginTop: 0,
    minHeight: theme.spacing(2),
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5),
  }),
  ...(props.variant === 'outlined' && {
    border: `1px solid ${props.outlineColor === 'green' ? '#02B159' : '#ccc'}`,
  }),
}));
