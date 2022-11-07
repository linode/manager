import { DateTime } from 'luxon';
import {
  EventAction,
  NotificationType,
  SecurityQuestionsPayload,
} from '@linode/api-v4';
import { RequestHandler, rest } from 'msw';
import cachedRegions from 'src/cachedData/regions.json';
import { MockData } from 'src/dev-tools/mockDataController';
import {
  abuseTicketNotificationFactory,
  accountFactory,
  accountMaintenanceFactory,
  accountTransferFactory,
  appTokenFactory,
  contactFactory,
  credentialFactory,
  creditPaymentResponseFactory,
  databaseBackupFactory,
  databaseEngineFactory,
  databaseFactory,
  databaseInstanceFactory,
  databaseTypeFactory,
  domainFactory,
  domainRecordFactory,
  entityTransferFactory,
  eventFactory,
  firewallDeviceFactory,
  firewallFactory,
  imageFactory,
  incidentResponseFactory,
  invoiceFactory,
  invoiceItemFactory,
  kubeEndpointFactory,
  kubernetesAPIResponse,
  linodeConfigFactory,
  linodeDiskFactory,
  linodeFactory,
  linodeIPFactory,
  linodeStatsFactory,
  linodeTransferFactory,
  longviewActivePlanFactory,
  longviewClientFactory,
  longviewSubscriptionFactory,
  maintenanceResponseFactory,
  makeObjectsPage,
  managedLinodeSettingFactory,
  managedSSHPubKeyFactory,
  managedStatsFactory,
  monitorFactory,
  nodeBalancerConfigFactory,
  nodeBalancerConfigNodeFactory,
  nodeBalancerFactory,
  nodePoolFactory,
  notificationFactory,
  objectStorageBucketFactory,
  objectStorageClusterFactory,
  objectStorageKeyFactory,
  paymentMethodFactory,
  possibleMySQLReplicationTypes,
  possiblePostgresReplicationTypes,
  profileFactory,
  promoFactory,
  securityQuestionsFactory,
  stackScriptFactory,
  staticObjects,
  supportReplyFactory,
  supportTicketFactory,
  tagFactory,
  VLANFactory,
  volumeFactory,
  managedIssueFactory,
  linodeTypeFactory,
  dedicatedTypeFactory,
  proDedicatedTypeFactory,
} from 'src/factories';
import { accountAgreementsFactory } from 'src/factories/accountAgreements';
import { grantFactory, grantsFactory } from 'src/factories/grants';
import { pickRandom } from 'src/utilities/random';

export const makeResourcePage = (
  e: any[],
  override: { page: number; pages: number; results?: number } = {
    page: 1,
    pages: 1,
  }
) => ({
  page: override.page ?? 1,
  pages: override.pages ?? 1,
  results: override.results ?? e.length,
  data: e,
});

