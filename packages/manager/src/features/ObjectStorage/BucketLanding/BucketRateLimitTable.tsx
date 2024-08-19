import React, { useState } from 'react';

import { Hidden } from 'src/components/Hidden';
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
  onDefaultRateLimit?: (defaultLimit: string) => void;
  onRateLimitChange?: (selectedLimit: string) => void;
  selectedRateLimit?: null | string;
}

interface RateLimit {
  checked: boolean;
  id: string;
  label: string;
  values: string[];
}

const tableHeaders = ['Limits', 'GET', 'PUT', 'LIST', 'DELETE', 'OTHER'];
const tableData = (endpointType: BucketRateLimitTableProps['endpointType']) => {
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

export const BucketRateLimitTable = (props: BucketRateLimitTableProps) => {
  const {
    endpointType,
    onDefaultRateLimit,
    onRateLimitChange,
    selectedRateLimit,
  } = props;
  const [rateLimits, setRateLimits] = useState<RateLimit[] | null>(null);

  React.useEffect(() => {
    const data = tableData(endpointType);
    setRateLimits(data);

    // Set Default value.
    const defaultRateLimit = data.find((rl: any) => rl.checked)?.id || '1';
    onDefaultRateLimit?.(defaultRateLimit);

    // Set Selected value as Default value initially.
    onRateLimitChange?.(defaultRateLimit);
  }, [endpointType]);

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
        {rateLimits?.map((row, rowIndex) => (
          <TableRow key={rowIndex}>
            <TableCell>
              <Radio
                checked={selectedRateLimit === row.id}
                name="limit-selection"
                onChange={() => onRateLimitChange?.(row.id)}
                value={row.id}
              />
              <Hidden smDown>{row.label}</Hidden>
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
