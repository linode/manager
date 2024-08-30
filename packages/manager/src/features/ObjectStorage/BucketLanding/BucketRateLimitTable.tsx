import React from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { FormControlLabel } from 'src/components/FormControlLabel';
import { Radio } from 'src/components/Radio/Radio';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';

import type { UpdateBucketRateLimitPayload } from '../BucketDetail/BucketProperties';
import type { ObjectStorageEndpointTypes } from '@linode/api-v4';

/**
 * TODO: This component is currently using static data until
 * and API endpoint is available to return rate limits for
 * each endpoint type.
 */

interface BucketRateLimitTableProps {
  endpointType: ObjectStorageEndpointTypes | undefined;
}

const tableHeaders = ['Limits', 'GET', 'PUT', 'LIST', 'DELETE', 'OTHER'];
const tableData = ({ endpointType }: BucketRateLimitTableProps) => {
  const isE3 = endpointType === 'E3';

  return [
    {
      checked: true,
      id: '1',
      label: 'Basic',
      values: ['2,000', '500', '100', '200', '400'],
    },
    {
      checked: false,
      id: '2',
      label: 'High',
      values: [
        isE3 ? '20,000' : '5,000',
        isE3 ? '2,000' : '1,000',
        isE3 ? '400' : '200',
        isE3 ? '400' : '200',
        isE3 ? '1,000' : '800',
      ],
    },
  ];
};

export const BucketRateLimitTable = ({
  endpointType,
}: BucketRateLimitTableProps) => {
  const { control } = useFormContext<UpdateBucketRateLimitPayload>();
  const { field } = useController({
    control,
    name: 'rateLimit',
  });

  return (
    <Table data-testid="bucket-rate-limit-table" sx={{ marginBottom: 3 }}>
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
        {tableData({ endpointType }).map((row, rowIndex) => (
          <TableRow key={rowIndex}>
            <TableCell>
              <FormControlLabel
                control={
                  <Radio
                    checked={field.value === row.id}
                    disabled
                    onChange={() => field.onChange(row.id)}
                    value={row.id}
                  />
                }
                label={row.label}
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
