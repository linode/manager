import { createAlertDefinitionSchema } from '@linode/validation';
import Request, { setURL, setMethod, setData } from '../request';
import { Alert, AlertServiceType, CreateAlertDefinitionPayload } from './types';
import { BETA_API_ROOT as API_ROOT } from 'src/constants';

export const createAlertDefinition = (
  data: CreateAlertDefinitionPayload,
  serviceType: AlertServiceType
) =>
  Request<Alert>(
    setURL(
      `${API_ROOT}/monitor/services/${encodeURIComponent(
        serviceType!
      )}/alert-definitions`
    ),
    setMethod('POST'),
    setData(data, createAlertDefinitionSchema)
  );
