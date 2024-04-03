import { styled } from '@mui/material/styles';
import Grid, { Grid2Props } from '@mui/material/Unstable_Grid2';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';

import { Typography } from 'src/components/Typography';

import type { Breakpoint, Theme } from '@mui/material/styles';
import type { TypographyProps } from 'src/components/Typography';

type CustomGridProps = Pick<
  Grid2Props,
  'columnSpacing' | 'direction' | 'fontSize' | 'rowSpacing' | 'sx'
>;

export interface DescriptionListProps extends CustomGridProps {
  /**
   * Array of objects containing a title and description matching the semantic markup of a description list.
   */
  items: {
    description: string;
    title: string;
  }[];
  /**
   * The breakpoint at which the list will stack if the direction is row.
   * This is particularly useful to control lists we always their items all in row or all stacked (no in-between state).
   * Can be one of our defined breakpoints or a number (in px).
   *
   * @default 'md' (if prop provided)
   */
  stackAt?: Breakpoint | number;
}

/**
 * DescriptionList is a component that displays a list of items in a semantic description list format.
 * This component is often used in summaries, detail sections or drawers
 *
 * Its main purpose to to keep a unified styles for you description lists while providing enough flexibility with its layout.
 */
export const DescriptionList = (props: DescriptionListProps) => {
  const {
    columnSpacing = 4,
    direction = 'column',
    fontSize,
    items,
    rowSpacing = 1,
    stackAt = 0,
    sx,
  } = props;
  const willStackAt = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down(stackAt)
  );
  const dynamicDirection =
    direction === 'row' && willStackAt ? 'column' : direction;

  return (
    <StyledDL
      columnSpacing={columnSpacing}
      component="dl"
      container
      direction={dynamicDirection}
      fontSize={fontSize}
      rowSpacing={rowSpacing}
      sx={sx}
    >
      {items.map((item, idx) => {
        const { description, title } = item;

        return (
          <StyledDLItemSeparator key={idx}>
            <StyledDT component="dt">{title}</StyledDT>
            <Typography component="dd">{description}</Typography>
          </StyledDLItemSeparator>
        );
      })}
    </StyledDL>
  );
};

const StyledDL = styled(Grid, {
  label: 'StyledDL',
})<Grid2Props>(({ ...props }) => ({
  '& dt, & dd': {
    fontSize: props.fontSize ? props.fontSize : '0.9rem',
  },
}));

const StyledDLItemSeparator = styled(Grid, {
  label: 'StyledDLItemSeparator',
})(() => ({
  display: 'flex',
  flexWrap: 'wrap',
}));

const StyledDT = styled(Typography, {
  label: 'StyledDT',
})<TypographyProps>(({ theme }) => ({
  fontFamily: theme.font.bold,
  marginRight: theme.spacing(0.75),
}));
