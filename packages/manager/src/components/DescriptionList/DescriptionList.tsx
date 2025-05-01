import { Box, TooltipIcon, Typography } from '@linode/ui';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';

import {
  StyledDL,
  StyledDLItemSeparator,
  StyledDT,
} from './DescriptionList.styles';

import type { TooltipIconProps } from '@linode/ui';
import type { Breakpoint, SxProps, Theme } from '@mui/material/styles';

type DescriptionListBaseProps = {
  /**
   * The amount of space between the title and description.
   * Only for the "row" and "grid" display modes.
   *
   * @default 4
   */
  columnSpacing?: number;
  /**
   * The display mode of the list.
   * - "column" will display the list in a column (stacked)
   * - "row" will display the list in one, wrappable row
   * - "grid" will display the list in a grid, which can be configured via the `gridProps` prop
   *
   * @default 'column'
   */
  displayMode?: 'column' | 'row';
  /**
   * The font size of the title and description.
   * If not provided, the default font size is 0.9rem.
   *
   * @default '0.9rem'
   */
  fontSize?: string;
  /**
   * Array of objects containing a title and description matching the semantic markup of a description list.
   * Includes an optional tooltip for contextual help.
   */
  items: {
    description: string;
    title: string;
    tooltip?: {
      position?: TooltipIconProps['tooltipPosition'];
      text: TooltipIconProps['text'];
      width?: TooltipIconProps['width'];
    };
  }[];
  /**
   * The breakpoint at which the list will stack if the direction is row.
   * This is particularly useful to control lists we always their items all in row or all stacked (no in-between state).
   * Can be one of our defined breakpoints or a number (in px).
   *
   * @default 'md' (if prop provided)
   */
  rowSpacing?: number;
  /**
   * The optional breakpoint at which the list will stack if the direction is row or grid.
   */
  stackAt?: Breakpoint | number;
  /**
   * Additional styles to apply to the component.
   */
  sx?: SxProps<Theme>;
};

interface DescriptionListGridProps
  extends Omit<DescriptionListBaseProps, 'displayMode'> {
  displayMode?: 'grid';
  /**
   * Props to pass to the Grid
   * Only for the "grid" display mode.
   */
  gridProps: {
    columns: number;
    columnSpacing?: number;
  };
}

export type DescriptionListProps =
  | DescriptionListBaseProps
  | DescriptionListGridProps;

/**
 * DescriptionList is a component that displays a list of items in a semantic description list format.
 * This component is often used in summaries, detail sections or drawers
 *
 * Its main purpose to to keep a unified styles for you description lists while providing enough flexibility with its layout.
 */
export const DescriptionList = (props: DescriptionListProps) => {
  const {
    columnSpacing = 4,
    displayMode = 'column',
    fontSize,
    items,
    rowSpacing = 1,
    stackAt = 0,
    sx,
  } = props;
  let gridProps;
  if ('gridProps' in props) {
    gridProps = props.gridProps;
  }

  const isStacked = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down(stackAt)
  );
  const responsiveMode =
    (displayMode === 'grid' || displayMode === 'row') && isStacked
      ? 'column'
      : displayMode;

  return (
    <Box display="flex">
      <StyledDL
        columnSpacing={columnSpacing}
        component="dl"
        container
        displayMode={responsiveMode}
        fontSize={fontSize}
        gridColumns={gridProps?.columns}
        isStacked={isStacked}
        rowSpacing={rowSpacing}
        sx={sx}
      >
        {items.map((item, idx) => {
          const { description, title, tooltip } = item;

          return (
            <StyledDLItemSeparator key={idx}>
              <StyledDT component="dt">{title}</StyledDT>
              <Typography component="dd">{description}</Typography>
              {tooltip && (
                <TooltipIcon
                  status="help"
                  sxTooltipIcon={{ px: 1, py: 0, top: -2 }}
                  text={tooltip?.text}
                  tooltipPosition={tooltip?.position}
                  width={tooltip?.width}
                />
              )}
            </StyledDLItemSeparator>
          );
        })}
      </StyledDL>
    </Box>
  );
};
