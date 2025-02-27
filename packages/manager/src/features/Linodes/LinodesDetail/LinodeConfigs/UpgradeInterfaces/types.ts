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
  | ProgressDialogState
  | PromptDialogState
  | SuccessDialogState;

export interface BaseDialogState {
  dialogTitle: string;
  isDryRun: boolean;
  step: 'configSelect' | 'error' | 'progress' | 'prompt' | 'success';
}

export interface PromptDialogState extends BaseDialogState {
  step: 'prompt';
}

export interface ConfigSelectDialogState extends BaseDialogState {
  configs: Config[];
  step: 'configSelect';
}

export interface ProgressDialogState extends BaseDialogState {
  progress: number;
  step: 'progress';
}

export interface SuccessDialogState extends BaseDialogState {
  linodeInterfaces: LinodeInterface[];
  step: 'success';
}

export interface ErrorDialogState extends BaseDialogState {
  error: APIError[];
  step: 'error';
}
