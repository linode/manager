import CloseIcon from '@mui/icons-material/Close';
import { useFormikContext } from 'formik';
import React, { useState } from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { Button } from 'src/components/Button/Button';
import { IconButton } from 'src/components/IconButton';
import { InputAdornment } from 'src/components/InputAdornment';
import { Stack } from 'src/components/Stack';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TextField } from 'src/components/TextField';
import { TextTooltip } from 'src/components/TextTooltip';
import { Typography } from 'src/components/Typography';

import type { Handlers } from './LoadBalancerConfigurations';
import type { LoadBalancerCreateFormData } from './LoadBalancerCreate';

interface Props {
  configurationIndex: number;
  handlers: Handlers;
}

export const ServiceTargets = ({ configurationIndex, handlers }: Props) => {
  const {
    setFieldValue,
    values,
  } = useFormikContext<LoadBalancerCreateFormData>();

  const [query, setQuery] = useState<string>('');

  const configuration = values.configurations![configurationIndex];

  const handleRemoveServiceTarget = (index: number) => {
    configuration.service_targets.splice(index, 1);
    setFieldValue(
      `configuration[${configurationIndex}].service_targets`,
      configuration.service_targets
    );
  };

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
          <Button
            buttonType="outlined"
            onClick={() => handlers.handleAddServiceTraget(configurationIndex)}
          >
            Add Service Target
          </Button>
          <TextField
            InputProps={{
              endAdornment: query && (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="Clear"
                    onClick={() => setQuery('')}
                    size="small"
                    sx={{ padding: 'unset' }}
                  >
                    <CloseIcon sx={{ color: '#aaa !important' }} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            hideLabel
            inputId={`configuration-${configurationIndex}-service-target-filter`}
            label="Filter"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter"
            value={query}
          />
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
            {configuration.service_targets.length === 0 && (
              <TableRowEmpty colSpan={5} />
            )}
            {configuration.service_targets
              .filter((serviceTarget) => {
                if (query) {
                  return serviceTarget.label.includes(query);
                }
                return true;
              })
              .map((serviceTarget, index) => (
                <TableRow key={serviceTarget.label}>
                  <TableCell>{serviceTarget.label}</TableCell>
                  <TableCell>
                    {serviceTarget.endpoints.length === 0 ? (
                      0
                    ) : (
                      <TextTooltip
                        tooltipText={
                          <Stack>
                            {serviceTarget.endpoints.map(
                              ({ ip, port }, index) => (
                                <Typography key={`${ip}-${port}-${index}`}>
                                  {ip}:{port}
                                </Typography>
                              )
                            )}
                          </Stack>
                        }
                        displayText={String(serviceTarget.endpoints.length)}
                        minWidth={100}
                      />
                    )}
                  </TableCell>
                  <TableCell sx={{ textTransform: 'capitalize' }}>
                    {serviceTarget.load_balancing_policy.replace('_', ' ')}
                  </TableCell>
                  <TableCell>
                    {serviceTarget.healthcheck ? 'Yes' : 'No'}
                  </TableCell>
                  <TableCell actionCell>
                    <ActionMenu
                      actionsList={[
                        {
                          onClick: () =>
                            handlers.handleEditServiceTraget(
                              index,
                              configurationIndex
                            ),
                          title: 'Edit',
                        },
                        {
                          onClick: () => handleRemoveServiceTarget(index),
                          title: 'Remove',
                        },
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
