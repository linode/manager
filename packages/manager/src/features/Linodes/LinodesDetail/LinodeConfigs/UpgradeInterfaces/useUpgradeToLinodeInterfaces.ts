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
    mutateAsync: upgradeInterfaces,
  } = useUpgradeToLinodeInterfacesMutation(linodeId);

  return {
    upgradeToLinodeInterfaces: async (isDryRun: boolean) => {
      const dialogTitle = `${isDryRun ? 'Dry Run' : 'Upgrade'}: ${
        selectedConfig?.label ?? ''
      }`;
      try {
        // update the dialog to show linear progress
        setDialogState({
          dialogTitle,
          isDryRun,
          progress: 0,
          step: 'progress',
        });
        // return control to the DOM to update the progress
        await new Promise((resolve) => setTimeout(resolve, 0));
        setDialogState({
          dialogTitle,
          isDryRun,
          progress: 80,
          step: 'progress',
        });

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
