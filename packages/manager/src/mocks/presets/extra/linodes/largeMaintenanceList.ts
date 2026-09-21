import { linodeFactory } from '@linode/utilities';
import { http } from 'msw';

import { accountMaintenanceFactory } from 'src/factories';
import { makePaginatedResponse } from 'src/mocks/utilities/response';

import type { AccountMaintenance, Linode } from '@linode/api-v4';
import type { MockPresetExtra } from 'src/mocks/types';

export const LARGE_MAINTENANCE_LIST_LINODE_COUNT = 501;
export const LARGE_MAINTENANCE_LIST_MAINTENANCE_COUNT = 200;

let linodes: Linode[] | null = null;
let maintenance: AccountMaintenance[] | null = null;

const getMockLinodes = () => {
  if (!linodes) {
    linodeFactory.resetSequenceNumber();
    linodes = linodeFactory.buildList(LARGE_MAINTENANCE_LIST_LINODE_COUNT);
  }
  return linodes;
};

const getMockMaintenance = () => {
  if (!maintenance) {
    accountMaintenanceFactory.resetSequenceNumber();
    maintenance = getMockLinodes()
      .slice(0, LARGE_MAINTENANCE_LIST_MAINTENANCE_COUNT)
      .map((linode) =>
        accountMaintenanceFactory.build({
          entity: {
            id: linode.id,
            label: linode.label,
            type: 'linode',
            url: `/v4/linode/instances/${linode.id}`,
          },
          reason:
            'This maintenance will allow us to update the BIOS on the host’s motherboard.',
          status: 'scheduled',
          type: 'reboot',
        })
      );
  }
  return maintenance;
};

const mockLargeMaintenanceList = () => [
  http.get('*/v4*/linode/instances', ({ request }) => {
    return makePaginatedResponse({
      data: getMockLinodes(),
      request,
    });
  }),
  http.get('*/account/maintenance', ({ request }) => {
    return makePaginatedResponse({
      data: getMockMaintenance(),
      request,
    });
  }),
];

export const largeMaintenanceListPreset: MockPresetExtra = {
  desc: '501 Linodes with 200 in scheduled maintenance. Reproduces landing pagination expanding to Show All.',
  group: { id: 'Linodes', type: 'checkbox' },
  handlers: [mockLargeMaintenanceList],
  id: 'linodes:many-in-maintenance',
  label: 'Many Linodes in maintenance (501 / 200)',
};
