import { TableBody } from '@mui/material';
import React from 'react';

import { Table } from 'src/components/Table';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableSortCell } from 'src/components/TableSortCell';

export interface DisplayAlertResourceProp {
  /**
   * The error text that needs to be displayed inside the table
   */
  errorText?: string;

  /**
   * When a api call fails or any error occurs while loading the data, this property can be passes true
   */
  isDataLoadingError: boolean;
}

export const DisplayAlertResources = React.memo(
  (props: DisplayAlertResourceProp) => {
    const { errorText, isDataLoadingError } = props;
    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableSortCell
              active={false}
              data-qa-sortid="resource"
              data-testid="resource"
              direction={'asc'}
              handleClick={() => {}}
              label="label"
            >
              Resource
            </TableSortCell>
            <TableSortCell
              active={false}
              data-qa-sortid="region"
              data-testid="region"
              direction={'asc'}
              handleClick={() => {}}
              label="region"
            >
              Region
            </TableSortCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isDataLoadingError && (
            <TableRowError
              colSpan={3}
              message={errorText ?? 'Table data is unavailable.'}
            />
          )}
          {/* TODO Add body of the table , sorting and pagination in upcoming PR's */}
        </TableBody>
      </Table>
    );
  }
);
