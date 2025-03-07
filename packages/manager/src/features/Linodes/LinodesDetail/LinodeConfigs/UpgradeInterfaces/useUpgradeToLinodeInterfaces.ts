import { useUpgradeToLinodeInterfacesMutation } from 'src/queries/linodes/interfaces';

import type { UpgradeInterfacesDialogState } from './types';
import type {
  Config,
  UpgradeInterfaceData,
  UpgradeInterfacePayload,
} from '@linode/api-v4';

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
        const returnedData = await upgradeToLinodeInterfaces({
          isDryRun,
          selectedConfig,
          updateProgress: (progress: number) =>
            setDialogState({
              dialogTitle,
              isDryRun,
              progress,
              step: 'progress',
            }),
          upgradeInterfaces,
        });
        // todo: need to set progress somewhere
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

const upgradeToLinodeInterfaces = async (options: {
  isDryRun: boolean;
  selectedConfig?: Config;
  updateProgress: (progress: number | undefined) => void;
  upgradeInterfaces: (
    payload: UpgradeInterfacePayload
  ) => Promise<UpgradeInterfaceData>;
}): Promise<UpgradeInterfaceData> => {
  const {
    isDryRun,
    selectedConfig,
    updateProgress,
    upgradeInterfaces,
  } = options;

  updateProgress(0);
  await new Promise((resolve) => setTimeout(resolve, 0)); // return control to the DOM to update the progress

  updateProgress(80);
  return await upgradeInterfaces({
    dry_run: isDryRun,
    ...(selectedConfig ? { config_id: selectedConfig.id } : {}),
  });
};
