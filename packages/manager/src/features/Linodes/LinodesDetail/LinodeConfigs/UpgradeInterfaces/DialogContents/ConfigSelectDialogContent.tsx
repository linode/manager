import { useUpgradeToLinodeInterfacesMutation } from '@linode/queries';
import { Box, Button, Notice, Select, Stack } from '@linode/ui';
import React from 'react';

import {
  CONFIG_SELECT_ACTUAL_UPGRADE_COPY,
  CONFIG_SELECT_DRY_RUN_COPY,
  UPGRADE_INTERFACES_WARNING,
} from '../constants';

import type {
  ConfigSelectDialogState,
  UpgradeInterfacesDialogContentProps,
} from '../types';

export const ConfigSelectDialogContent = (
  props: UpgradeInterfacesDialogContentProps<ConfigSelectDialogState>
) => {
  const { linodeId, onClose, setDialogState, state } = props;
  const { dialogTitle, isDryRun } = state;

  const [selectedConfigId, setSelectedConfigId] = React.useState<
    number | undefined
  >();

  const {
    isPending,
    mutateAsync: upgradeInterfaces,
  } = useUpgradeToLinodeInterfacesMutation(linodeId);

  const upgradeToLinodeInterfaces = async () => {
    const selectedConfig = state.configs.find(
      (config) => config.id === selectedConfigId
    );
    const updatedDialogTitle = `${dialogTitle}: ${selectedConfig?.label}`;
    try {
      const returnedData = await upgradeInterfaces({
        config_id: selectedConfigId,
        dry_run: isDryRun,
      });
      setDialogState({
        dialogTitle: updatedDialogTitle,
        isDryRun,
        linodeInterfaces: returnedData.interfaces,
        selectedConfig,
        step: 'success',
      });
    } catch (errors) {
      setDialogState({
        dialogTitle: updatedDialogTitle,
        errors,
        isDryRun,
        selectedConfig,
        step: 'error',
      });
    }
  };

  const configOptions = state.configs.map((config) => {
    return { label: config.label, value: config.id };
  });

  return (
    <Stack>
      {isDryRun
        ? CONFIG_SELECT_DRY_RUN_COPY
        : CONFIG_SELECT_ACTUAL_UPGRADE_COPY}
      {!isDryRun && selectedConfigId && (
        <Notice
          data-testid="upgrade-interfaces-warning"
          sx={{ marginTop: 2 }}
          variant="warning"
        >
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
      <Box
        gap={2}
        sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}
      >
        <Button buttonType="secondary" disabled={isPending} onClick={onClose}>
          Cancel
        </Button>
        <Button
          buttonType="primary"
          disabled={!selectedConfigId}
          loading={isPending}
          onClick={upgradeToLinodeInterfaces}
        >
          {isDryRun ? 'Upgrade Dry Run' : 'Upgrade Interfaces'}
        </Button>
      </Box>
    </Stack>
  );
};
