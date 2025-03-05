import type { UpgradeInterfacesDialogState } from './types';
import type { Config } from '@linode/api-v4';

export type UpgradeInterfacesInputs = {
  isDryRun: boolean;
  linodeId: number;
  selectedConfig: Config;
  setDialogState: (state: UpgradeInterfacesDialogState) => void;
};
