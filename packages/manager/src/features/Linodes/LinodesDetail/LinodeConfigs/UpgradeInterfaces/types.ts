import type { APIError, Config, LinodeInterface } from '@linode/api-v4';

export interface UpgradeInterfacesDialogContentProps<
  State extends UpgradeInterfacesDialogState
> {
  linodeId: number;
  onClose: () => void;
  open: boolean;
  setDialogState: (state: UpgradeInterfacesDialogState) => void;
  state: State;
}

export type UpgradeInterfacesDialogState =
  | ConfigSelectDialogState
  | ErrorDialogState
  | PromptDialogState
  | SuccessDialogState;

export interface BaseDialogState {
  dialogTitle: string;
  step: 'configSelect' | 'error' | 'prompt' | 'success';
}

export interface PromptDialogState extends BaseDialogState {
  step: 'prompt';
}

export interface ConfigSelectDialogState extends BaseDialogState {
  configs: Config[];
  isDryRun: boolean;
  step: 'configSelect';
}

export interface SuccessDialogState extends BaseDialogState {
  isDryRun: boolean;
  linodeInterfaces: LinodeInterface[];
  selectedConfig?: Config;
  step: 'success';
}

export interface ErrorDialogState extends BaseDialogState {
  errors: APIError[];
  isDryRun: boolean;
  selectedConfig?: Config;
  step: 'error';
}
