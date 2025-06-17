import { http, HttpResponse } from 'msw';

import { makeResourcePage } from 'src/mocks/serverHandlers';

import type { AccountMaintenance } from '@linode/api-v4';
import type { MockPresetExtra } from 'src/mocks/types';

let customMaintenanceData: AccountMaintenance[] | null = null;

export const setCustomMaintenanceData = (data: AccountMaintenance[] | null) => {
  customMaintenanceData = data;
};

const mockCustomMaintenance = () => {
  return [
    http.get('*/account/maintenance', ({ request }) => {
      const url = new URL(request.url);

      const page = Number(url.searchParams.get('page') || 1);
      const pageSize = Number(url.searchParams.get('page_size') || 25);
      const headers = JSON.parse(request.headers.get('x-filter') || '{}');

      const accountMaintenance =
        customMaintenanceData?.filter((maintenance) =>
          JSON.stringify(headers.status).includes(maintenance.status)
        ) ?? [];

      if (request.headers.get('x-filter')) {
        accountMaintenance.sort((a, b) => {
          const statusA = a[headers['+order_by'] as keyof AccountMaintenance];
          const statusB = b[headers['+order_by'] as keyof AccountMaintenance];

          if (statusA < statusB) {
            return -1;
          }
          if (statusA > statusB) {
            return 1;
          }
          return 0;
        });

        if (headers['+order'] === 'desc') {
          accountMaintenance.reverse();
        }
        return HttpResponse.json({
          data: accountMaintenance.slice(
            (page - 1) * pageSize,
            (page - 1) * pageSize + pageSize
          ),
          page,
          pages: Math.ceil(accountMaintenance.length / pageSize),
          results: accountMaintenance.length,
        });
      }

      return HttpResponse.json(makeResourcePage(accountMaintenance));
    }),
  ];
};

export const customMaintenancePreset: MockPresetExtra = {
  desc: 'Custom Maintenance',
  group: { id: 'Maintenance', type: 'maintenance' },
  handlers: [mockCustomMaintenance],
  id: 'maintenance:custom',
  label: 'Custom Maintenance',
};
