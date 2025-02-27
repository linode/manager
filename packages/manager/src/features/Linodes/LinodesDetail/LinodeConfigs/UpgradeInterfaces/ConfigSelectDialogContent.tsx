import { Box, Button, Notice, Select, SelectOption, Stack } from '@linode/ui';
import React from 'react';

import {
  CONFIG_SELECT_ACTUAL_UPGRADE_COPY,
  CONFIG_SELECT_DRY_RUN_COPY,
  UPGRADE_INTERFACES_WARNING,
} from './constants';

import type {
  ConfigSelectDialogState,
  UpgradeInterfacesDialogContentProps,
} from './types';

export const ConfigSelectDialogContent = (
  props: UpgradeInterfacesDialogContentProps<ConfigSelectDialogState>
) => {
  const { onClose, setDialogState, state } = props;

  const configOptions = state.configs.map((config) => {
    return { label: config.label, value: config.id };
  });

  const [selectedConfigId, setSelectedConfigId] = React.useState<
    number | undefined
  >();

  return (
    <Stack gap={2}>
      {state.isDryRun
        ? CONFIG_SELECT_DRY_RUN_COPY
        : CONFIG_SELECT_ACTUAL_UPGRADE_COPY}
      {!state.isDryRun && selectedConfigId && (
        <Notice data-testid="upgrade-interfaces-warning" variant="warning">
          {UPGRADE_INTERFACES_WARNING}
        </Notice>
      )}
      <Select
        value={
          configOptions.find((options) => options.value === selectedConfigId) ??
          null
        }
        label="Configuration Profile"
        onChange={(_, item) => setSelectedConfigId(item.value)}
        options={configOptions}
        placeholder="Select Configuration Profile"
      />
      <Box gap={2}>
        <Button buttonType="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button disabled={!selectedConfigId}>
          {state.isDryRun ? 'Upgrade Dry Run' : 'Upgrade Interfaces'}
        </Button>
      </Box>
    </Stack>
  );
};
