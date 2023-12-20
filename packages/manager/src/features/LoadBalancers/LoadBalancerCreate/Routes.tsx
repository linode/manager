import CloseIcon from '@mui/icons-material/Close';
import { useFormikContext } from 'formik';
import React, { useState } from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { Button } from 'src/components/Button/Button';
import {
  CollapsibleTable,
  TableItem,
} from 'src/components/CollapsibleTable/CollapsibleTable';
import { Hidden } from 'src/components/Hidden';
import { IconButton } from 'src/components/IconButton';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { InputAdornment } from 'src/components/InputAdornment';
import { Stack } from 'src/components/Stack';
import { TableCell } from 'src/components/TableCell';
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

  const getTableItems = (): TableItem[] => {
    if (configuration.routes?.length === 0) {
      return [];
    }

    return configuration
      .routes!.filter((route) => {
        if (query) {
          return route.label.includes(query);
        }
        return true;
      })
      .map((route, index) => {
        const OuterTableCells = (
          <>
            <Hidden mdDown>
              <TableCell>{route.rules.length}</TableCell>
            </Hidden>
            <Hidden smDown>
              <TableCell>{route.protocol.toLocaleUpperCase()}</TableCell>
            </Hidden>
            <TableCell actionCell>
              <InlineMenuAction
                onClick={() =>
                  handlers.handleAddRule(configurationIndex, index)
                }
                actionText="Add Rule"
              />
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
          </>
        );

        const InnerTable = <p>idk</p>;

        return {
          InnerTable,
          OuterTableCells,
          id: index,
          label: route.label,
        };
      });
  };

  const RoutesTableRowHead = (
    <TableRow>
      <TableCell>Route Label</TableCell>
      <Hidden mdDown>
        <TableCell>Rules</TableCell>
      </Hidden>
      <Hidden smDown>
        <TableCell>Protocol</TableCell>
      </Hidden>
      <TableCell></TableCell>
    </TableRow>
  );

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
        <CollapsibleTable
          TableItems={getTableItems()}
          TableRowEmpty={<TableRowEmpty colSpan={5} message={'No Routes'} />}
          TableRowHead={RoutesTableRowHead}
        />
      </Stack>
    </Stack>
  );
};
