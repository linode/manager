import { http, HttpResponse } from 'msw';

import { makeResourcePage } from 'src/mocks/serverHandlers';

import type { AccountMaintenance, MaintenancePolicy } from '@linode/api-v4';
import type { MockPresetExtra } from 'src/mocks/types';

let customMaintenanceData: AccountMaintenance[] | null = null;

export const setCustomMaintenanceData = (data: AccountMaintenance[] | null) => {
  customMaintenanceData = data;
};

const mockCustomMaintenance = () => {
  return [
    // Account maintenance items (supports filtering and pagination similar to prod)
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

          if (statusA === null || statusB === null) {
            return 0;
          }

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

    // Maintenance policies used to derive start times from notice `when`
    http.get('*/maintenance/policies', () => {
      const policies: MaintenancePolicy[] = [
        {
          description: 'Migrate',
          is_default: true,
          label: 'Migrate',
          notification_period_sec: 3 * 60 * 60, // 3 hours
          slug: 'linode/migrate',
          type: 'linode_migrate',
        },
        {
          description: 'Power Off / Power On',
          is_default: false,
          label: 'Power Off / Power On',
          notification_period_sec: 72 * 60 * 60, // 72 hours
          slug: 'linode/power_off_on',
          type: 'linode_power_off_on',
        },
      ];

      return HttpResponse.json(makeResourcePage(policies));
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
