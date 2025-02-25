import { default as _Table } from '@mui/material/Table';
import * as React from 'react';

import { usePreferences } from 'src/queries/profile/preferences';

import { StyledTableWrapper } from './Table.styles';

import type { TableProps as _TableProps } from '@mui/material/Table';

type SpacingSize = 0 | 8 | 16 | 24;

export interface TableProps extends _TableProps {
  /** Optional additional css class to pass to the component */
  className?: string;
  /*
   * Optional number of columns in the table
   * This option is used to render predictable row loading patterns (ex: skeletons)
   */
  colCount?: number;
  /**
   * Optional boolean to enable or disable nested tables
   * @default false
   */
  nested?: boolean;
  /** Optional boolean to remove the overflow from the table */
  noOverflow?: boolean;
  /**
   * Optional number of rows in the table
   * This option is used to render predictable row loading patterns (ex: skeletons)
   */
  rowCount?: number;
  /**
   * Optional boolean to add hover state to the table rows
   * @default true
   */
  rowHoverState?: boolean;
  /**
   * Optional spacing to add to the bottom of the table
   * @default 0
   */
  spacingBottom?: SpacingSize;
  /**
   * Optional spacing to add to the top of the table
   * @default 0
   */
  spacingTop?: SpacingSize;
  /**
   * Optional boolean to enable or disable striped rows
   * @default true
   */
  striped?: boolean;
  /** Optional caption to add to the table */
  tableCaption?: string;
  /** Optional additional css class name to pass to the table */
  tableClass?: string;
}

/**
 * ## Column order
 * - As a rule, order columns by importance to the user. Position critical data on the left. Exceptions can be made to place related data adjacent
 * - As viewport size decreases, rather than scrolling horizontally, data columns on the right side of the table can be dropped first. Keep in-row actions aligned right
 *
 * ## Sizing
 * - Tables should take the full width to the established margins of a content area or paper

 * ## Inline menu actions
 * - Fewer than two actions: Expose them by default
 * - More than two actions: Consider placing them in a dropdown
 * - More than 5 actions: Consider exposing the two most-used actions and placing the remainder in a dropdown
 * - If action titles are long, place them in a drop down so they don’t take up too much room in the row
 * - Any exposed actions can collapse into the “kebab” icon, and drop down, at smaller viewport sizes
 * - **Disclaimer:** The UX team is in the process of assessing the usability of all of the above
 */
export const Table = (props: TableProps) => {
  const {
    className,
    colCount,
    nested = false,
    noOverflow,
    rowCount,
    rowHoverState = true,
    spacingBottom,
    spacingTop,
    striped = true,
    tableClass = '',
    ...rest
  } = props;
  const { data: preferences } = usePreferences();
  const isTableStripingEnabled = Boolean(
    preferences?.isTableStripingEnabled && striped
  );

  return (
    <StyledTableWrapper
      className={className}
      noOverflow={noOverflow}
      rowHoverState={rowHoverState}
      spacingBottom={spacingBottom}
      spacingTop={spacingTop}
    >
      <_Table
        className={`${tableClass} ${
          isTableStripingEnabled && !nested ? 'MuiTable-zebra' : ''
        }`}
        {...rest}
        aria-colcount={colCount}
        aria-rowcount={rowCount}
        role="table"
      >
        {props.children}
      </_Table>
    </StyledTableWrapper>
  );
};
