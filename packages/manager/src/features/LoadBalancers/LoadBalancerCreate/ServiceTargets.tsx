import { useFormikContext } from 'formik';
import React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { Button } from 'src/components/Button/Button';
import { Stack } from 'src/components/Stack';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';

import type { LoadBalancerCreateFormData } from './LoadBalancerCreate';

export const ServiceTargets = () => {
  const { values } = useFormikContext<LoadBalancerCreateFormData>();

  return (
    <Stack padding={1} spacing={1}>
      <Typography variant="h2">Service Targets</Typography>
      <Stack spacing={2}>
        <Typography>
          Service targets are a collection of endpoints. The load balancer uses
          policies and routes to direct incoming requests to specific healthy
          endpoints. At least one service target is required to start serving
          requests.
        </Typography>
        <Stack direction="row" gap={2}>
          <Button buttonType="outlined">Add Service Target</Button>
          <TextField hideLabel label="Filter" placeholder="Filter" />
        </Stack>
        <Table sx={{ width: '99%' }}>
          <TableHead>
            <TableRow>
              <TableCell>Service Target Label</TableCell>
              <TableCell>Endpoints</TableCell>
              <TableCell>Algorithm</TableCell>
              <TableCell>Health Checks</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {values.service_targets.length === 0 && (
              <TableRowEmpty colSpan={5} />
            )}
            {values.service_targets.map((serviceTarget) => (
              <TableRow key={serviceTarget.label}>
                <TableCell>{serviceTarget.label}</TableCell>
                <TableCell>{serviceTarget.endpoints.length}</TableCell>
                <TableCell>{serviceTarget.load_balancing_policy}</TableCell>
                <TableCell>
                  {serviceTarget.healthcheck ? 'Yes' : 'No'}
                </TableCell>
                <TableCell actionCell>
                  <ActionMenu
                    actionsList={[
                      { onClick: () => alert('Edit'), title: 'Edit' },
                      { onClick: () => alert('Delete'), title: 'Remove' },
                    ]}
                    ariaLabel={`Action Menu for Service Target ${serviceTarget.label}`}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Stack>
    </Stack>
  );
};
