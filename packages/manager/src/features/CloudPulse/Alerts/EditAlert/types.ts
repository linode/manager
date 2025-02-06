import type {
  AlertServiceType,
  EditAlertDefinitionPayload,
} from '@linode/api-v4';

export interface EditAlertDefinitionForm extends EditAlertDefinitionPayload {
  serviceType: AlertServiceType;
}
