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
import { ServiceTargetPayload } from '@linode/api-v4';

interface Props {
  configurationIndex: number;
  handlers: Handlers;
}

function getUpdatedValuesFromRemovingServiceTarget(
  values: LoadBalancerCreateFormData,
  serviceTarget: ServiceTargetPayload
) {
  for (let i = 0; i < values.configurations.length; i++) {
    values.configurations[i].service_targets = values.configurations[
      i
    ].service_targets.filter((st) => st.label !== serviceTarget.label);

    for (let j = 0; j < values.configurations[i].routes!.length; j++) {
      for (
        let k = 0;
        k < values.configurations[i].routes![j].rules.length;
        k++
      ) {
        for (
          let l = 0;
          l <
          values.configurations[i].routes![j].rules[k].service_targets.length;
          l++
        ) {
          values.configurations[i].routes![j].rules[
            k
          ].service_targets = values.configurations[i].routes![j].rules[
            k
          ].service_targets.filter((st) => st.label !== serviceTarget.label);
        }
      }
    }
  }
  return values;
}

export const ServiceTargets = ({ configurationIndex, handlers }: Props) => {
  const { setValues, values } = useFormikContext<LoadBalancerCreateFormData>();

  const [query, setQuery] = useState<string>('');

  const configuration = values.configurations![configurationIndex];

  const handleRemoveServiceTarget = (index: number) => {
    const st = configuration.service_targets[index];
    setValues(getUpdatedValuesFromRemovingServiceTarget(values, st));
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
            onClick={() => handlers.handleAddServiceTarget(configurationIndex)}
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
                            handlers.handleEditServiceTarget(
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
