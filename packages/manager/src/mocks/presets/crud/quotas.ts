import { getQuotas } from './handlers/quotas';

import type { MockPresetCrud } from 'src/mocks/types';

export const quotasCrudPreset: MockPresetCrud = {
  group: { id: 'Quotas' },
  handlers: [getQuotas],
  id: 'quotas:crud',
  label: 'Quotas CRUD',
};
