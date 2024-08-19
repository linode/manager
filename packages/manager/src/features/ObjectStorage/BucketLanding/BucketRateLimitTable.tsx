import React from 'react';

import { Radio } from 'src/components/Radio/Radio';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';

import type { ObjectStorageEndpointTypes } from '@linode/api-v4';

/**
 * TODO: This component is currently using static data until
 * and API endpoint is available to return rate limits for
 * each endpoint type.
 */

interface BucketRateLimitTableProps {
  endpointType: ObjectStorageEndpointTypes | undefined;
  onRateLimitChange?: (selectedLimit: string) => void;
  selectedRateLimit?: string;
}

const tableHeaders = ['Limits', 'GET', 'PUT', 'LIST', 'DELETE', 'OTHER'];
const tableData = (endpointType: BucketRateLimitTableProps['endpointType']) => [
  {
    checked: true,
    id: '1',
    values: ['1000', '000', '000', '000', '000'],
  },
  {
    checked: false,
    id: '2',
    values: [
      endpointType === 'E3' ? '20000' : '5000',
      '000',
      '000',
      '000',
      '000',
    ],
  },
];

export const BucketRateLimitTable = (props: BucketRateLimitTableProps) => {
  const { endpointType, onRateLimitChange, selectedRateLimit } = props;

  return (
    <Table sx={{ marginBottom: 3 }}>
      <TableHead>
        <TableRow>
          {tableHeaders.map((header, index) => {
            return (
              <TableCell
                sx={{
                  '&&:last-child': {
                    paddingRight: 2,
                  },
                }}
                key={`${index}-${header}`}
              >
                {header}
              </TableCell>
            );
          })}
        </TableRow>
      </TableHead>
      <TableBody>
        {tableData(endpointType).map((row, rowIndex) => (
          <TableRow key={rowIndex}>
            <TableCell>
              <Radio
                checked={selectedRateLimit === row.id}
                name="limit-selection"
                onChange={() => onRateLimitChange?.(row.id)}
                value={row.id}
              />
            </TableCell>
            {row.values.map((value, index) => {
              return (
                <TableCell
                  sx={{
                    '&&:last-child': {
                      paddingRight: 2,
                    },
                  }}
                  key={`${index}-${value}`}
                >
                  {value}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
