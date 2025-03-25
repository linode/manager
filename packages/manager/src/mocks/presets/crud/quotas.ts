import { getQuotas, getS3Endpoint } from './handlers/quotas';

import type { MockPresetCrud } from 'src/mocks/types';

export const quotasCrudPreset: MockPresetCrud = {
  group: { id: 'Quotas' },
  handlers: [getQuotas, getS3Endpoint],
  id: 'quotas:crud',
  label: 'Quotas CRUD',
};
