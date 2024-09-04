import { createAlertDefinitionSchema } from '@linode/validation';
import Request, { setURL, setMethod, setData } from '../request';
import { Alert, CreateAlertDefinitionPayload } from './types';
import { API_ROOT } from 'src/constants';

export const createAlertDefinition = (data: CreateAlertDefinitionPayload) =>
  Request<Alert>(
    setURL(`${API_ROOT}/monitor/alerts`),
    setMethod('POST'),
    setData(data, createAlertDefinitionSchema)
  );
