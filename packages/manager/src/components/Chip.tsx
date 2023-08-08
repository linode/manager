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

  /**
   * If true, default pill styles will be applied to the chip.
   */
  pill?: boolean;
}

export const Chip = ({
  className,
  inTable,
  outlineColor = 'gray',
  pill,
  ...props
}: ChipProps) => {
  return (
    <StyledChip
      className={className}
      inTable={inTable}
      outlineColor={outlineColor}
      pill={pill}
      {...props}
    />
  );
};

const StyledChip = styled(_Chip, {
  label: 'StyledChip',
  shouldForwardProp: (prop) =>
    isPropValid(['inTable', 'outlineColor', 'pill'], prop),
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
  ...(props.pill && {
    '&:before': {
      borderRadius: '50%',
      content: '""',
      display: 'inline-block',
      height: theme.spacing(2),
      marginRight: theme.spacing(1),
      minWidth: theme.spacing(2),
      width: theme.spacing(2),
    },
    backgroundColor: 'transparent',
    fontSize: '1rem',
    padding: 0,
    fontFamily: theme.font.bold,
    ...(theme.name === 'dark'
      ? {
          [theme.breakpoints.down('sm')]: {
            fontSize: 14,
          },
          color: theme.textColors.headlineStatic,
        }
      : {
          color: theme.textColors.tableStatic,
        }),
  }),
}));
