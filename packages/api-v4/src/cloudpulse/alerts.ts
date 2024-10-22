import { createAlertDefinitionSchema } from '@linode/validation';
import Request, { setURL, setMethod, setData } from '../request';
import { Alert, CreateAlertDefinitionPayload } from './types';
import { BETA_API_ROOT as API_ROOT } from 'src/constants';

export const createAlertDefinition = (data: CreateAlertDefinitionPayload) =>
  Request<Alert>(
    setURL(`${API_ROOT}/monitor/alert-definitions`),
    setMethod('POST'),
    setData(data, createAlertDefinitionSchema)
  );
