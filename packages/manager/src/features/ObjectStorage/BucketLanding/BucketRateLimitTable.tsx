import { Box, FormControlLabel, Radio, Typography } from '@linode/ui';
import React from 'react';

import { FormLabel } from 'src/components/FormLabel';
import { Link } from 'src/components/Link';
import { SupportLink } from 'src/components/SupportLink';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';

import type { ObjectStorageEndpointTypes } from '@linode/api-v4';
import type { TypographyProps } from '@linode/ui';

/**
 * TODO: [IMPORTANT NOTE]: This component is currently using static data until
 * and API endpoint is available to return rate limits for
 * each endpoint type.
 */

interface BucketRateLimitTableProps {
  endpointType?: ObjectStorageEndpointTypes;
  typographyProps?: TypographyProps;
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
  typographyProps,
}: BucketRateLimitTableProps) => {
  const isGen2EndpointType = endpointType === 'E2' || endpointType === 'E3';

  return (
    <Box>
      <FormLabel>
        <Typography
          {...typographyProps}
          data-testid="bucketRateLimit"
          marginBottom={1}
          marginTop={2}
        >
          Bucket Rate Limits
        </Typography>
      </FormLabel>
      <Typography marginBottom={isGen2EndpointType ? 2 : 3}>
        {isGen2EndpointType ? (
          <>
            Specifies the maximum Requests Per Second (RPS) for a bucket. To
            increase it to High,{' '}
            <SupportLink
              text="open a support ticket"
              title="Request to Increase Bucket Rate Limits"
            />
            .{' '}
          </>
        ) : (
          'This endpoint type supports up to 750 Requests Per Second (RPS). '
        )}
        Understand{' '}
        <Link to="https://techdocs.akamai.com/cloud-computing/docs/object-storage-product-limits#optimize-to-avoid-rate-limiting">
          bucket rate limits
        </Link>
        .
      </Typography>

      {isGen2EndpointType && (
        <Table data-testid="bucket-rate-limit-table" sx={{ marginBottom: 3 }}>
          <TableHead>
            <TableRow>
              {tableHeaders.map((header, index) => {
                return (
                  <TableCell
                    key={`${index}-${header}`}
                    sx={{
                      '&&:last-child': {
                        paddingRight: 2,
                      },
                    }}
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
                        checked={rowIndex === 0}
                        disabled
                        onChange={() => null}
                        value={row.id}
                      />
                    }
                    label={row.label}
                  />
                </TableCell>
                {row.values.map((value, index) => {
                  return (
                    <TableCell
                      key={`${index}-${value}`}
                      sx={{
                        '&&:last-child': {
                          paddingRight: 2,
                        },
                      }}
                    >
                      {value}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
};
