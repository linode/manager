import { Box, Button, Notice, Select, Stack, Typography } from '@linode/ui';
import React from 'react';

import {
  CONFIG_SELECT_SHARED_COPY,
  UPGRADE_INTERFACES_WARNING,
} from '../constants';
import { initialState } from '../UpgradeInterfacesDialog';
import { useUpgradeToLinodeInterfaces } from '../useUpgradeToLinodeInterfaces';

import type {
  ConfigSelectDialogState,
  UpgradeInterfacesDialogContentProps,
} from '../types';

export const ConfigSelectDialogContent = (
  props: UpgradeInterfacesDialogContentProps<ConfigSelectDialogState>
) => {
  const { linodeId, onClose, setDialogState, state } = props;
  const { isDryRun } = state;

  const [selectedConfigId, setSelectedConfigId] = React.useState<
    number | undefined
  >();

  const { isPending, upgradeToLinodeInterfaces } = useUpgradeToLinodeInterfaces(
    {
      linodeId,
      selectedConfig: state.configs.find(
        (config) => config.id === selectedConfigId
      ),
      setDialogState,
    }
  );

  const configOptions = state.configs.map((config) => {
    return { label: config.label, value: config.id };
  });

  return (
    <Stack>
      <Typography>
        {CONFIG_SELECT_SHARED_COPY}{' '}
        {isDryRun && (
          <>
            The <strong>Upgrade Dry Run</strong> will display any issues.
          </>
        )}
      </Typography>
      {!isDryRun && selectedConfigId && (
        <Notice
          data-testid="upgrade-interfaces-warning"
          sx={{ marginTop: 2 }}
          variant="warning"
        >
          <strong>This Upgrade Is Irreversible!</strong>
          {UPGRADE_INTERFACES_WARNING}
        </Notice>
      )}
      <Select
        label="Configuration Profile"
        onChange={(_, item) => setSelectedConfigId(item.value)}
        options={configOptions}
        placeholder="Select Configuration Profile"
        value={
          configOptions.find((options) => options.value === selectedConfigId) ??
          null
        }
      />
      <Box
        gap={2}
        sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}
      >
        <Button buttonType="secondary" disabled={isPending} onClick={onClose}>
          Cancel
        </Button>
        <Button
          buttonType="outlined"
          disabled={isPending}
          onClick={() => setDialogState({ ...initialState })}
        >
          Return to Overview
        </Button>
        <Button
          buttonType="primary"
          disabled={!selectedConfigId}
          loading={isPending}
          onClick={() => upgradeToLinodeInterfaces(isDryRun)}
        >
          {isDryRun ? 'Upgrade Dry Run' : 'Upgrade Interfaces'}
        </Button>
      </Box>
    </Stack>
  );
};
