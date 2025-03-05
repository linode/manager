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
  step: 'configSelect' | 'error' | 'progress' | 'prompt' | 'success';
}

export interface PromptDialogState extends BaseDialogState {
  step: 'prompt';
}

export interface ConfigSelectDialogState extends BaseDialogState {
  configs: Config[];
  isDryRun: boolean;
  step: 'configSelect';
}

export interface ProgressDialogState extends BaseDialogState {
  isDryRun: boolean;
  progress: number;
  step: 'progress';
}

export interface SuccessDialogState extends BaseDialogState {
  isDryRun: boolean;
  linodeInterfaces: LinodeInterface[];
  step: 'success';
}

export interface ErrorDialogState extends BaseDialogState {
  error: APIError[];
  isDryRun: boolean;
  step: 'error';
}
