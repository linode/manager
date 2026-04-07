import { defineMockEntity } from '@akamai/compute-ui-mocks';

import type { Linode } from '@linode/api-v4';

export const linodeList = defineMockEntity<Linode>({
  name: 'linodes',
  endpoint: '/v4beta/linode/instances',
  method: 'GET',
  factory: (overrides = {}) => ({
    id: overrides.id ?? 1,
    label: overrides.label ?? 'my-linode',
    status: overrides.status ?? 'running',
    region: overrides.region ?? 'us-east',
    alerts: overrides.alerts ?? {
      cpu: 0,
      io: 0,
      network_in: 0,
      network_out: 0,
      transfer_quota: 0,
      system_alerts: [],
      user_alerts: [],
    },
    backups: overrides.backups ?? {
      enabled: false,
      last_successful: null,
      schedule: {
        day: 'Monday',
        window: 'W0',
      },
    },
    capabilities: overrides.capabilities ?? ['Block Storage Encryption'],
    created: overrides.created ?? new Date().toISOString(),
    disk_encryption: overrides.disk_encryption ?? undefined,
    group: overrides.group ?? '',
    has_user_data: overrides.has_user_data ?? false,
    hypervisor: overrides.hypervisor ?? 'kvm',
    image: overrides.image ?? null,
    interface_generation: overrides.interface_generation ?? undefined,
    ipv4: overrides.ipv4 ?? ['192.0.2.1'],
    ipv6: overrides.ipv6 ?? null,
    lke_cluster_id: overrides.lke_cluster_id ?? null,
    locks: overrides.locks ?? [],
    maintenance_policy: overrides.maintenance_policy ?? null,
    placement_group: overrides.placement_group ?? null,
    site_type: overrides.site_type ?? 'core',
    specs: overrides.specs ?? {
      accelerated_devices: 0,
      disk: 51200,
      gpus: 0,
      memory: 2048,
      transfer: 2000,
      vcpus: 1,
    },
    tags: overrides.tags ?? [],
    type: overrides.type ?? null,
    updated: overrides.updated ?? new Date().toISOString(),
    watchdog_enabled: overrides.watchdog_enabled ?? true,
  }),
  fields: {
    status: ['running', 'offline', 'booting', 'rebooting', 'shutting_down'],
    region: ['us-east', 'eu-west', 'ap-southeast'],
  },
});
