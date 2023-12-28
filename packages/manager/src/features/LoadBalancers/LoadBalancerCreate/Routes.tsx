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
import { Typography } from 'src/components/Typography';

import type { Handlers } from './LoadBalancerConfigurations';
import type { LoadBalancerCreateFormData } from './LoadBalancerCreate';

interface Props {
  configurationIndex: number;
  handlers: Handlers;
}

export const Routes = ({ configurationIndex, handlers }: Props) => {
  const {
    setFieldValue,
    values,
  } = useFormikContext<LoadBalancerCreateFormData>();

  const [query, setQuery] = useState<string>('');

  const configuration = values.configurations![configurationIndex];

  const handleRemoveRoute = (index: number) => {
    configuration.routes!.splice(index, 1);
    setFieldValue(
      `configurations[${configurationIndex}].routes`,
      configuration.routes
    );
  };

  return (
    <Stack padding={1} spacing={1}>
      <Typography variant="h2">Routes</Typography>
      <Stack spacing={2}>
        <Typography>
          Load balancer uses traffic routing rules to select the service target
          for the incoming request.
        </Typography>
        <Stack direction="row" gap={2}>
          <Button
            buttonType="outlined"
            onClick={() => handlers.handleAddRoute(configurationIndex)}
          >
            Add Route
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
            inputId={`configuration-${configurationIndex}-route-filter`}
            label="Filter"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter"
            value={query}
          />
        </Stack>
        <Table sx={{ width: '99%' }}>
          <TableHead>
            <TableRow>
              <TableCell>Route Label</TableCell>
              <TableCell>Rules</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {configuration.routes!.length === 0 && (
              <TableRowEmpty colSpan={5} />
            )}
            {configuration.routes
              ?.filter((route) => {
                if (query) {
                  return route.label.includes(query);
                }
                return true;
              })
              .map((route, index) => (
                <TableRow key={route.label}>
                  <TableCell>{route.label}</TableCell>
                  <TableCell>{route.rules.length}</TableCell>
                  <TableCell actionCell>
                    <ActionMenu
                      actionsList={[
                        {
                          onClick: () =>
                            handlers.handleEditRoute(index, configurationIndex),
                          title: 'Edit Label',
                        },
                        {
                          onClick: () => handleRemoveRoute(index),
                          title: 'Remove',
                        },
                      ]}
                      ariaLabel={`Action Menu for Route ${route.label}`}
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
