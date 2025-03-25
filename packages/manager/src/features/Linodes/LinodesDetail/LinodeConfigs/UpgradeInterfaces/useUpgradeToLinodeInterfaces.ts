import { useUpgradeToLinodeInterfacesMutation } from '@linode/queries';

import type { UpgradeInterfacesDialogState } from './types';
import type { Config } from '@linode/api-v4';

export const useUpgradeToLinodeInterfaces = (options: {
  linodeId: number;
  selectedConfig?: Config;
  setDialogState: (state: UpgradeInterfacesDialogState) => void;
}) => {
  const { linodeId, selectedConfig, setDialogState } = options;

  const {
    isPending,
    mutateAsync: upgradeInterfaces,
  } = useUpgradeToLinodeInterfacesMutation(linodeId);

  return {
    isPending,
    upgradeToLinodeInterfaces: async (isDryRun: boolean) => {
      const dialogTitle = `${isDryRun ? 'Dry Run' : 'Upgrade'}: ${
        selectedConfig?.label ?? ''
      }`;
      try {
        const returnedData = await upgradeInterfaces({
          dry_run: isDryRun,
          ...(selectedConfig ? { config_id: selectedConfig.id } : {}),
        });

        // When finished upgrading, move on to the success state
        setDialogState({
          dialogTitle,
          isDryRun,
          linodeInterfaces: returnedData.interfaces,
          selectedConfig,
          step: 'success',
        });
      } catch (errors) {
        setDialogState({
          dialogTitle,
          errors,
          isDryRun,
          selectedConfig,
          step: 'error',
        });
      }
    },
  };
};
