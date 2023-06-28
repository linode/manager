import * as React from 'react';
import { default as _Chip, ChipProps as _ChipProps } from '@mui/material/Chip';
import { styled } from '@mui/material/styles';

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
  outlineColor?: 'green' | 'gray';
}

export const Chip = ({
  outlineColor = 'gray',
  className,
  inTable,
  ...props
}: ChipProps) => {
  return (
    <StyledChip
      inTable={inTable}
      outlineColor={outlineColor}
      className={className}
      {...props}
    />
  );
};

const StyledChip = styled(_Chip, {
  label: 'StyledChip',
  shouldForwardProp(propName) {
    return propName !== 'inTable' && propName !== 'outlineColor';
  },
})<ChipProps>(({ theme, ...props }) => ({
  ...(props.inTable && {
    marginTop: 0,
    marginBottom: 0,
    marginLeft: theme.spacing(2),
    minHeight: theme.spacing(2),
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5),
  }),
  ...(props.variant === 'outlined' && {
    border: `1px solid ${props.outlineColor === 'green' ? '#02B159' : '#ccc'}`,
  }),
}));
