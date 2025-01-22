import React from 'react';

import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableSortCell } from 'src/components/TableSortCell';

export interface DisplayAlertResourceProp {
  /**
   * A flag indicating if there was an error loading the data. If true, the error message
   * (specified by `errorText`) will be displayed in the table.
   */
  isDataLoadingError?: boolean;
}

export const DisplayAlertResources = React.memo(
  (props: DisplayAlertResourceProp) => {
    const { isDataLoadingError } = props;
    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableSortCell
              active={false}
              data-qa-sortid="resource"
              data-testid="resource"
              direction="asc"
              handleClick={() => {}} // TODO: Implement sorting logic for this column.
              label="label"
            >
              Resource
            </TableSortCell>
            <TableSortCell
              active={false}
              data-qa-sortid="region"
              data-testid="region"
              direction="asc"
              handleClick={() => {}} // TODO: Implement sorting logic for this column.
              label="region"
            >
              Region
            </TableSortCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isDataLoadingError && (
            <TableRowError
              colSpan={2}
              message="Table data is unavailable. Please try again later."
            />
          )}
          {!isDataLoadingError && (
            // Placeholder cell to maintain table structure before body content is implemented.
            <TableRow>
              <TableCell colSpan={2} />
              {/* TODO: Populate the table body with resource data and implement sorting and pagination in future PRs. */}
            </TableRow>
          )}
        </TableBody>
      </Table>
    );
  }
);
