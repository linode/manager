import {
  getEvents,
  updateEvents,
} from 'src/mocks/presets/crud/handlers/events';
import { linodeCrudPreset } from 'src/mocks/presets/crud/linodes';

import { domainCrudPreset } from '../crud/domains';
import { firewallCrudPreset } from '../crud/firewalls';
import { placementGroupsCrudPreset } from '../crud/placementGroups';
import { quotasCrudPreset } from '../crud/quotas';
import { supportTicketCrudPreset } from '../crud/supportTickets';
import { volumeCrudPreset } from '../crud/volumes';

import type { MockPresetBaseline } from 'src/mocks/types';

export const baselineCrudPreset: MockPresetBaseline = {
  group: { id: 'General' },
  handlers: [
    ...linodeCrudPreset.handlers,
    ...placementGroupsCrudPreset.handlers,
    ...quotasCrudPreset.handlers,
    ...supportTicketCrudPreset.handlers,
    ...volumeCrudPreset.handlers,
    ...domainCrudPreset.handlers,
    ...firewallCrudPreset.handlers,

    // Events.
    getEvents,
    updateEvents,
  ],
  id: 'baseline:crud',
  label: 'CRUD',
};
