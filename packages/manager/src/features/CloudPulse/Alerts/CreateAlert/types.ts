import type {
  AlertServiceType,
  CreateAlertDefinitionPayload,
} from '@linode/api-v4';

export interface CreateAlertDefinitionForm
  extends CreateAlertDefinitionPayload {
  engine_type: null | string;
  region: string;
  service_type: AlertServiceType | null;
}