const statusPage = [
  rest.get('*/api/v2/incidents*', (req, res, ctx) => {
    const response = incidentResponseFactory.build();
    return res(ctx.json(response));
  }),
  rest.get('*/api/v2/scheduled-maintenances*', (req, res, ctx) => {
    const response = maintenanceResponseFactory.build();
    return res(ctx.json(response));
  }),
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const entityTransfers = [
  rest.get('*/account/entity-transfers', (req, res, ctx) => {
    const transfers1 = entityTransferFactory.buildList(10);
    const transfers2 = entityTransferFactory.buildList(10, {
      token: 'TEST123',
    });
    const transfers3 = entityTransferFactory.buildList(10, {
      token: '987TEST',
    });
    const transfer4 = entityTransferFactory.build({
      is_sender: true,
      status: 'pending',
    });

    const combinedTransfers = transfers1.concat(
      transfers2,
      transfers3,
      transfer4
    );
    return res(ctx.json(makeResourcePage(combinedTransfers)));
  }),
  rest.get('*/account/entity-transfers/:transferId', (req, res, ctx) => {
    const transfer = entityTransferFactory.build();
    return res(ctx.json(transfer));
  }),
  rest.get('*/account/agreements', (req, res, ctx) =>
    res(ctx.json(accountAgreementsFactory.build()))
  ),
  rest.post('*/account/entity-transfers', (req, res, ctx) => {
    const payload = req.body as any;
    const newTransfer = entityTransferFactory.build({
      entities: payload.entities,
    });
    return res(ctx.json(newTransfer));
  }),
  rest.post(
    '*/account/entity-transfers/:transferId/accept',
    (req, res, ctx) => {
      return res(ctx.json({}));
    }
  ),
  rest.delete('*/account/entity-transfers/:transferId', (req, res, ctx) => {
    return res(ctx.json({}));
  }),
];

const databases = [
  rest.get('*/databases/instances', (req, res, ctx) => {
    const databases = databaseInstanceFactory.buildList(5);
    return res(ctx.json(makeResourcePage(databases)));
  }),

  rest.get('*/databases/types', (req, res, ctx) => {
    const standardTypes = [
      databaseTypeFactory.build({
        id: 'g6-standard-0',
        label: `Nanode 1 GB`,
        class: 'nanode',
        memory: 1024,
      }),
      ...databaseTypeFactory.buildList(7, { class: 'standard' }),
    ];
    const dedicatedTypes = databaseTypeFactory.buildList(7, {
      class: 'dedicated',
    });
    return res(
      ctx.json(makeResourcePage([...standardTypes, ...dedicatedTypes]))
    );
  }),

  rest.get('*/databases/engines', (req, res, ctx) => {
    const engine1 = databaseEngineFactory.buildList(3);
    const engine2 = databaseEngineFactory.buildList(3, {
      engine: 'postgresql',
    });
    const engine3 = databaseEngineFactory.buildList(3, {
      engine: 'mongodb',
    });

    const combinedList = [...engine1, ...engine2, ...engine3];

    return res(ctx.json(makeResourcePage(combinedList)));
  }),

  rest.get('*/databases/:engine/instances/:id', (req, res, ctx) => {
    const database = databaseFactory.build({
      id: req.params.id,
      label: `database-${req.params.id}`,
      engine: req.params.engine,
      ssl_connection: true,
      replication_type:
        req.params.engine === 'mysql'
          ? pickRandom(possibleMySQLReplicationTypes)
          : req.params.engine === 'postgresql'
          ? pickRandom(possiblePostgresReplicationTypes)
          : (undefined as any),
      replication_commit_type:
        req.params.engine === 'postgresql' ? 'local' : undefined,
      storage_engine:
        req.params.engine === 'mongodb' ? 'wiredtiger' : undefined,
      compression_type: req.params.engine === 'mongodb' ? 'none' : undefined,
    });
    return res(ctx.json(database));
  }),

  rest.get(
    '*/databases/:engine/instances/:databaseId/backups',
    (req, res, ctx) => {
      const backups = databaseBackupFactory.buildList(7);
      return res(ctx.json(makeResourcePage(backups)));
    }
  ),

  rest.get(
    '*/databases/:engine/instances/:databaseId/credentials',
    (req, res, ctx) => {
      return res(
        // ctx.status(400)
        ctx.json({
          username: 'lnroot',
          password: 'password123',
        })
      );
    }
  ),

  rest.get('*/databases/:engine/instances/:databaseId/ssl', (req, res, ctx) => {
    return res(
      ctx.json({
        public_key: 'testkey',
        certificate: 'testcertificate',
      })
    );
  }),

  rest.post(
    '*/databases/:engine/instances/:databaseId/backups/:backupId/restore',
    (req, res, ctx) => {
      return res(ctx.json({}));
    }
  ),

  rest.post(
    '*/databases/:engine/instances/:databaseId/credentials/reset',
    (req, res, ctx) => {
      return res(ctx.json({}));
    }
  ),

  rest.put('*/databases/mysql/instances/:databaseId', (req, res, ctx) => {
    const id = Number(req.params.databaseId);
    const body = req.body as any;
    return res(ctx.json({ ...databaseFactory.build({ id }), ...body }));
  }),

  rest.delete('*/databases/mysql/instances/:databaseId', (req, res, ctx) => {
    return res(ctx.json({}));
  }),
];

export const handlers = [
  rest.get('*/profile', (req, res, ctx) => {
    const profile = profileFactory.build({
      restricted: false,
    });
    return res(ctx.json(profile));
  }),
  rest.put('*/profile', (req, res, ctx) => {
    return res(ctx.json({ ...profileFactory.build(), ...(req.body as any) }));
  }),
  rest.get('*/profile/grants', (req, res, ctx) => {
    return res(ctx.json(grantsFactory.build()));
  }),
  rest.get('*/profile/apps', (req, res, ctx) => {
    const tokens = appTokenFactory.buildList(5);
    return res(ctx.json(makeResourcePage(tokens)));
  }),
  rest.post('*/profile/phone-number', async (req, res, ctx) => {
    await sleep(2000);
    return res(ctx.json({}));
  }),
  rest.post('*/profile/phone-number/verify', async (req, res, ctx) => {
    await sleep(2000);
    return res(ctx.json({}));
  }),
  rest.delete('*/profile/phone-number', (req, res, ctx) => {
    return res(ctx.json({}));
  }),
  rest.get('*/profile/security-questions', (req, res, ctx) => {
    return res(ctx.json(securityQuestionsFactory.build()));
  }),
  rest.post('*/profile/security-questions', (req, res, ctx) => {
    return res(ctx.json(req.body as SecurityQuestionsPayload));
  }),
  rest.get('*/regions', async (req, res, ctx) => {
    return res(
      ctx.json(
        cachedRegions.data.map((thisRegion) => ({
          ...thisRegion,
          status: 'outage',
        }))
      )
    );
  }),
  rest.get('*/images', async (req, res, ctx) => {
    const privateImages = imageFactory.buildList(5, {
      status: 'available',
      type: 'manual',
    });
    const creatingImages = imageFactory.buildList(2, {
      type: 'manual',
      status: 'creating',
    });
    const pendingImages = imageFactory.buildList(5, {
      status: 'pending_upload',
      type: 'manual',
    });
    const automaticImages = imageFactory.buildList(5, {
      type: 'automatic',
      expiry: '2021-05-01',
    });
    const publicImages = imageFactory.buildList(0, { is_public: true });
    const images = [
      ...automaticImages,
      ...privateImages,
      ...publicImages,
      ...pendingImages,
      ...creatingImages,
    ];
    return res(ctx.json(makeResourcePage(images)));
  }),
  rest.get('*/linode/types', (req, res, ctx) => {
    const standardTypes = linodeTypeFactory.buildList(7);
    const dedicatedTypes = dedicatedTypeFactory.buildList(7);
    const proDedicatedType = proDedicatedTypeFactory.build();
    return res(
      ctx.json(
        makeResourcePage([
          ...standardTypes,
          ...dedicatedTypes,
          proDedicatedType,
        ])
      )
    );
  }),
  rest.get('*/linode/instances', async (req, res, ctx) => {
    const onlineLinodes = linodeFactory.buildList(60, {
      backups: { enabled: false },
      ipv4: ['000.000.000.000'],
    });
    const linodeWithEligibleVolumes = linodeFactory.build({
      id: 20,
      label: 'debianDistro',
    });
    const offlineLinodes = linodeFactory.buildList(1, { status: 'offline' });
    const busyLinodes = linodeFactory.buildList(1, { status: 'migrating' });
    const eventLinode = linodeFactory.build({
      id: 999,
      status: 'rebooting',
      label: 'eventful',
    });
    const multipleIPLinode = linodeFactory.build({
      label: 'multiple-ips',
      ipv4: [
        '192.168.0.0',
        '192.168.0.1',
        '192.168.0.2',
        '192.168.0.3',
        '192.168.0.4',
        '192.168.0.5',
      ],
      tags: ['test1', 'test2', 'test3'],
    });
    const linodes = [
      ...onlineLinodes,
      linodeWithEligibleVolumes,
      ...offlineLinodes,
      ...busyLinodes,
      linodeFactory.build({
        label: 'shadow-plan',
        type: 'g5-standard-20-s1',
        backups: { enabled: false },
      }),
      linodeFactory.build({
        label: 'bare-metal',
        type: 'g1-metal-c2',
        backups: { enabled: false },
      }),
      linodeFactory.build({
        label: 'shadow-plan-with-tags',
        type: 'g5-standard-20-s1',
        backups: { enabled: false },
        tags: ['test1', 'test2', 'test3'],
      }),
      linodeFactory.build({
        label: 'eu-linode',
        region: 'eu-west',
      }),
      eventLinode,
      multipleIPLinode,
    ];
    return res(ctx.json(makeResourcePage(linodes)));
  }),
  rest.delete('*/instances/*', async (req, res, ctx) => {
    return res(ctx.json({}));
  }),
  rest.get('*/instances/*/configs', async (req, res, ctx) => {
    const configs = linodeConfigFactory.buildList(3);
    return res(ctx.json(makeResourcePage(configs)));
  }),
  rest.get('*/instances/*/disks', async (req, res, ctx) => {
    const disks = linodeDiskFactory.buildList(3);
    return res(ctx.json(makeResourcePage(disks)));
  }),
  rest.get('*/instances/*/transfer', async (req, res, ctx) => {
    const transfer = linodeTransferFactory.build();
    return res(ctx.json(transfer));
  }),
  rest.get('*/instances/*/stats*', async (req, res, ctx) => {
    const stats = linodeStatsFactory.build();
    return res(ctx.json(stats));
  }),
  rest.get('*/instances/*/stats', async (req, res, ctx) => {
    const stats = linodeStatsFactory.build();
    return res(ctx.json(stats));
  }),
  rest.get('*/instances/*/ips', async (req, res, ctx) => {
    const ips = linodeIPFactory.build();
    return res(ctx.json(ips));
  }),
  rest.post('*/instances', async (req, res, ctx) => {
    const payload = req.body as any;
    const linode = linodeFactory.build({
      label: payload?.label ?? 'new-linode',
      type: payload?.type ?? 'g6-standard-1',
      image: payload?.image ?? 'linode/debian-10',
      region: payload?.region ?? 'us-east',
    });
    return res(ctx.json(linode));
    // return res(
    //   ctx.status(400),
    //   ctx.json({ errors: [{ reason: 'Invalid label', field: 'data.label' }] })
    // );
  }),
  rest.get('*/lke/clusters', async (req, res, ctx) => {
    const clusters = kubernetesAPIResponse.buildList(10);
    return res(ctx.json(makeResourcePage(clusters)));
  }),
  rest.get('*/lke/clusters/:clusterId', async (req, res, ctx) => {
    const id = Number(req.params.clusterId);
    const cluster = kubernetesAPIResponse.build({ id, k8s_version: '1.16' });
    return res(ctx.json(cluster));
  }),
  rest.put('*/lke/clusters/:clusterId', async (req, res, ctx) => {
    const id = Number(req.params.clusterId);
    const k8s_version = req.params.k8s_version;
    const cluster = kubernetesAPIResponse.build({ id, k8s_version });
    return res(ctx.json(cluster));
  }),
  rest.get('*/lke/clusters/:clusterId/pools', async (req, res, ctx) => {
    const pools = nodePoolFactory.buildList(10);
    nodePoolFactory.resetSequenceNumber();
    return res(ctx.json(makeResourcePage(pools)));
  }),
  rest.get('*/lke/clusters/*/api-endpoints', async (req, res, ctx) => {
    const endpoints = kubeEndpointFactory.buildList(2);
    return res(ctx.json(makeResourcePage(endpoints)));
  }),
  rest.get('*/lke/clusters/*/recycle', async (req, res, ctx) => {
    return res(ctx.json({}));
  }),
  rest.get('*/firewalls/', (req, res, ctx) => {
    const firewalls = firewallFactory.buildList(10);
    firewallFactory.resetSequenceNumber();
    return res(ctx.json(makeResourcePage(firewalls)));
  }),
  rest.get('*/firewalls/*/devices', (req, res, ctx) => {
    const devices = firewallDeviceFactory.buildList(10);
    return res(ctx.json(makeResourcePage(devices)));
  }),
  rest.put('*/firewalls/:firewallId', (req, res, ctx) => {
    const firewall = firewallFactory.build({
      status: req.body?.['status'] ?? 'disabled',
    });
    return res(ctx.json(firewall));
  }),
  // rest.post('*/account/agreements', (req, res, ctx) => {
  //   return res(ctx.status(500), ctx.json({ reason: 'Unknown error' }));
  // }),
  rest.post('*/firewalls', (req, res, ctx) => {
    const payload = req.body as any;
    const newFirewall = firewallFactory.build({
      label: payload.label ?? 'mock-firewall',
    });
    return res(ctx.json(newFirewall));
  }),
  rest.get('*/nodebalancers', (req, res, ctx) => {
    const nodeBalancers = nodeBalancerFactory.buildList(0);
    return res(ctx.json(makeResourcePage(nodeBalancers)));
  }),
  rest.get('*/nodebalancers/:nodeBalancerID', (req, res, ctx) => {
    const nodeBalancer = nodeBalancerFactory.build({
      id: req.params.nodeBalancerID,
    });
    return res(ctx.json(nodeBalancer));
  }),
  rest.get('*/nodebalancers/:nodeBalancerID/configs', (req, res, ctx) => {
    const configs = nodeBalancerConfigFactory.buildList(2, {
      nodebalancer_id: req.params.nodeBalancerID,
    });
    return res(ctx.json(makeResourcePage(configs)));
  }),
  rest.get(
    '*/nodebalancers/:nodeBalancerID/configs/:configID/nodes',
    (req, res, ctx) => {
      const configs = nodeBalancerConfigNodeFactory.buildList(2, {
        nodebalancer_id: req.params.nodeBalancerID,
      });
      return res(ctx.json(makeResourcePage(configs)));
    }
  ),
  rest.get('*/object-storage/buckets/*/*/object-list', (req, res, ctx) => {
    const pageSize = Number(req.url.searchParams.get('page_size') || 100);
    const marker = req.url.searchParams.get('marker');

    if (!marker) {
      const end =
        pageSize > staticObjects.length ? staticObjects.length : pageSize;
      const is_truncated = staticObjects.length > pageSize;

      const page = staticObjects.slice(0, end);
      return res(
        ctx.json(
          makeObjectsPage(page, {
            is_truncated,
            next_marker: is_truncated ? staticObjects[pageSize].name : null,
          })
        )
      );
    }
    const index = staticObjects.findIndex((object) => object.name == marker);

    const end =
      index + pageSize > staticObjects.length
        ? staticObjects.length
        : index + pageSize;

    const page = staticObjects.slice(index, end);

    const is_truncated =
      page[page.length - 1].name !=
      staticObjects[staticObjects.length - 1].name;

    return res(
      ctx.json(
        makeObjectsPage(page, {
          is_truncated,
          next_marker: is_truncated ? staticObjects[end].name : null,
        })
      )
    );
  }),
  rest.get('*/object-storage/buckets/*', (req, res, ctx) => {
    // Temporarily added pagination logic to make sure my use of
    // getAll worked for fetching all buckets.

    objectStorageBucketFactory.resetSequenceNumber();
    const page = Number(req.url.searchParams.get('page') || 1);
    const pageSize = Number(req.url.searchParams.get('page_size') || 25);

    const buckets = objectStorageBucketFactory.buildList(650);

    return res(
      ctx.json({
        data: buckets.slice(
          (page - 1) * pageSize,
          (page - 1) * pageSize + pageSize
        ),
        page,
        pages: Math.ceil(buckets.length / pageSize),
        results: buckets.length,
      })
    );
  }),
  rest.get('*/object-storage/buckets', (req, res, ctx) => {
    const buckets = objectStorageBucketFactory.buildList(10);
    return res(ctx.json(makeResourcePage(buckets)));
  }),
  rest.get('*object-storage/clusters', (req, res, ctx) => {
    const clusters = objectStorageClusterFactory.buildList(3);
    return res(ctx.json(makeResourcePage(clusters)));
  }),
  rest.get('*object-storage/keys', (req, res, ctx) => {
    return res(
      ctx.json(makeResourcePage(objectStorageKeyFactory.buildList(3)))
    );
  }),
  rest.get('*/domains', (req, res, ctx) => {
    const domains = domainFactory.buildList(10);
    return res(ctx.json(makeResourcePage(domains)));
  }),
  rest.post('*/domains/*/records', (req, res, ctx) => {
    const record = domainRecordFactory.build();
    return res(ctx.json(record));
  }),
  rest.post('*/volumes/migrate', (req, res, ctx) => {
    return res(ctx.json({}));
  }),
  rest.get('*/regions/*/migration-queue', (req, res, ctx) => {
    return res(
      ctx.json({
        volumes: 953,
        linodes: 8,
      })
    );
  }),
  rest.get('*/volumes', (req, res, ctx) => {
    const hddVolumeUnattached = volumeFactory.build({
      id: 30,
      label: 'hdd-unattached',
    });
    const hddVolumeAttached = volumeFactory.build({
      id: 20,
      linode_id: 20,
      label: 'eligible-now-for-nvme',
    });
    const hddVolumeAttached2 = volumeFactory.build({
      id: 2,
      linode_id: 2,
      label: 'example-upgrading',
    });
    const nvmeVolumeUpgrading = volumeFactory.build({
      id: 2,
      hardware_type: 'nvme',
    });
    const newNVMeVolume = volumeFactory.build({
      id: 1,
      hardware_type: 'nvme',
    });

    const volumes = [
      newNVMeVolume,
      nvmeVolumeUpgrading,
      hddVolumeAttached,
      hddVolumeAttached2,
      hddVolumeUnattached,
      volumeFactory.build({
        status: 'contact_support',
      }),
      volumeFactory.build({
        status: 'creating',
      }),
      volumeFactory.build({
        status: 'deleting',
      }),
      volumeFactory.build({
        status: 'resizing',
      }),
    ];
    return res(ctx.json(makeResourcePage(volumes)));
  }),
  rest.post('*/volumes', (req, res, ctx) => {
    const volume = volumeFactory.build();
    return res(ctx.json(volume));
  }),
  rest.get('*/vlans', (req, res, ctx) => {
    const vlans = VLANFactory.buildList(2);
    return res(ctx.json(makeResourcePage(vlans)));
  }),
  rest.get('*/profile/preferences', (req, res, ctx) => {
    return res(ctx.json({}));
  }),
  rest.get('*/profile/devices', (req, res, ctx) => {
    return res(ctx.json(makeResourcePage([])));
  }),
  rest.put('*/profile/preferences', (req, res, ctx) => {
    const body = req.body as any;
    return res(ctx.json({ ...body }));
  }),
  rest.get('*/kubeconfig', (req, res, ctx) => {
    return res(ctx.json({ kubeconfig: 'SSBhbSBhIHRlYXBvdA==' }));
  }),
  rest.get('*invoices/:invoiceId/items', (req, res, ctx) => {
    const items = invoiceItemFactory.buildList(10);
    return res(ctx.json(makeResourcePage(items, { page: 1, pages: 4 })));
  }),
  rest.get('*/account', (req, res, ctx) => {
    const account = accountFactory.build({
      balance: 50,
      active_since: '2019-11-05',
      active_promotions: promoFactory.buildList(2),
    });
    return res(ctx.json(account));
  }),
  rest.put('*/account', (req, res, ctx) => {
    return res(ctx.json({ ...accountFactory.build(), ...(req.body as any) }));
  }),
  rest.get('*/account/transfer', (req, res, ctx) => {
    const transfer = accountTransferFactory.build();
    return res(ctx.delay(5000), ctx.json(transfer));
  }),
  rest.get('*/account/invoices', (req, res, ctx) => {
    const invoices = invoiceFactory.buildList(10);
    return res(ctx.json(makeResourcePage(invoices)));
  }),
  rest.get('*/account/maintenance', (req, res, ctx) => {
    accountMaintenanceFactory.resetSequenceNumber();
    const page = Number(req.url.searchParams.get('page') || 1);
    const pageSize = Number(req.url.searchParams.get('page_size') || 25);
    const headers = JSON.parse(req.headers.get('x-filter') || '{}');

    const accountMaintenance =
      headers.type === 'volume_migration'
        ? [
            accountMaintenanceFactory.build({
              entity: { type: 'volume', label: 'my-volume-0', id: 0 },
              status: 'pending',
              reason: 'Free upgrade to faster NVMe hardware',
              type: 'volume_migration',
            }),
          ]
        : [
            ...accountMaintenanceFactory.buildList(20, { status: 'pending' }),
            ...accountMaintenanceFactory.buildList(40, { status: 'started' }),
          ];

    if (req.headers.get('x-filter')) {
      accountMaintenance.sort((a, b) => {
        const statusA = a[headers['+order_by']];
        const statusB = b[headers['+order_by']];

        if (statusA < statusB) {
          return -1;
        }
        if (statusA > statusB) {
          return 1;
        }
        return 0;
      });

      if (headers['+order'] == 'desc') {
        accountMaintenance.reverse();
      }
      return res(
        ctx.json({
          data: accountMaintenance.slice(
            (page - 1) * pageSize,
            (page - 1) * pageSize + pageSize
          ),
          page,
          pages: Math.ceil(accountMaintenance.length / pageSize),
          results: accountMaintenance.length,
        })
      );
    }

    return res(ctx.json(makeResourcePage(accountMaintenance)));
  }),
  rest.get('*/account/users', (req, res, ctx) => {
    return res(ctx.json(makeResourcePage([profileFactory.build()])));
  }),
  rest.get('*/account/users/:user', (req, res, ctx) => {
    return res(ctx.json(profileFactory.build()));
  }),
  rest.get('*/account/users/:user/grants', (req, res, ctx) => {
    return res(
      ctx.json(
        grantsFactory.build({
          global: {
            cancel_account: true,
          },
          domain: [],
          firewall: [],
          image: [],
          linode: grantFactory.buildList(6000),
          longview: [],
          nodebalancer: [],
          stackscript: grantFactory.buildList(30),
          volume: grantFactory.buildList(100),
        })
      )
    );
  }),
  rest.get('*/account/payment-methods', (req, res, ctx) => {
    const defaultPaymentMethod = paymentMethodFactory.build({
      data: { card_type: 'MasterCard' },
      is_default: true,
    });

    const googlePayPaymentMethod = paymentMethodFactory.build({
      type: 'google_pay',
    });

    const paypalPaymentMethod = paymentMethodFactory.build({
      type: 'paypal',
      data: {
        email: 'test@example.com',
        paypal_id: '6781945682',
      },
    });

    const otherPaymentMethod = paymentMethodFactory.build();

    return res(
      ctx.json(
        makeResourcePage([
          defaultPaymentMethod,
          otherPaymentMethod,
          googlePayPaymentMethod,
          paypalPaymentMethod,
        ])
      )
    );
  }),
  rest.get('*/events', (req, res, ctx) => {
    const events = eventFactory.buildList(1, {
      action: 'lke_node_create',
      percent_complete: 15,
      entity: { type: 'linode', id: 999, label: 'linode-1' },
      message:
        'Rebooting this thing and showing an extremely long event message for no discernible reason other than the fairly obvious reason that we want to do some testing of whether or not these messages wrap.',
    });
    const volumeMigrationScheduled = eventFactory.build({
      entity: { type: 'volume', id: 6, label: 'bravoExample' },
      action: 'volume_migrate_scheduled' as EventAction,
      status: 'scheduled',
      message: 'Volume bravoExample has been scheduled for an upgrade to NVMe.',
      percent_complete: 100,
    });
    const volumeMigrating = eventFactory.build({
      entity: { type: 'volume', id: 2, label: 'example-upgrading' },
      action: 'volume_migrate' as EventAction,
      status: 'started',
      message: 'Volume example-upgrading is being upgraded to NVMe.',
      percent_complete: 65,
    });
    const volumeMigrationFinished = eventFactory.build({
      entity: { type: 'volume', id: 6, label: 'alphaExample' },
      action: 'volume_migrate',
      status: 'finished',
      message: 'Volume alphaExample has finished upgrading to NVMe.',
      percent_complete: 100,
    });
    const oldEvents = eventFactory.buildList(20, {
      action: 'account_update',
      seen: true,
      percent_complete: 100,
    });
    return res.once(
      ctx.json(
        makeResourcePage([
          ...events,
          ...oldEvents,
          volumeMigrationScheduled,
          volumeMigrating,
          volumeMigrationFinished,
        ])
      )
    );
  }),
  rest.get('*/support/tickets', (req, res, ctx) => {
    const tickets = supportTicketFactory.buildList(15, { status: 'open' });
    return res(ctx.json(makeResourcePage(tickets)));
  }),
  rest.get('*/support/tickets/999', (req, res, ctx) => {
    const ticket = supportTicketFactory.build({
      id: 999,
      closed: new Date().toISOString(),
    });
    return res(ctx.json(ticket));
  }),
  rest.get('*/support/tickets/:ticketId', (req, res, ctx) => {
    const ticket = supportTicketFactory.build({ id: req.params.ticketId });
    return res(ctx.json(ticket));
  }),
  rest.get('*/support/tickets/:ticketId/replies', (req, res, ctx) => {
    const replies = supportReplyFactory.buildList(15);
    return res(ctx.json(makeResourcePage(replies)));
  }),
  rest.put('*/longview/plan', (req, res, ctx) => {
    return res(ctx.json({}));
  }),
  rest.get('*/longview/plan', (req, res, ctx) => {
    const plan = longviewActivePlanFactory.build();
    return res(ctx.json(plan));
  }),
  rest.get('*/longview/subscriptions', (req, res, ctx) => {
    const subscriptions = longviewSubscriptionFactory.buildList(10);
    return res(ctx.json(makeResourcePage(subscriptions)));
  }),
  rest.get('*/longview/clients', (req, res, ctx) => {
    const clients = longviewClientFactory.buildList(10);
    return res(ctx.json(makeResourcePage(clients)));
  }),
  rest.post('*/backups/enable/*', (req, res, ctx) => {
    return res(ctx.json({}));
  }),
  rest.get('*/account/settings', (req, res, ctx) => {
    return res(
      ctx.json({
        backups_enabled: true,
        longview_subscription: 'longview-100',
        managed: true,
        network_helper: true,
        object_storage: 'active',
      })
    );
  }),
  rest.put('*/account/settings/*', (req, res, ctx) => {
    return res(ctx.json({}));
  }),
  rest.get('*/tags', (req, res, ctx) => {
    tagFactory.resetSequenceNumber();
    const tags = tagFactory.buildList(5);
    return res(ctx.json(makeResourcePage(tags)));
  }),
  rest.get('*gravatar*', (req, res, ctx) => {
    return res(ctx.status(400), ctx.json({}));
  }),
  rest.get('*linode.com/blog/feed*', (req, res, ctx) => {
    return res(ctx.status(400));
  }),
  rest.get('*managed/services', (req, res, ctx) => {
    const monitors = monitorFactory.buildList(5);
    const downUnresolvedMonitor = monitorFactory.build({
      id: 998,
      status: 'problem',
    });
    const downResolvedMonitor = monitorFactory.build({
      id: 999,
      label: 'Problem',
      status: 'problem',
    });
    return res(
      ctx.json(
        makeResourcePage([
          ...monitors,
          downUnresolvedMonitor,
          downResolvedMonitor,
        ])
      )
    );
  }),
  rest.post('*/managed/services', (req, res, ctx) => {
    const monitor = monitorFactory.build(req.body as any);
    return res(ctx.json(monitor));
  }),
  rest.put('*/managed/services/:id', (req, res, ctx) => {
    const payload = req.body as any;

    return res(
      ctx.json(
        monitorFactory.build({
          ...payload,
          id: Number(req.params.id),
        })
      )
    );
  }),
  rest.delete('*/managed/services/:id', (_req, res, ctx) => {
    return res(ctx.json({}));
  }),
  rest.get('*managed/stats', (req, res, ctx) => {
    const stats = managedStatsFactory.build();
    return res(ctx.json(stats));
  }),
  rest.get('*managed/issues', (req, res, ctx) => {
    const openIssue = managedIssueFactory.build({
      services: [998],
      entity: { id: 1 },
      created: DateTime.now().minus({ days: 2 }).toISO(),
    });
    const closedIssue = managedIssueFactory.build({
      services: [999],
      entity: { id: 999 },
      created: DateTime.now().minus({ days: 2 }).toISO(),
    });
    return res(ctx.json(makeResourcePage([openIssue, closedIssue])));
  }),
  rest.get('*managed/linode-settings', (req, res, ctx) => {
    return res(
      ctx.json(makeResourcePage(managedLinodeSettingFactory.buildList(5)))
    );
  }),
  rest.get('*managed/credentials/sshkey', (req, res, ctx) => {
    return res(ctx.json(managedSSHPubKeyFactory.build()));
  }),
  rest.get('*managed/credentials', (req, res, ctx) => {
    return res(ctx.json(makeResourcePage(credentialFactory.buildList(5))));
  }),
  rest.post('*managed/credentials', (req, res, ctx) => {
    const response = credentialFactory.build({
      ...(req.body as any),
    });

    return res(ctx.json(response));
  }),
  rest.post('*managed/credentials/:id/revoke', (req, res, ctx) => {
    return res(ctx.json({}));
  }),
  rest.get('*managed/contacts', (req, res, ctx) => {
    return res(ctx.json(makeResourcePage(contactFactory.buildList(5))));
  }),
  rest.delete('*managed/contacts/:id', (req, res, ctx) => {
    return res(ctx.json({}));
  }),
  rest.put('*managed/contacts/:id', (req, res, ctx) => {
    const payload = {
      ...(req.body as any),
      id: Number(req.params.id),
    };

    return res(ctx.json(payload));
  }),
  rest.post('*managed/contacts', (req, res, ctx) => {
    const response = contactFactory.build({
      ...(req.body as any),
    });
    return res(ctx.json(response));
  }),
  rest.get('*stackscripts/', (req, res, ctx) => {
    return res(ctx.json(makeResourcePage(stackScriptFactory.buildList(1))));
  }),
  rest.get('*/notifications', (req, res, ctx) => {
    // pastDueBalance included here merely for ease of testing for Notifications section in the Notifications drawer.
    const pastDueBalance = notificationFactory.build({
      entity: null,
      label: 'past due',
      message: `You have a past due balance of $58.50. Please make a payment immediately to avoid service disruption.`,
      type: 'payment_due',
      severity: 'critical',
      when: null,
      until: null,
      body: null,
    });

    // const gdprNotification = gdprComplianceNotification.build();

    const generalGlobalNotice = {
      type: 'notice',
      entity: null,
      when: null,
      // eslint-disable-next-line xss/no-mixed-html
      message:
        "We've updated our policies. See <a href='https://cloud.linode.com/support'>this page</a> for more information.",
      label: "We've updated our policies.",
      severity: 'minor',
      until: null,
      body: null,
    };

    const outageNotification = {
      type: 'outage',
      entity: {
        type: 'region',
        label: null,
        id: 'us-east',
        url: '/regions/us-east',
      },
      when: null,
      message:
        'We are aware of an issue affecting service in this facility. If you are experiencing service issues in this facility, there is no need to open a support ticket at this time. Please monitor our status blog at https://status.linode.com for further information.  Thank you for your patience and understanding.',
      label: 'There is an issue affecting service in this facility',
      severity: 'major',
      until: null,
      body: null,
    };

    const emailBounce = notificationFactory.build({
      type: 'billing_email_bounce',
      entity: null,
      when: null,
      message: 'We are unable to send emails to your billing email address!',
      label: 'We are unable to send emails to your billing email address!',
      severity: 'major',
      until: null,
      body: null,
    });

    const abuseTicket = abuseTicketNotificationFactory.build();

    const migrationNotification = notificationFactory.build({
      type: 'migration_pending',
      label: 'You have a migration pending!',
      message:
        'You have a migration pending! Your Linode must be offline before starting the migration.',
      entity: { id: 0, type: 'linode', label: 'linode-0' },
      severity: 'major',
    });

    const minorSeverityNotification = notificationFactory.build({
      type: 'notice',
      message: 'Testing for minor notification',
      severity: 'minor',
    });

    const criticalSeverityNotification = notificationFactory.build({
      type: 'notice',
      message: 'Testing for critical notification',
      severity: 'critical',
    });

    const balanceNotification = notificationFactory.build({
      type: 'payment_due',
      message: 'You have an overdue balance!',
      severity: 'major',
    });

    const blockStorageMigrationScheduledNotification = notificationFactory.build(
      {
        type: 'volume_migration_scheduled' as NotificationType,
        entity: {
          type: 'volume',
          label: 'eligibleNow',
          id: 20,
          url: '/volumes/20',
        },
        when: '2021-09-30T04:00:00',
        message:
          'The Linode that the volume is attached to will shut down in order to complete the upgrade and reboot once it is complete. Any other volumes attached to the same Linode will also be upgraded.',
        label: 'You have a scheduled Block Storage volume upgrade pending!',
        severity: 'critical',
        until: '2021-10-16T04:00:00',
        body: 'Your volumes in us-east will be upgraded to NVMe.',
      }
    );

    const blockStorageMigrationScheduledNotificationUnattached = notificationFactory.build(
      {
        type: 'volume_migration_scheduled' as NotificationType,
        entity: {
          type: 'volume',
          label: 'hdd-unattached',
          id: 30,
          url: '/volumes/30',
        },
        when: '2021-09-30T04:00:00',
        message:
          'This unattached volume is scheduled to be migrated to NVMe I think.',
        label: 'You have a scheduled Block Storage volume upgrade pending!',
        severity: 'critical',
        until: '2021-10-16T04:00:00',
        body: 'Your volume will be upgraded to NVMe.',
      }
    );

    const blockStorageMigrationImminentNotification = notificationFactory.build(
      {
        type: 'volume_migration_imminent' as NotificationType,
        entity: {
          type: 'volume',
          label: 'example-upgrading',
          id: 2,
          url: '/volumes/2',
        },
        when: '2021-09-30T04:00:00',
        message:
          'The Linode that the volume is attached to will shut down in order to complete the upgrade and reboot once it is complete. Any other volumes attached to the same Linode will also be upgraded.',
        label: 'You have a scheduled Block Storage volume upgrade pending!',
        severity: 'major',
        until: '2021-10-16T04:00:00',
        body: 'Your volumes in us-east will be upgraded to NVMe.',
      }
    );

    return res(
      ctx.json(
        makeResourcePage([
          pastDueBalance,
          ...notificationFactory.buildList(1),
          // gdprNotification,
          generalGlobalNotice,
          outageNotification,
          minorSeverityNotification,
          criticalSeverityNotification,
          abuseTicket,
          emailBounce,
          migrationNotification,
          balanceNotification,
          blockStorageMigrationScheduledNotification,
          blockStorageMigrationImminentNotification,
          blockStorageMigrationScheduledNotificationUnattached,
        ])
      )
    );
  }),
  rest.post('*/networking/vlans', (req, res, ctx) => {
    return res(ctx.json({}));
  }),
  rest.post('*/networking/ipv6/ranges', (req, res, ctx) => {
    const range = req.body?.['prefix_length'];
    return res(ctx.json({ range, route_target: '2001:DB8::0000' }));
  }),
  rest.post('*/networking/ips/assign', (req, res, ctx) => {
    return res(ctx.json({}));
  }),
  rest.post('*/account/payments', (req, res, ctx) => {
    return res(ctx.json(creditPaymentResponseFactory.build()));
  }),
  // rest.get('*/databases/mysql/instances', (req, res, ctx) => {
  //   const online = databaseFactory.build({ status: 'ready' });
  //   const initializing = databaseFactory.build({ status: 'initializing' });
  //   const error = databaseFactory.build({ status: 'error' });
  //   const unknown = databaseFactory.build({ status: 'unknown' });
  //   const databases = [online, initializing, error, unknown];
  //   return res(ctx.json(makeResourcePage(databases)));
  // }),
  ...entityTransfers,
  ...statusPage,
  ...databases,
];

// Generator functions for dynamic handlers, in use by mock data dev tools.
export const mockDataHandlers: Record<
  keyof MockData,
  (count: number) => RequestHandler
> = {
  linode: (count) =>
    rest.get('*/linode/instances', async (req, res, ctx) => {
      const linodes = linodeFactory.buildList(count);
      return res(ctx.json(makeResourcePage(linodes)));
    }),
  nodeBalancer: (count) =>
    rest.get('*/nodebalancers', (req, res, ctx) => {
      const nodeBalancers = nodeBalancerFactory.buildList(count);
      return res(ctx.json(makeResourcePage(nodeBalancers)));
    }),
  domain: (count) =>
    rest.get('*/domains', (req, res, ctx) => {
      const domains = domainFactory.buildList(count);
      return res(ctx.json(makeResourcePage(domains)));
    }),
  volume: (count) =>
    rest.get('*/volumes', (req, res, ctx) => {
      const volumes = volumeFactory.buildList(count);
      return res(ctx.json(makeResourcePage(volumes)));
    }),
};
