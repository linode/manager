/**
 * @deprecated
 *
 * This mocking mode is being phased out.
 * It remains available in out DEV tools for convenience and backward compatibility, it is however discouraged to add new handlers to it.
 *
 * New handlers should be added to the CRUD baseline preset instead (ex: src/mocks/presets/crud/handlers/linodes.ts) which support a much more dynamic data mocking.
 */
import {
  acceleratedTypeFactory,
  accountAvailabilityFactory,
  accountBetaFactory,
  betaFactory,
  dedicatedTypeFactory,
  gpuTypeAdaFactory,
  gpuTypeRtxFactory,
  grantFactory,
  grantsFactory,
  linodeFactory,
  linodeIPFactory,
  linodeStatsFactory,
  linodeTransferFactory,
  linodeTypeFactory,
  nodeBalancerConfigFactory,
  nodeBalancerConfigNodeFactory,
  nodeBalancerFactory,
  pickRandom,
  premiumTypeFactory,
  proDedicatedTypeFactory,
  profileFactory,
  regionAvailabilityFactory,
  regions,
  securityQuestionsFactory,
} from '@linode/utilities';
import { DateTime } from 'luxon';
import { http, HttpResponse } from 'msw';

import { MOCK_THEME_STORAGE_KEY } from 'src/dev-tools/ThemeSelector';
import {
  // abuseTicketNotificationFactory,
  accountFactory,
  accountMaintenanceFactory,
  accountTransferFactory,
  alertDimensionsFactory,
  alertFactory,
  alertRulesFactory,
  appTokenFactory,
  blockStorageMetricCriteria,
  blockStorageMetricRules,
  contactFactory,
  credentialFactory,
  creditPaymentResponseFactory,
  dashboardFactory,
  databaseBackupFactory,
  databaseEngineFactory,
  databaseFactory,
  databaseInstanceFactory,
  databaseTypeFactory,
  dimensionFilterFactory,
  domainFactory,
  domainRecordFactory,
  entityTransferFactory,
  eventFactory,
  firewallDeviceFactory,
  firewallEntityfactory,
  firewallFactory,
  firewallMetricDefinitionsResponse,
  firewallMetricRulesFactory,
  firewallNodebalancerMetricCriteria,
  imageFactory,
  incidentResponseFactory,
  invoiceFactory,
  invoiceItemFactory,
  kubeEndpointFactory,
  kubeLinodeFactory,
  kubernetesAPIResponse,
  kubernetesVersionFactory,
  linodeConfigFactory,
  linodeDiskFactory,
  lkeEnterpriseTypeFactory,
  lkeHighAvailabilityTypeFactory,
  lkeStandardAvailabilityTypeFactory,
  longviewActivePlanFactory,
  longviewClientFactory,
  longviewSubscriptionFactory,
  maintenanceResponseFactory,
  makeObjectsPage,
  managedIssueFactory,
  managedLinodeSettingFactory,
  managedSSHPubKeyFactory,
  managedStatsFactory,
  monitorFactory,
  mysqlConfigResponse,
  nodeBalancerTypeFactory,
  nodePoolFactory,
  notificationChannelFactory,
  notificationFactory,
  objectStorageBucketFactoryGen2,
  objectStorageClusterFactory,
  objectStorageEndpointsFactory,
  objectStorageKeyFactory,
  objectStorageMetricCriteria,
  objectStorageMetricRules,
  objectStorageOverageTypeFactory,
  objectStorageTypeFactory,
  paymentFactory,
  paymentMethodFactory,
  placementGroupFactory,
  possibleMySQLReplicationTypes,
  possiblePostgresReplicationTypes,
  postgresConfigResponse,
  promoFactory,
  serviceAlertFactory,
  serviceTypesFactory,
  stackScriptFactory,
  staticObjects,
  subnetFactory,
  supportReplyFactory,
  supportTicketFactory,
  tagFactory,
  VLANFactory,
  volumeFactory,
  volumeTypeFactory,
  vpcFactory,
  widgetFactory,
} from 'src/factories';
import { accountAgreementsFactory } from 'src/factories/accountAgreements';
import { accountLoginFactory } from 'src/factories/accountLogin';
import { accountUserFactory } from 'src/factories/accountUsers';
import { LinodeKernelFactory } from 'src/factories/linodeKernel';
import { quotaFactory } from 'src/factories/quotas';
import { getStorage } from 'src/utilities/storage';

import type { PathParams } from 'msw';

const getRandomWholeNumber = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1) + min);

import { accountEntityFactory } from 'src/factories/accountEntities';
import { accountRolesFactory } from 'src/factories/accountRoles';
import { trustedDeviceFactory } from 'src/factories/devices';
import { maintenancePolicyFactory } from 'src/factories/maintenancePolicy';
import { userAccountPermissionsFactory } from 'src/factories/userAccountPermissions';
import { userEntityPermissionsFactory } from 'src/factories/userEntityPermissions';
import { userRolesFactory } from 'src/factories/userRoles';

import type {
  AccountMaintenance,
  AlertDefinitionScope,
  AlertDefinitionType,
  AlertSeverityType,
  AlertStatusType,
  CloudPulseServiceType,
  CreateAlertDefinitionPayload,
  CreateObjectStorageKeyPayload,
  Dashboard,
  Database,
  FirewallStatus,
  NotificationType,
  ObjectStorageEndpointTypes,
  SecurityQuestionsPayload,
  ServiceTypesList,
  TokenRequest,
  UpdateImageRegionsPayload,
  User,
  VolumeStatus,
} from '@linode/api-v4';

export const makeResourcePage = <T>(
  e: T[],
  override: { page: number; pages: number; results?: number } = {
    page: 1,
    pages: 1,
  }
) => ({
  data: e,
  page: override.page ?? 1,
  pages: override.pages ?? 1,
  results: override.results ?? e.length,
});

const makeMockDatabase = (params: PathParams): Database => {
  const isDefault = Number(params.id) % 2 !== 0;
  const db: Record<string, boolean | number | string | undefined> = {
    engine: params.engine as 'mysql',
    id: Number(params.id),
    label: `database-${params.id}`,
    platform: isDefault ? 'rdbms-default' : 'rdbms-legacy',
  };
  if (!isDefault) {
    db.replication_commit_type =
      params.engine === 'postgresql' ? 'local' : undefined;

    db.replication_type =
      params.engine === 'mysql'
        ? pickRandom(possibleMySQLReplicationTypes)
        : undefined;

    db.replication_type =
      params.engine === 'postgresql'
        ? pickRandom(possiblePostgresReplicationTypes)
        : undefined;

    db.ssl_connection = true;
  }
  const database = databaseFactory.build(db);

  if (database.platform !== 'rdbms-default') {
    delete database.private_network;
  }

  if (database.platform === 'rdbms-default' && !!database.private_network) {
    // When a database is configured with a VPC, the primary and standby hostnames are prepended with 'private-' in the backend
    database.hosts = {
      primary: 'private-db-mysql-primary-0.b.linodeb.net',
      standby: 'private-db-mysql-standby-0.b.linodeb.net',
    };
  }

  return database;
};

const statusPage = [
  http.get('*/api/v2/incidents*', () => {
    const response = incidentResponseFactory.build();
    return HttpResponse.json(response);
  }),
  http.get('*/api/v2/scheduled-maintenances*', () => {
    const response = maintenanceResponseFactory.build();
    return HttpResponse.json(response);
  }),
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const entityTransfers = [
  http.get('*/account/service-transfers', () => {
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
    const transfer5 = entityTransferFactory.build({
      is_sender: true,
      status: 'canceled',
    });

    const combinedTransfers = transfers1.concat(
      transfers2,
      transfers3,
      transfer4,
      transfer5
    );
    return HttpResponse.json(makeResourcePage(combinedTransfers));
  }),
  http.get('*/account/service-transfers/:transferId', () => {
    const transfer = entityTransferFactory.build();
    return HttpResponse.json(transfer);
  }),
  http.get('*/account/agreements', () =>
    HttpResponse.json(accountAgreementsFactory.build())
  ),
  http.post('*/account/service-transfers', async ({ request }) => {
    const body = await request.json();
    const payload = body as any;
    const newTransfer = entityTransferFactory.build({
      entities: payload.entities,
    });
    return HttpResponse.json(newTransfer);
  }),
  http.post('*/account/service-transfers/:transferId/accept', () => {
    return HttpResponse.json({});
  }),
  http.delete('*/account/service-transfers/:transferId', () => {
    return HttpResponse.json({});
  }),
];

const databases = [
  http.get('*/databases/instances', () => {
    const database1 = databaseInstanceFactory.build({
      cluster_size: 1,
      id: 1,
      label: 'database-instance-1',
    });
    const database2 = databaseInstanceFactory.build({
      cluster_size: 2,
      id: 2,
      label: 'database-instance-2',
    });
    const database3 = databaseInstanceFactory.build({
      cluster_size: 3,
      id: 3,
      label: 'database-instance-3',
    });
    const database4 = databaseInstanceFactory.build({
      cluster_size: 1,
      id: 4,
      label: 'database-instance-4',
    });
    const database5 = databaseInstanceFactory.build({
      cluster_size: 1,
      id: 5,
      label: 'database-instance-5',
    });

    const databases = [database1, database2, database3, database4, database5];
    return HttpResponse.json(makeResourcePage(databases));
  }),

  http.get('*/databases/types', () => {
    const standardTypes = [
      databaseTypeFactory.build({
        class: 'nanode',
        id: 'g6-nanode-1',
        label: `Nanode 1 GB`,
        memory: 1024,
      }),
      databaseTypeFactory.build({
        class: 'nanode',
        id: 'g6-standard-1',
        label: `Linode 2 GB`,
        memory: 2048,
      }),
      ...databaseTypeFactory.buildList(7, { class: 'standard' }),
    ];
    const dedicatedTypes = databaseTypeFactory.buildList(7, {
      class: 'dedicated',
    });

    const planSizes = [4, 8, 16, 32, 64, 96, 128, 256];
    const premiumTypes = planSizes.map((size) => {
      return databaseTypeFactory.build({
        class: 'premium',
        id: `premium-${size}`,
        label: `DBaaS - Premium ${size} GB`,
        memory: size * 1024,
      });
    });

    return HttpResponse.json(
      makeResourcePage([...standardTypes, ...dedicatedTypes, ...premiumTypes])
    );
  }),

  http.get('*/databases/engines', () => {
    const engine1 = databaseEngineFactory.buildList(3);
    const engine2 = databaseEngineFactory.buildList(3, {
      engine: 'postgresql',
    });

    const combinedList = [...engine1, ...engine2];

    return HttpResponse.json(makeResourcePage(combinedList));
  }),

  http.get('*/databases/:engine/instances/:id', ({ params }) => {
    const database = makeMockDatabase(params);
    return HttpResponse.json(database);
  }),

  http.put('*/databases/:engine/instances/:id', ({ params }) => {
    const database = makeMockDatabase(params);
    return HttpResponse.json(database);
  }),

  http.get('*/databases/:engine/instances/:databaseId/backups', () => {
    const backups = databaseBackupFactory.buildList(10);
    return HttpResponse.json(makeResourcePage(backups));
  }),

  http.get('*/databases/:engine/instances/:databaseId/credentials', () => {
    return HttpResponse.json({
      password: 'password123',
      username: 'lnroot',
    });
  }),

  http.get('*/databases/:engine/instances/:databaseId/ssl', () => {
    return HttpResponse.json({
      certificate: 'testcertificate',
      public_key: 'testkey',
    });
  }),

  http.post('*/databases/:engine/instances', async ({ params, request }) => {
    const body = await request.json();
    const payload: any = body;
    return HttpResponse.json({
      ...databaseFactory.build({
        engine: params.engine as 'mysql',
        label: payload?.label ?? 'Database',
      }),
    });
  }),

  http.post(
    '*/databases/:engine/instances/:databaseId/backups/:backupId/restore',
    () => {
      return HttpResponse.json({});
    }
  ),

  http.post(
    '*/databases/:engine/instances/:databaseId/credentials/reset',
    () => {
      return HttpResponse.json({});
    }
  ),

  http.put(
    '*/databases/mysql/instances/:databaseId',
    async ({ params, request }) => {
      const reqBody = await request.json();
      const id = Number(params.databaseId);
      const body = reqBody as any;
      return HttpResponse.json({ ...databaseFactory.build({ id }), ...body });
    }
  ),

  http.delete('*/databases/mysql/instances/:databaseId', () => {
    return HttpResponse.json({});
  }),

  http.post('*/databases/:engine/instances/:databaseId/suspend', () => {
    return HttpResponse.json({});
  }),

  http.post('*/databases/:engine/instances/:databaseId/resume', () => {
    return HttpResponse.json({});
  }),
  http.get('*/databases/:engine/config', ({ params }) => {
    const { engine } = params as { engine: string };
    if (engine === 'mysql') {
      return HttpResponse.json(mysqlConfigResponse);
    }
    if (engine === 'postgresql') {
      return HttpResponse.json(postgresConfigResponse);
    }

    return HttpResponse.json(mysqlConfigResponse);
  }),
];

const vpc = [
  http.get('*/v4beta/vpcs', () => {
    const vpcsWithSubnet1 = vpcFactory.buildList(5, {
      subnets: subnetFactory.buildList(Math.floor(Math.random() * 10) + 1),
    });
    const vpcsWithSubnet2 = vpcFactory.buildList(5, {
      region: 'eu-west',
      subnets: subnetFactory.buildList(Math.floor(Math.random() * 20) + 1),
    });
    const vpcsWithoutSubnet = vpcFactory.buildList(20);
    return HttpResponse.json(
      makeResourcePage([
        ...vpcsWithSubnet1,
        ...vpcsWithSubnet2,
        ...vpcsWithoutSubnet,
      ])
    );
  }),
  http.get('*/v4beta/vpcs/:vpcId', () => {
    return HttpResponse.json(
      vpcFactory.build({
        description: `VPC for webserver and database. VPC for webserver and database. VPC for webserver and database. VPC for webserver and database. VPC for webserver VPC for webserver VPC for webserver VPC for webserver VPC for webserver.VPC for webserver and database!!! VPC`,
        subnets: subnetFactory.buildList(Math.floor(Math.random() * 10) + 1),
      })
    );
  }),
  http.get('*/v4beta/vpcs/:vpcId/subnets', () => {
    return HttpResponse.json(makeResourcePage(subnetFactory.buildList(30)));
  }),
  http.delete('*/v4beta/vpcs/:vpcId/subnets/:subnetId', () => {
    return HttpResponse.json({});
  }),
  http.delete('*/v4beta/vpcs/:vpcId', () => {
    return HttpResponse.json({});
  }),
  http.put('*/v4beta/vpcs/:vpcId', () => {
    return HttpResponse.json(vpcFactory.build({ description: 'testing' }));
  }),
  http.get('*/v4beta/vpcs/:vpcID', ({ params }) => {
    const id = Number(params.id);
    return HttpResponse.json(vpcFactory.build({ id }));
  }),
  http.post('*/v4beta/vpcs', async ({ request }) => {
    const body = await request.json();
    const vpc = vpcFactory.build({ ...(body as any) });
    return HttpResponse.json(vpc);
  }),
  http.post('*/v4beta/vpcs/:vpcId/subnets', async ({ request }) => {
    const body = await request.json();
    const subnet = subnetFactory.build({ ...(body as any) });
    return HttpResponse.json(subnet);
  }),
];

const iam = [
  http.get('*/iam/role-permissions', () => {
    return HttpResponse.json(accountRolesFactory.build());
  }),
  http.get('*/iam/users/:username/role-permissions', () => {
    return HttpResponse.json(userRolesFactory.build());
  }),
  http.get('*/iam/users/:username/permissions/:entity_type/:entity_id', () => {
    return HttpResponse.json(userEntityPermissionsFactory);
  }),
  http.get('*/v4*/iam/users/:username/permissions/account', () => {
    return HttpResponse.json(userAccountPermissionsFactory);
  }),
];

const entities = [
  http.get('*/v4*/entities', () => {
    const entity1 = accountEntityFactory.buildList(10, {
      type: 'linode',
    });
    const entity2 = accountEntityFactory.build({
      type: 'image',
    });
    const entity3 = accountEntityFactory.build({
      id: 1,
      label: 'firewall-1',
      type: 'firewall',
    });
    const entities = [...entity1, entity2, entity3];

    return HttpResponse.json(makeResourcePage(entities));
  }),
];

const nanodeType = linodeTypeFactory.build({ id: 'g6-nanode-1' });
const standardTypes = linodeTypeFactory.buildList(7);
const dedicatedTypes = dedicatedTypeFactory.buildList(7);
const proDedicatedType = proDedicatedTypeFactory.build();
const gpuTypesAda = gpuTypeAdaFactory.buildList(7);
const gpuTypesRX = gpuTypeRtxFactory.buildList(7);
const premiumTypes = [
  ...premiumTypeFactory.buildList(6),
  linodeTypeFactory.build({
    class: 'premium',
    disk: 10240000,
    id: 'g8-premium-128-ht',
    label: 'Premium HT 512 GB',
    memory: 524288,
    network_out: 40000,
    price: {
      hourly: 7.0,
      monthly: 5040.0,
    },
    transfer: 24000,
    vcpus: 128,
  }),
];
const acceleratedType = acceleratedTypeFactory.buildList(7);

const proxyAccountUser = accountUserFactory.build({
  email: 'partner@proxy.com',
  last_login: null,
  user_type: 'proxy',
  username: 'ParentCompany_a1b2c3d4e5',
});
const parentAccountUser = accountUserFactory.build({
  email: 'parent@acme.com',
  last_login: null,
  restricted: false,
  user_type: 'parent',
  username: 'ParentUser',
});
const childAccountUser = accountUserFactory.build({
  email: 'child@linode.com',
  last_login: null,
  restricted: false,
  user_type: 'child',
  username: 'ChildUser',
});
const parentAccountNonAdminUser = accountUserFactory.build({
  email: 'account@linode.com',
  last_login: null,
  restricted: false,
  username: 'NonAdminUser',
});

export const handlers = [
  ...iam,
  http.get('*/profile', () => {
    const profile = profileFactory.build({
      restricted: false,
      // Parent/Child: switch the `user_type` depending on what account view you need to mock.
      user_type: 'parent',
      // PLACEMENT GROUPS TESTING - Permissions and Grants:
      // Uncomment the two lines below: This is important! The grants endpoint is only called for restricted users.
      // restricted: true,
      // user_type: 'default',
    });
    return HttpResponse.json(profile);
  }),

  http.put('*/profile', async ({ request }) => {
    const body = await request.json();

    return HttpResponse.json({ ...profileFactory.build(), ...(body as any) });
  }),
  http.get('*/profile/grants', () => {
    // PLACEMENT GROUPS TESTING - Permissions and Grants
    return HttpResponse.json(
      grantsFactory.build({ global: { add_linodes: false } })
    );
  }),
  http.get('*/profile/apps', () => {
    const tokens = appTokenFactory.buildList(30);
    return HttpResponse.json(makeResourcePage(tokens));
  }),
  http.post('*/profile/phone-number', async () => {
    await sleep(2000);
    return HttpResponse.json({});
  }),
  http.post('*/profile/phone-number/verify', async () => {
    await sleep(2000);
    return HttpResponse.json({});
  }),
  http.delete('*/profile/phone-number', () => {
    return HttpResponse.json({});
  }),
  http.get('*/profile/security-questions', () => {
    return HttpResponse.json(securityQuestionsFactory.build());
  }),
  http.post<any, SecurityQuestionsPayload>(
    '*/profile/security-questions',
    async ({ request }) => {
      const body = await request.json();

      return HttpResponse.json(body);
    }
  ),
  http.get('*/regions', async () => {
    return HttpResponse.json(makeResourcePage(regions));
  }),
  http.get<{ id: string }>('*/v4/images/:id', ({ params }) => {
    const distributedImage = imageFactory.build({
      capabilities: ['cloud-init', 'distributed-sites'],
      id: 'private/distributed-image',
      label: 'distributed-image',
      regions: [{ region: 'us-east', status: 'available' }],
    });

    if (params.id === distributedImage.id) {
      return HttpResponse.json(distributedImage);
    }

    return HttpResponse.json(imageFactory.build());
  }),
  http.get('*/images', async ({ request }) => {
    const filter = request.headers.get('x-filter');

    if (filter?.includes('manual')) {
      const images = [
        imageFactory.build({
          capabilities: ['distributed-sites'],
          regions: [{ region: 'us-east', status: 'available' }],
          type: 'manual',
        }),
        imageFactory.build({ capabilities: [], regions: [], type: 'manual' }),
        imageFactory.build({
          capabilities: ['distributed-sites', 'cloud-init'],
          regions: [{ region: 'us-east', status: 'available' }],
          type: 'manual',
        }),
        imageFactory.build({
          capabilities: ['cloud-init'],
          regions: [],
          type: 'manual',
        }),
      ];
      return HttpResponse.json(makeResourcePage(images));
    }

    if (filter?.includes('automatic')) {
      const images = imageFactory.buildList(5, {
        capabilities: [],
        regions: [],
        type: 'automatic',
      });
      return HttpResponse.json(makeResourcePage(images));
    }

    return HttpResponse.json(makeResourcePage([]));
  }),
  http.post<any, UpdateImageRegionsPayload>(
    '*/v4/images/:id/regions',
    async ({ request }) => {
      const data = await request.json();

      const image = imageFactory.build();

      image.regions = data.regions.map((regionId) => ({
        region: regionId,
        status: 'pending replication',
      }));

      return HttpResponse.json(image);
    }
  ),

  http.get('*/linode/types', () => {
    return HttpResponse.json(
      makeResourcePage([
        nanodeType,
        ...standardTypes,
        ...dedicatedTypes,
        ...gpuTypesAda,
        ...gpuTypesRX,
        ...premiumTypes,
        ...acceleratedType,
        proDedicatedType,
      ])
    );
  }),
  http.get('*/linode/types-legacy', () => {
    return HttpResponse.json(makeResourcePage(linodeTypeFactory.buildList(0)));
  }),
  ...[
    nanodeType,
    ...standardTypes,
    ...dedicatedTypes,
    ...premiumTypes,
    proDedicatedType,
  ].map((type) =>
    http.get(`*/linode/types/${type.id}`, () => {
      return HttpResponse.json(type);
    })
  ),
  http.get(`*/linode/types/*`, () => {
    return HttpResponse.json(linodeTypeFactory.build());
  }),
  http.get('*/linode/instances', async ({ request }) => {
    linodeFactory.resetSequenceNumber();
    const linodesWithFirewall = linodeFactory.buildList(10, {
      region: 'ap-west',
    });
    const metadataLinodeWithCompatibleImage = linodeFactory.build({
      image: 'metadata-test-image',
      label: 'metadata-test-image',
    });
    const metadataLinodeWithCompatibleImageAndRegion = linodeFactory.build({
      image: 'metadata-test-image',
      label: 'metadata-test-region',
      region: 'eu-west',
    });
    const linodeInDistributedRegion = linodeFactory.build({
      image: 'distributed-region-test-image',
      label: 'Gecko Distributed Region Test',
      region: 'us-den-10',
      site_type: 'distributed',
      id: 1000,
    });
    const onlineLinodes = linodeFactory.buildList(40, {
      backups: { enabled: false },
      ipv4: ['000.000.000.000'],
      region: 'us-ord',
    });
    const linodeWithEligibleVolumes = linodeFactory.build({
      id: 20,
      label: 'debianDistro',
    });
    const offlineLinodes = linodeFactory.buildList(1, { status: 'offline' });
    const busyLinodes = linodeFactory.buildList(1, { status: 'migrating' });
    const eventLinode = linodeFactory.build({
      id: 999,
      label: 'eventful',
      status: 'rebooting',
    });
    const multipleIPLinode = linodeFactory.build({
      ipv4: [
        '192.168.0.0',
        '192.168.0.1',
        '192.168.0.2',
        '192.168.0.3',
        '192.168.0.4',
        '192.168.0.5',
      ],
      label: 'multiple-ips',
      tags: ['test1', 'test2', 'test3'],
    });
    const nonMTCPlanInMTCSupportedRegionsLinode = linodeFactory.build({
      label: 'non-mtc-plan-in-mtc-supported-regions-linode',
      region: 'us-iad',
      id: 1003,
    });
    const mtcLinodes = [
      linodeFactory.build({
        label: 'mtc-custom-plan-linode-1',
        region: 'us-iad',
        type: 'g8-premium-128-ht',
        id: 1001,
      }),
      linodeFactory.build({
        label: 'mtc-custom-plan-linode-2',
        region: 'no-osl-1',
        type: 'g8-premium-128-ht',
        id: 1002,
      }),
    ];
    const aclpSupportedRegionLinodes = [
      linodeFactory.build({
        label: 'aclp-supported-region-linode-1',
        region: 'us-iad',
        id: 1004,
      }),
      linodeFactory.build({
        label: 'aclp-supported-region-linode-2',
        region: 'us-east',
        id: 1005,
      }),
      linodeFactory.build({
        label: 'aclp-supported-region-linode-3',
        region: 'us-iad',
        id: 1006,
      }),
    ];
    const linodeFirewall = linodeFactory.build({
      region: 'ap-west',
      label: 'Linode-firewall-test',
      id: 90909,
    });
    const linodes = [
      ...linodesWithFirewall,
      ...mtcLinodes,
      ...aclpSupportedRegionLinodes,
      nonMTCPlanInMTCSupportedRegionsLinode,
      metadataLinodeWithCompatibleImage,
      metadataLinodeWithCompatibleImageAndRegion,
      linodeInDistributedRegion,
      ...onlineLinodes,
      linodeWithEligibleVolumes,
      ...offlineLinodes,
      ...busyLinodes,
      linodeFactory.build({
        backups: { enabled: false },
        label: 'shadow-plan',
        type: 'g5-standard-20-s1',
      }),
      linodeFactory.build({
        backups: { enabled: false },
        label: 'shadow-plan-with-tags',
        tags: ['test1', 'test2', 'test3'],
        type: 'g5-standard-20-s1',
      }),
      linodeFactory.build({
        label: 'linode_with_tags_test1_test2',
        // eslint-disable-next-line sonarjs/no-duplicate-string
        region: 'us-central',
        tags: ['test1', 'test2'],
      }),
      linodeFactory.build({
        label: 'linode_with_tags_test2_test3',
        region: 'us-central',
        tags: ['test2', 'test3'],
      }),
      linodeFactory.build({
        label: 'linode_with_no_tags',
        region: 'us-central',
      }),
      linodeFactory.build({
        label: 'linode_with_tag_test4',
        region: 'us-east',
        tags: ['test4'],
      }),
      linodeFactory.build({
        label: 'eu-linode',
        region: 'eu-west',
      }),
      linodeFactory.build({
        backups: { enabled: false },
        label: 'DC-Specific Pricing Linode',
        region: 'id-cgk',
      }),
      eventLinode,
      multipleIPLinode,
      linodeFirewall,
    ];

    if (request.headers.get('x-filter')) {
      const headers = JSON.parse(request.headers.get('x-filter') || '{}');
      const orFilters = headers['+or'];
      const andFilters = headers['+and'];
      const regionFilter = headers.region;

      let filteredLinodes = linodes; // Default to the original linodes in case no filters are applied

      if (andFilters?.length) {
        // Check if this is a combined filter structure (multiple filter groups with +or arrays)
        const hasCombinedFilter = andFilters.some(
          (filterGroup: any) =>
            filterGroup['+or'] && Array.isArray(filterGroup['+or'])
        );

        if (hasCombinedFilter) {
          // Handle combined filter structure for CloudPulse alerts
          filteredLinodes = filteredLinodes.filter((linode) => {
            return andFilters.every((filterGroup: any) => {
              // Handle id filter group
              if (filterGroup['+or'] && Array.isArray(filterGroup['+or'])) {
                const idFilters = filterGroup['+or'].filter(
                  (f) => f.id !== undefined
                );
                const regionFilters = filterGroup['+or'].filter(
                  (f) => f.region !== undefined
                );

                // Check if linode matches any id in the id filter group
                const matchesId =
                  idFilters.length === 0 ||
                  idFilters.some((f) => Number(f.id) === linode.id);

                // Check if linode matches any region in the region filter group
                const matchesRegion =
                  regionFilters.length === 0 ||
                  regionFilters.some((f) => f.region === linode.region);

                return matchesId && matchesRegion;
              }

              return false;
            });
          });
        } else {
          // Handle legacy andFilters for other use cases
          filteredLinodes = filteredLinodes.filter((linode) => {
            const filteredById = andFilters.every(
              (filter: { id: number }) => filter.id === linode.id
            );
            const filteredByRegion = andFilters.every(
              (filter: { region: string }) => filter.region === linode.region
            );

            return filteredById || filteredByRegion;
          });
        }
      }

      // The legacy id/region filtering logic has been removed here because it
      // duplicated the work done above and incorrectly trimmed results when a
      // newer "combined" filter structure (an array of "+or" groups inside
      // "+and") was supplied. For legacy consumers the filtering is handled
      // in the `else` branch above (lines ~922–934).

      // after the linodes are filtered based on region, filter the region-filtered linodes based on selected tags if any
      if (orFilters?.length) {
        filteredLinodes = filteredLinodes.filter((linode) => {
          return orFilters.some((filter: { tags: string }) =>
            linode.tags.includes(filter.tags)
          );
        });
      }

      // filter the linodes based on supported regions
      if (orFilters?.length) {
        filteredLinodes = linodes.filter((linode) => {
          return orFilters.some(
            (filter: { region: string }) => linode.region === filter.region
          );
        });
      }

      if (regionFilter) {
        filteredLinodes = filteredLinodes.filter((linode) => {
          return linode.region === regionFilter;
        });
      }

      return HttpResponse.json(makeResourcePage(filteredLinodes));
    }
    return HttpResponse.json(makeResourcePage(linodes));
  }),

  http.get('*/linode/instances/:id', async ({ params }) => {
    const mockLinodeDetailById = (id: number) => {
      const linodeMTCPlanDetails = [
        linodeFactory.build({
          id,
          backups: { enabled: false },
          label: 'mtc-custom-plan-linode-1',
          region: 'us-iad',
          type: 'g8-premium-128-ht',
        }),
        linodeFactory.build({
          id,
          backups: { enabled: false },
          label: 'mtc-custom-plan-linode-2',
          region: 'no-osl-1',
          type: 'g8-premium-128-ht',
        }),
      ];
      const linodeAclpSupportedRegionDetails = [
        /** Whether a Linode is ACLP-subscribed can be determined using the useIsLinodeAclpSubscribed hook. */

        // 1. Example: ACLP-subscribed Linode in an ACLP-supported region (mock Linode ID: 1004)
        linodeFactory.build({
          id,
          backups: { enabled: false },
          label: 'aclp-supported-region-linode-1',
          region: 'us-iad',
          alerts: {
            user_alerts: [21, 22, 23, 24, 25],
            system_alerts: [19, 20],
            cpu: 0,
            io: 0,
            network_in: 0,
            network_out: 0,
            transfer_quota: 0,
          },
        }),
        // 2. Example: Linode not subscribed to ACLP in an ACLP-supported region (mock Linode ID: 1005)
        linodeFactory.build({
          id,
          backups: { enabled: false },
          label: 'aclp-supported-region-linode-2',
          region: 'us-east',
          alerts: {
            user_alerts: [],
            system_alerts: [],
            cpu: 10,
            io: 10000,
            network_in: 0,
            network_out: 0,
            transfer_quota: 80,
          },
        }),
        // 3. Example: Linode in an ACLP-supported region with NO enabled alerts (mock Linode ID: 1006)
        // - Whether this Linode is ACLP-subscribed depends on the ACLP release stage:
        //   a. Beta stage: NOT subscribed to ACLP
        //   b. GA stage: Subscribed to ACLP
        linodeFactory.build({
          id,
          backups: { enabled: false },
          label: 'aclp-supported-region-linode-3',
          region: 'us-iad',
          alerts: {
            user_alerts: [],
            system_alerts: [],
            cpu: 0,
            io: 0,
            network_in: 0,
            network_out: 0,
            transfer_quota: 0,
          },
        }),
      ];
      const linodeNonMTCPlanInMTCSupportedRegionsDetail = linodeFactory.build({
        id,
        backups: { enabled: false },
        label: 'non-mtc-plan-in-mtc-supported-regions-linode',
        region: 'us-iad',
      });
      const linodeInDistributedRegionDetail = linodeFactory.build({
        id,
        backups: { enabled: false },
        label: 'Gecko Distributed Region Test',
        region: 'us-den-10',
      });
      const linodeDetail = linodeFactory.build({
        id,
        backups: { enabled: false },
        label: 'linode-detail',
        region: 'us-ord',
      });

      switch (id) {
        case 1000:
          return linodeInDistributedRegionDetail;
        case 1001:
          return linodeMTCPlanDetails[0];
        case 1002:
          return linodeMTCPlanDetails[1];
        case 1003:
          return linodeNonMTCPlanInMTCSupportedRegionsDetail;
        case 1004:
          return linodeAclpSupportedRegionDetails[0];
        case 1005:
          return linodeAclpSupportedRegionDetails[1];
        case 1006:
          return linodeAclpSupportedRegionDetails[2];
        default:
          return linodeDetail;
      }
    };
    const id = Number(params.id);
    const response = mockLinodeDetailById(id);
    return HttpResponse.json(response);
  }),
  http.get('*/linode/instances/:id/firewalls', async () => {
    const firewalls = firewallFactory.buildList(1);
    firewallFactory.resetSequenceNumber();
    return HttpResponse.json(makeResourcePage(firewalls));
  }),
  http.get('*/linode/kernels', async () => {
    const kernels = LinodeKernelFactory.buildList(10);
    return HttpResponse.json(makeResourcePage(kernels));
  }),
  http.delete('*/instances/*', async () => {
    return HttpResponse.json({});
  }),
  http.get('*/instances/*/configs', async () => {
    const configs = linodeConfigFactory.buildList(3);
    return HttpResponse.json(makeResourcePage(configs));
  }),
  http.get('*/instances/*/disks', async () => {
    const disks = linodeDiskFactory.buildList(3);
    return HttpResponse.json(makeResourcePage(disks));
  }),
  http.put('*/instances/*/disks/:id', async ({ params }) => {
    const id = Number(params.id);
    const disk = linodeDiskFactory.build({ id });
    // If you want to mock an error
    // return HttpResponse.json({ errors: [{ field: 'label', reason: 'OMG!' }] }));
    return HttpResponse.json(disk);
  }),
  http.get('*/instances/*/transfer', async () => {
    const transfer = linodeTransferFactory.build();
    return HttpResponse.json(transfer);
  }),
  http.get('*/instances/*/stats*', async () => {
    const stats = linodeStatsFactory.build();
    return HttpResponse.json(stats);
  }),
  http.get('*/instances/*/stats', async () => {
    const stats = linodeStatsFactory.build();
    return HttpResponse.json(stats);
  }),
  http.get('*/instances/*/ips', async () => {
    const ips = linodeIPFactory.build();
    return HttpResponse.json(ips);
  }),
  http.post('*/linode/instances', async ({ request }) => {
    const body = await request.json();
    const payload = body as any;
    const linode = linodeFactory.build({
      image: payload?.image ?? 'linode/debian-10',
      label: payload?.label ?? 'new-linode',
      region: payload?.region ?? 'us-east',
      type: payload?.type ?? 'g6-standard-1',
    });
    return HttpResponse.json(linode);
    // return HttpResponse.json({ errors: [{ reason: 'Invalid label', field: 'data.label' }] }));
  }),

  http.get('*/lke/clusters', async () => {
    const clusters = kubernetesAPIResponse.buildList(10);
    const enterpriseClusters = kubernetesAPIResponse.buildList(11, {
      tier: 'enterprise',
      region: 'ap-west',
    });
    return HttpResponse.json(
      makeResourcePage([...clusters, ...enterpriseClusters])
    );
  }),
  http.get('*/lke/types', async () => {
    const lkeTypes = [
      lkeStandardAvailabilityTypeFactory.build(),
      lkeHighAvailabilityTypeFactory.build(),
      lkeEnterpriseTypeFactory.build(),
    ];
    return HttpResponse.json(makeResourcePage(lkeTypes));
  }),
  http.get('*/lke/versions', async () => {
    const versions = kubernetesVersionFactory.buildList(1);
    return HttpResponse.json(makeResourcePage(versions));
  }),
  http.get('*/lke/clusters/:clusterId', async ({ params }) => {
    const id = Number(params.clusterId);
    const cluster = kubernetesAPIResponse.build({ id, k8s_version: '1.16' });
    return HttpResponse.json(cluster);
    // return HttpResponse.json({}, { status: 404 });
  }),
  http.put('*/lke/clusters/:clusterId', async ({ params }) => {
    const id = Number(params.clusterId);
    const k8s_version = params.k8s_version as string;
    const cluster = kubernetesAPIResponse.build({
      id,
      k8s_version,
    });
    return HttpResponse.json(cluster);
  }),
  http.get('*/lke/clusters/:clusterId/pools', async () => {
    const encryptedPools = nodePoolFactory.buildList(5);
    const unencryptedPools = nodePoolFactory.buildList(5, {
      disk_encryption: 'disabled',
    });
    const paginatedPool = nodePoolFactory.build({
      nodes: kubeLinodeFactory.buildList(26),
    });
    return HttpResponse.json(
      makeResourcePage([...encryptedPools, ...unencryptedPools, paginatedPool])
    );
  }),
  http.get('*/lke/clusters/*/api-endpoints', async () => {
    const endpoints = kubeEndpointFactory.buildList(2);
    return HttpResponse.json(makeResourcePage(endpoints));
  }),
  http.get('*/lke/clusters/*/recycle', async () => {
    return HttpResponse.json({});
  }),
  http.get('*/v4beta/networking/firewalls', () => {
    const firewalls = [
      ...firewallFactory.buildList(9),
      firewallFactory.build({
        entities: [
          firewallEntityfactory.build({
            type: 'nodebalancer',
            parent_entity: null,
            id: 333,
            label: 'NodeBalancer-33',
          }),
        ],
      }),
      firewallFactory.build({
        entities: [
          firewallEntityfactory.build({
            type: 'linode_interface',
            parent_entity: firewallEntityfactory.build({
              type: 'linode',
              id: 123,
              label: 'Linode-123',
            }),
          }),
          firewallEntityfactory.build({
            type: 'linode',
            label: 'Linode-fireall-test',
            parent_entity: null,
            id: 90909,
          }),
        ],
      }),
      firewallFactory.build({
        label: 'Firewall - Nodebalancer',
        id: 25,
        entities: [
          firewallEntityfactory.build({
            type: 'nodebalancer',
            label: 'Nodebalancer-test',
            parent_entity: null,
            id: 333,
          }),
        ],
      }),
    ];
    firewallFactory.resetSequenceNumber();
    return HttpResponse.json(makeResourcePage(firewalls));
  }),
  http.get('*/v4beta/networking/firewalls/*/devices', () => {
    const devices = firewallDeviceFactory.buildList(10);
    return HttpResponse.json(makeResourcePage(devices));
  }),
  http.get('*/v4beta/networking/firewalls/:firewallId', () => {
    const firewall = firewallFactory.build();
    return HttpResponse.json(firewall);
  }),
  http.put<{}, { status: FirewallStatus }>(
    '*/v4beta/networking/firewalls/:firewallId',
    async ({ request }) => {
      const body = await request.json();
      const firewall = firewallFactory.build({
        status: body?.['status'] ?? 'disabled',
      });
      return HttpResponse.json(firewall);
    }
  ),
  // http.post('*/account/agreements', () => {
  //   return res(ctx.status(500), ctx.json({ reason: 'Unknown error' }));
  // }),
  http.post('*/v4beta/networking/firewalls', async ({ request }) => {
    const body = await request.json();
    const payload = body as any;
    const newFirewall = firewallFactory.build({
      label: payload.label ?? 'mock-firewall',
    });
    return HttpResponse.json(newFirewall);
  }),
  http.get('*/v4/nodebalancers', () => {
    const nodeBalancers = nodeBalancerFactory.buildList(3);
    nodeBalancers.push(
      nodeBalancerFactory.build({
        id: 333,
        label: 'NodeBalancer-33',
        region: 'ap-west',
      })
    );
    return HttpResponse.json(makeResourcePage(nodeBalancers));
  }),
  http.get('*/v4/nodebalancers/types', () => {
    const nodeBalancerTypes = nodeBalancerTypeFactory.buildList(1);
    return HttpResponse.json(makeResourcePage(nodeBalancerTypes));
  }),
  http.get('*/v4/nodebalancers/:nodeBalancerID', ({ params }) => {
    const nodeBalancer = nodeBalancerFactory.build({
      id: Number(params.nodeBalancerID),
    });
    return HttpResponse.json(nodeBalancer);
  }),
  http.get('*/v4beta/nodebalancers/:nodeBalancerID', ({ params }) => {
    const nodeBalancer = nodeBalancerFactory.build({
      id: Number(params.nodeBalancerID),
      lke_cluster: {
        id: 1,
        label: 'lke-e-123',
        type: 'lkecluster',
        url: 'v4/lke/clusters/1',
      },
      type: 'premium',
    });
    return HttpResponse.json(nodeBalancer);
  }),
  http.get('*/nodebalancers/:nodeBalancerID/configs', ({ params }) => {
    const configs = nodeBalancerConfigFactory.buildList(2, {
      nodebalancer_id: Number(params.nodeBalancerID),
    });
    return HttpResponse.json(makeResourcePage(configs));
  }),
  http.get('*/nodebalancers/:nodeBalancerID/configs/:configID/nodes', () => {
    const configs = [
      nodeBalancerConfigNodeFactory.build({ status: 'UP' }),
      nodeBalancerConfigNodeFactory.build({ status: 'DOWN' }),
      nodeBalancerConfigNodeFactory.build({ status: 'unknown' }),
    ];
    return HttpResponse.json(makeResourcePage(configs));
  }),
  http.get('*/v4/object-storage/types', () => {
    const objectStorageTypes = [
      objectStorageTypeFactory.build(),
      objectStorageOverageTypeFactory.build(),
    ];
    return HttpResponse.json(makeResourcePage(objectStorageTypes));
  }),
  http.get('*/v4/object-storage/endpoints', ({}) => {
    const endpoints = [
      objectStorageEndpointsFactory.build({
        endpoint_type: 'E0',
        region: 'us-sea',
        s3_endpoint: null,
      }),
      objectStorageEndpointsFactory.build({
        endpoint_type: 'E1',
        region: 'us-sea',
        s3_endpoint: 'us-sea-1.linodeobjects.com',
      }),
      objectStorageEndpointsFactory.build({
        endpoint_type: 'E1',
        region: 'us-sea',
        s3_endpoint: null,
      }),
      objectStorageEndpointsFactory.build({
        endpoint_type: 'E2',
        region: 'us-sea',
        s3_endpoint: null,
      }),
      objectStorageEndpointsFactory.build({
        endpoint_type: 'E3',
        region: 'us-sea',
        s3_endpoint: null,
      }),
      objectStorageEndpointsFactory.build({
        endpoint_type: 'E3',
        region: 'us-east',
        s3_endpoint: null,
      }),
      objectStorageEndpointsFactory.build({
        endpoint_type: 'E3',
        region: 'us-mia',
        s3_endpoint: 'us-mia-1.linodeobjects.com',
      }),
      objectStorageEndpointsFactory.build({
        endpoint_type: 'E3',
        region: 'ap-west',
        s3_endpoint: 'ap-west-1.linodeobjects.com',
      }),
      objectStorageEndpointsFactory.build({
        endpoint_type: 'E3',
        region: 'us-iad',
        s3_endpoint: 'us-iad-1.linodeobjects.com',
      }),
    ];
    return HttpResponse.json(makeResourcePage(endpoints));
  }),
  http.get('*/v4*/object-storage/quotas*', () => {
    const quotas = [
      quotaFactory.build({
        description: 'The total capacity of your Object Storage account',
        endpoint_type: 'E0',
        quota_limit: 1_000_000_000_000_000,
        quota_name: 'Total Capacity',
        resource_metric: 'byte',
        s3_endpoint: 'endpoint1',
      }),
    ];

    return HttpResponse.json(makeResourcePage(quotas));
  }),
  http.get('*object-storage/buckets/*/*/access', async () => {
    await sleep(2000);
    return HttpResponse.json({
      acl: 'private',
      acl_xml:
        '<AccessControlPolicy xmlns="http://s3.amazonaws.com/doc/2006-03-01/"><Owner><ID>2a2ce653-20dd-43f1-b803-e8a924ee6374</ID><DisplayName>2a2ce653-20dd-43f1-b803-e8a924ee6374</DisplayName></Owner><AccessControlList><Grant><Grantee xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="CanonicalUser"><ID>2a2ce653-20dd-43f1-b803-e8a924ee6374</ID><DisplayName>2a2ce653-20dd-43f1-b803-e8a924ee6374</DisplayName></Grantee><Permission>FULL_CONTROL</Permission></Grant></AccessControlList></AccessControlPolicy>',
      cors_enabled: true,
      cors_xml:
        '<CORSConfiguration><CORSRule><AllowedMethod>GET</AllowedMethod><AllowedMethod>PUT</AllowedMethod><AllowedMethod>DELETE</AllowedMethod><AllowedMethod>HEAD</AllowedMethod><AllowedMethod>POST</AllowedMethod><AllowedOrigin>*</AllowedOrigin><AllowedHeader>*</AllowedHeader></CORSRule></CORSConfiguration>',
    });
  }),

  http.put('*object-storage/buckets/*/*/access', async () => {
    await sleep(2000);
    return HttpResponse.json({});
  }),
  http.get('*object-storage/buckets/*/*/ssl', async () => {
    await sleep(2000);
    return HttpResponse.json({ ssl: false });
  }),
  http.post('*object-storage/buckets/*/*/ssl', async () => {
    await sleep(2000);
    return HttpResponse.json({ ssl: true });
  }),
  http.delete('*object-storage/buckets/*/*/ssl', async () => {
    await sleep(2000);
    return HttpResponse.json({});
  }),
  http.delete('*object-storage/buckets/*/*', async () => {
    await sleep(2000);
    return HttpResponse.json({});
  }),
  http.get('*/object-storage/buckets/*/*/object-list', ({ request }) => {
    const url = new URL(request.url);
    const pageSize = Number(url.searchParams.get('page_size') || 100);
    const marker = url.searchParams.get('marker');

    if (!marker) {
      const end =
        pageSize > staticObjects.length ? staticObjects.length : pageSize;
      const is_truncated = staticObjects.length > pageSize;

      const page = staticObjects.slice(0, end);
      return HttpResponse.json(
        makeObjectsPage(page, {
          is_truncated,
          next_marker: is_truncated ? staticObjects[pageSize].name : null,
        })
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

    return HttpResponse.json(
      makeObjectsPage(page, {
        is_truncated,
        next_marker: is_truncated ? staticObjects[end].name : null,
      })
    );
  }),
  http.get('*/object-storage/buckets/:region', ({ params, request }) => {
    const url = new URL(request.url);

    const region = params.region as string;

    objectStorageBucketFactoryGen2.resetSequenceNumber();
    const page = Number(url.searchParams.get('page') || 1);
    const pageSize = Number(url.searchParams.get('page_size') || 25);

    const randomBucketNumber = getRandomWholeNumber(1, 500);
    const randomEndpointType = `E${Math.floor(
      Math.random() * 4
    )}` as ObjectStorageEndpointTypes;

    const buckets =
      region !== 'ap-west' && region !== 'us-iad'
        ? objectStorageBucketFactoryGen2.buildList(1, {
            cluster: `${region}-1`,
            endpoint_type: randomEndpointType,
            hostname: `obj-bucket-${randomBucketNumber}.${region}.linodeobjects.com`,
            label: `obj-bucket-${randomBucketNumber}`,
            region,
          })
        : [];
    if (region === 'ap-west') {
      buckets.push(
        objectStorageBucketFactoryGen2.build({
          cluster: `ap-west-1`,
          endpoint_type: 'E3',
          s3_endpoint: 'ap-west-1.linodeobjects.com',
          hostname: `obj-bucket-804.ap-west.linodeobjects.com`,
          label: `obj-bucket-804`,
          region,
        })
      );
      buckets.push(
        objectStorageBucketFactoryGen2.build({
          cluster: `ap-west-1`,
          endpoint_type: 'E3',
          s3_endpoint: 'ap-west-1.linodeobjects.com',
          hostname: `obj-bucket-902.ap-west.linodeobjects.com`,
          label: `obj-bucket-902`,
          region,
        })
      );
    }
    if (region === 'us-iad')
      buckets.push(
        objectStorageBucketFactoryGen2.build({
          cluster: `us-iad-1`,
          endpoint_type: 'E3',
          s3_endpoint: 'us-iad-1.linodeobjects.com',
          hostname: `obj-bucket-230.us-iad.linodeobjects.com`,
          label: `obj-bucket-230`,
          region,
        })
      );
    return HttpResponse.json({
      data: buckets.slice(
        (page - 1) * pageSize,
        (page - 1) * pageSize + pageSize
      ),
      page,
      pages: Math.ceil(buckets.length / pageSize),
      results: buckets.length,
    });
  }),
  http.get('*/object-storage/buckets', () => {
    const buckets = objectStorageBucketFactoryGen2.buildList(10);
    return HttpResponse.json(makeResourcePage(buckets));
  }),
  http.post('*/object-storage/buckets', () => {
    return HttpResponse.json(objectStorageBucketFactoryGen2.build());
  }),
  http.get('*object-storage/clusters', () => {
    const jakartaCluster = objectStorageClusterFactory.build({
      id: `id-cgk-0` as any,
      region: 'id-cgk',
    });
    const saoPauloCluster = objectStorageClusterFactory.build({
      id: `br-gru-0` as any,
      region: 'br-gru',
    });
    const basePricingCluster = objectStorageClusterFactory.build({
      id: `us-east-0` as any,
      region: 'us-east',
    });
    const clusters = objectStorageClusterFactory.buildList(3);
    return HttpResponse.json(
      makeResourcePage([
        jakartaCluster,
        saoPauloCluster,
        basePricingCluster,
        ...clusters,
      ])
    );
  }),

  http.get('*object-storage/keys', () => {
    return HttpResponse.json(
      makeResourcePage([
        ...objectStorageKeyFactory.buildList(1),
        ...objectStorageKeyFactory.buildList(1, {
          regions: [
            { id: 'us-east', s3_endpoint: 'us-east.com' },
            { id: 'nl-ams', s3_endpoint: 'nl-ams.com' },
            { id: 'us-southeast', s3_endpoint: 'us-southeast.com' },
            { id: 'in-maa', s3_endpoint: 'in-maa.com' },
            { id: 'us-lax', s3_endpoint: 'us-lax.com' },
            { id: 'us-mia', s3_endpoint: 'us-mia.com' },
            { id: 'it-mil', s3_endpoint: 'it-mil.com' },
          ],
        }),
        ...objectStorageKeyFactory.buildList(1, {
          regions: [
            { id: 'us-east', s3_endpoint: 'us-east.com' },
            { id: 'nl-ams', s3_endpoint: 'nl-ams.com' },
            { id: 'us-southeast', s3_endpoint: 'us-southeast.com' },
            { id: 'in-maa', s3_endpoint: 'in-maa.com' },
            { id: 'us-lax', s3_endpoint: 'us-lax.com' },
          ],
        }),
        ...objectStorageKeyFactory.buildList(1, {
          bucket_access: [
            {
              bucket_name: 'test007',
              cluster: 'us-east-1',
              permissions: 'read_only',
              region: 'us-east',
            },
            {
              bucket_name: 'test001',
              cluster: 'nl-ams-1',
              permissions: 'read_write',
              region: 'nl-ams',
            },
          ],
          limited: true,
          regions: [
            { id: 'us-east', s3_endpoint: 'us-east.com' },
            { id: 'nl-ams', s3_endpoint: 'nl-ams.com' },
          ],
        }),
      ])
    );
  }),
  http.post<any, CreateObjectStorageKeyPayload>(
    '*object-storage/keys',
    async ({ request }) => {
      const body = await request.json();
      const { label, regions } = body;

      const regionsData = regions?.map((region: string) => ({
        id: region,
        s3_endpoint: `${region}.com`,
      }));

      return HttpResponse.json(
        objectStorageKeyFactory.build({
          label,
          regions: regionsData,
        })
      );
    }
  ),
  http.put<any, CreateObjectStorageKeyPayload>(
    '*object-storage/keys/:id',
    async ({ request }) => {
      const body = await request.json();
      const { label, regions } = body;

      const regionsData = regions?.map((region: string) => ({
        id: region,
        s3_endpoint: `${region}.com`,
      }));

      return HttpResponse.json(
        objectStorageKeyFactory.build({
          label,
          regions: regionsData,
        })
      );
    }
  ),
  http.delete('*object-storage/keys/:id', () => {
    return HttpResponse.json({});
  }),
  http.get('*/v4/domains', () => {
    const domains = domainFactory.buildList(10);
    return HttpResponse.json(makeResourcePage(domains));
  }),
  http.get('*/v4/domains/:id', () => {
    const domain = domainFactory.build();
    return HttpResponse.json(domain);
  }),
  http.get('*/v4/domains/*/records', () => {
    const records = domainRecordFactory.buildList(1);
    return HttpResponse.json(makeResourcePage(records));
  }),
  http.post('*/domains/*/records', () => {
    const record = domainRecordFactory.build();
    return HttpResponse.json(record);
  }),
  http.post('*/volumes/migrate', () => {
    return HttpResponse.json({});
  }),
  http.get('*/regions/*/migration-queue', () => {
    return HttpResponse.json({
      linodes: 8,
      volumes: 953,
    });
  }),
  http.get('*/volumes', () => {
    const statuses: VolumeStatus[] = [
      'active',
      'creating',
      'migrating',
      'key_rotating',
      'offline',
      'resizing',
    ];
    const volumes = statuses.map((status) =>
      volumeFactory.build({ status, region: 'ap-west', linode_id: 1 })
    );
    volumes.push(
      ...volumeFactory.buildList(2, { region: 'us-east', linode_id: 2 })
    );
    volumes.push(
      ...volumeFactory.buildList(2, { region: 'us-east', linode_id: 3 })
    );
    volumes.push(
      ...volumeFactory.buildList(2, { region: 'us-east', linode_id: 4 })
    );
    volumes.push(
      ...volumeFactory.buildList(2, { region: 'us-east', linode_id: 5 })
    );
    volumes.push(
      ...volumeFactory.buildList(5, { region: 'eu-central', linode_id: 1 })
    );
    return HttpResponse.json(makeResourcePage(volumes));
  }),
  http.get('*/v4/volumes/:id', () => {
    const volume = volumeFactory.build();
    return HttpResponse.json(volume);
  }),
  http.get('*/volumes/types', () => {
    const volumeTypes = volumeTypeFactory.buildList(1);
    return HttpResponse.json(makeResourcePage(volumeTypes));
  }),
  http.post('*/volumes', () => {
    const volume = volumeFactory.build();
    return HttpResponse.json(volume);
  }),
  http.get('*/vlans', () => {
    const vlans = VLANFactory.buildList(30);
    return HttpResponse.json(makeResourcePage(vlans));
  }),
  http.get('*/profile/preferences', () => {
    return HttpResponse.json({
      theme: getStorage(MOCK_THEME_STORAGE_KEY) ?? 'system',
    });
  }),
  http.get('*/profile/devices', () => {
    return HttpResponse.json(
      makeResourcePage(trustedDeviceFactory.buildList(30))
    );
  }),
  http.put('*/profile/preferences', async ({ request }) => {
    const reqBody = await request.json();
    const body = reqBody as any;
    return HttpResponse.json({ ...body });
  }),
  http.get('*/kubeconfig', () => {
    return HttpResponse.json({ kubeconfig: 'SSBhbSBhIHRlYXBvdA==' });
  }),
  http.get('*invoices/555/items', () => {
    return HttpResponse.json(
      makeResourcePage([
        invoiceItemFactory.build({
          label: 'Linode',
          region: 'br-gru',
        }),
        invoiceItemFactory.build({
          label: 'Outbound Transfer Overage',
          region: null,
        }),
        invoiceItemFactory.build({
          label: 'Outbound Transfer Overage',
          region: 'id-cgk',
        }),
      ])
    );
  }),

  http.get('*invoices/:invoiceId/items', () => {
    const items = invoiceItemFactory.buildList(10);
    return HttpResponse.json(makeResourcePage(items, { page: 1, pages: 4 }));
  }),
  http.get('*/account', () => {
    const account = accountFactory.build({
      active_promotions: promoFactory.buildList(1),
      active_since: '2022-11-30',
      balance: 50,
      company: 'Mock Company',
    });
    return HttpResponse.json(account);
  }),
  http.get('*/account/availability', () => {
    const newarkStorage = accountAvailabilityFactory.build({
      region: 'us-east-0',
      unavailable: ['Object Storage'],
    });
    const atlanta = accountAvailabilityFactory.build({
      region: 'us-southeast',
      unavailable: ['Block Storage', 'Managed Databases'],
    });
    const singapore = accountAvailabilityFactory.build({
      region: 'ap-south',
      unavailable: ['Linodes', 'Kubernetes', 'NodeBalancers'],
    });
    const tokyo = accountAvailabilityFactory.build({
      region: 'ap-northeast',
      unavailable: ['Linodes', 'Block Storage', 'Kubernetes', 'NodeBalancers'],
    });
    return HttpResponse.json(
      makeResourcePage([atlanta, newarkStorage, singapore, tokyo])
    );
  }),
  http.get('*/account/availability/:regionId', () => {
    return HttpResponse.json(accountAvailabilityFactory.build());
  }),
  http.put('*/account', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ ...accountFactory.build(), ...(body as any) });
  }),
  http.get('*/account/transfer', () => {
    const transfer = accountTransferFactory.build();
    return HttpResponse.json(transfer);
  }),
  http.get('*/account/payments', () => {
    const paymentWithLargeId = paymentFactory.build({
      id: 123_456_789_123_456,
    });
    const payments = paymentFactory.buildList(5);
    return HttpResponse.json(
      makeResourcePage([paymentWithLargeId, ...payments])
    );
  }),
  http.get('*/account/invoices', () => {
    const linodeInvoice = invoiceFactory.build({
      date: '2022-12-01T18:04:01',
      label: 'LinodeInvoice',
    });
    const akamaiInvoice = invoiceFactory.build({
      date: '2022-12-16T18:04:01',
      label: 'AkamaiInvoice',
    });
    const invoiceWithLargerId = invoiceFactory.build({
      id: 123_456_789_123_456,
      label: 'Invoice with Large ID',
    });
    return HttpResponse.json(
      makeResourcePage([linodeInvoice, akamaiInvoice, invoiceWithLargerId])
    );
  }),
  http.get('*/account/invoices/:invoiceId', () => {
    const linodeInvoice = invoiceFactory.build({
      date: '2022-12-01T18:04:01',
      id: 1234,
      label: 'LinodeInvoice',
    });
    return HttpResponse.json(linodeInvoice);
  }),
  http.get('*/account/maintenance', ({ request }) => {
    const url = new URL(request.url);

    accountMaintenanceFactory.resetSequenceNumber();
    const page = Number(url.searchParams.get('page') || 1);
    const pageSize = Number(url.searchParams.get('page_size') || 25);
    const headers = JSON.parse(request.headers.get('x-filter') || '{}');

    const accountMaintenance =
      headers.status === 'completed'
        ? accountMaintenanceFactory.buildList(30, { status: 'completed' })
        : [
            ...accountMaintenanceFactory.buildList(90, { status: 'pending' }),
            ...accountMaintenanceFactory.buildList(3, { status: 'started' }),
          ];

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

      if (headers['+order'] == 'desc') {
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

  http.get('*/account/child-accounts', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || 1);
    const pageSize = Number(url.searchParams.get('page_size') || 25);
    const childAccounts = accountFactory.buildList(100);
    return HttpResponse.json({
      data: childAccounts.slice(
        (page - 1) * pageSize,
        (page - 1) * pageSize + pageSize
      ),
      page,
      pages: Math.ceil(childAccounts.length / pageSize),
      results: childAccounts.length,
    });
  }),
  http.get('*/account/child-accounts/:euuid', () => {
    const childAccount = accountFactory.buildList(1);
    return HttpResponse.json(childAccount);
  }),
  http.post('*/account/child-accounts/:euuid/token', () => {
    // Proxy tokens expire in 15 minutes.
    const now = new Date();
    const expiry = new Date(now.setMinutes(now.getMinutes() + 15));

    const proxyToken = appTokenFactory.build({
      expiry: expiry.toISOString(),
      token: `Bearer ${import.meta.env.REACT_APP_PROXY_PAT}`,
    });
    return HttpResponse.json(proxyToken);
  }),
  http.get('*/account/users', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || 1);
    const pageSize = Number(url.searchParams.get('page_size') || 25);
    const headers = JSON.parse(request.headers.get('x-filter') || '{}');

    const accountUsers = [
      accountUserFactory.build({
        last_login: { login_datetime: '2023-10-16T17:04', status: 'failed' },
        tfa_enabled: true,
      }),
      accountUserFactory.build({
        last_login: {
          login_datetime: '2023-10-06T12:04',
          status: 'successful',
        },
      }),
      accountUserFactory.build({ last_login: null }),
      childAccountUser,
      parentAccountUser,
      proxyAccountUser,
      parentAccountNonAdminUser,
    ];

    if (request.headers.get('x-filter')) {
      let filteredAccountUsers = accountUsers;

      if (headers['user_type']) {
        if (headers['user_type']['+neq']) {
          filteredAccountUsers = accountUsers.filter(
            (user) => user.user_type !== headers['user_type']['+neq']
          );
        } else {
          filteredAccountUsers = accountUsers.filter(
            (user) => user.user_type === headers['user_type']
          );
        }
      }

      filteredAccountUsers.sort((a, b) => {
        const statusA = a[headers['+order_by'] as keyof User];
        const statusB = b[headers['+order_by'] as keyof User];

        if (!statusA || !statusB) {
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

      if (headers['+order'] == 'desc') {
        filteredAccountUsers.reverse();
      }
      return HttpResponse.json({
        data: filteredAccountUsers.slice(
          (page - 1) * pageSize,
          (page - 1) * pageSize + pageSize
        ),
        page,
        pages: Math.ceil(filteredAccountUsers.length / pageSize),
        results: filteredAccountUsers.length,
      });
    }

    // Return default response if 'x-filter' header is not present
    return HttpResponse.json(makeResourcePage(accountUsers));
  }),

  http.get(`*/account/users/${childAccountUser.username}`, () => {
    return HttpResponse.json(childAccountUser);
  }),
  http.get(`*/account/users/${proxyAccountUser.username}`, () => {
    return HttpResponse.json(proxyAccountUser);
  }),
  http.get(`*/account/users/${parentAccountUser.username}`, () => {
    return HttpResponse.json(parentAccountUser);
  }),
  http.get(`*/account/users/${parentAccountNonAdminUser.username}`, () => {
    return HttpResponse.json(parentAccountNonAdminUser);
  }),
  http.get('*/account/users/:user', () => {
    return HttpResponse.json(accountUserFactory.build({ user_type: 'parent' }));
  }),
  http.put<any, Partial<User>>(
    `*/account/users/${parentAccountNonAdminUser.username}`,
    async ({ request }) => {
      const body = await request.json();
      const { restricted } = body;
      if (restricted !== undefined) {
        parentAccountNonAdminUser.restricted = restricted;
      }
      return HttpResponse.json(parentAccountNonAdminUser);
    }
  ),
  http.get(`*/account/users/${childAccountUser.username}/grants`, () => {
    return HttpResponse.json(
      grantsFactory.build({
        global: {
          account_access: 'read_write',
          cancel_account: false,
        },
      })
    );
  }),
  http.get(`*/account/users/${proxyAccountUser.username}/grants`, () => {
    return HttpResponse.json(
      grantsFactory.build({
        global: {
          account_access: 'read_write',
          add_domains: false,
          add_firewalls: false,
          add_images: false,
          add_linodes: false,
          add_longview: false,
          add_nodebalancers: false,
          add_stackscripts: false,
          add_volumes: false,
          add_vpcs: false,
          cancel_account: false,
          longview_subscription: false,
        },
      })
    );
  }),
  http.get(`*/account/users/${parentAccountUser.username}/grants`, () => {
    return HttpResponse.json(
      grantsFactory.build({
        global: {
          cancel_account: false,
          child_account_access: true,
        },
      })
    );
  }),
  http.get(
    `*/account/users/${parentAccountNonAdminUser.username}/grants`,
    () => {
      const grantsResponse = grantsFactory.build({
        global: parentAccountNonAdminUser.restricted
          ? {
              cancel_account: false,
              child_account_access: true,
            }
          : undefined,
      });
      return HttpResponse.json(grantsResponse);
    }
  ),
  http.get('*/account/users/:user/grants', () => {
    return HttpResponse.json(
      grantsFactory.build({
        domain: [],
        firewall: [],
        global: {
          cancel_account: true,
        },
        image: [],
        linode: grantFactory.buildList(6000),
        longview: [],
        nodebalancer: [],
        stackscript: grantFactory.buildList(30),
        volume: grantFactory.buildList(100),
      })
    );
  }),
  http.get('*/account/logins', () => {
    const failedRestrictedAccountLogin = accountLoginFactory.build({
      restricted: true,
      status: 'failed',
    });
    const successfulAccountLogins = accountLoginFactory.buildList(25);

    return HttpResponse.json(
      makeResourcePage([
        failedRestrictedAccountLogin,
        ...successfulAccountLogins,
      ])
    );
  }),
  http.get('*/account/payment-methods', () => {
    const defaultPaymentMethod = paymentMethodFactory.build({
      data: { card_type: 'MasterCard' },
      is_default: true,
    });

    const googlePayPaymentMethod = paymentMethodFactory.build({
      type: 'google_pay',
    });

    const paypalPaymentMethod = paymentMethodFactory.build({
      data: {
        email: 'test@example.com',
        paypal_id: '6781945682',
      },
      type: 'paypal',
    });

    const otherPaymentMethod = paymentMethodFactory.build();

    return HttpResponse.json(
      makeResourcePage([
        defaultPaymentMethod,
        otherPaymentMethod,
        googlePayPaymentMethod,
        paypalPaymentMethod,
      ])
    );
  }),
  http.post('*/seen', () => {
    return HttpResponse.json({});
  }),
  http.get(
    '*/events',
    () => {
      const events = eventFactory.buildList(1, {
        action: 'lke_node_create',
        entity: {
          id: 1,
          label: 'linode-1',
          type: 'linode',
          url: 'https://google.com',
        },
        message:
          'Rebooting this thing and showing an extremely long event message for no discernible reason other than the fairly obvious reason that we want to do some testing of whether or not these messages wrap.',
        percent_complete: 15,
        secondary_entity: {
          id: 1,
          label: 'my config',
          type: 'linode',
          url: 'https://google.com',
        },
        status: 'notification',
      });

      const dbEvents = eventFactory.buildList(1, {
        action: 'database_low_disk_space',
        entity: { id: 999, label: 'database-1', type: 'database' },
        message: 'Low disk space.',
        status: 'notification',
      });
      const dbMigrationEvents = eventFactory.buildList(1, {
        action: 'database_migrate',
        entity: { id: 11, label: 'database-11', type: 'database' },
        message: 'Database migration started.',
        status: 'started',
      });
      const dbMigrationFinishedEvents = eventFactory.buildList(1, {
        action: 'database_migrate',
        entity: { id: 11, label: 'database-11', type: 'database' },
        message: 'Database migration finished.',
        status: 'finished',
      });
      const oldEvents = eventFactory.buildList(20, {
        action: 'account_update',
        percent_complete: 100,
        seen: true,
      });
      const eventWithSpecialCharacters = eventFactory.build({
        action: 'ticket_update',
        entity: {
          id: 10,
          label: 'Ticket name with special characters... (?)',
          type: 'ticket',
        },
        message: 'Ticket name with special characters... (?)',
        percent_complete: 100,
        status: 'notification',
      });
      const placementGroupCreateEvent = eventFactory.buildList(1, {
        action: 'placement_group_create',
        entity: { id: 999, label: 'PG-1', type: 'placement_group' },
        message: 'Placement Group successfully created.',
        percent_complete: 100,
        status: 'notification',
      });
      const placementGroupAssignedEvent = eventFactory.buildList(1, {
        action: 'placement_group_assign',
        entity: { id: 990, label: 'PG-2', type: 'placement_group' },
        message: 'Placement Group successfully assigned.',
        percent_complete: 100,
        secondary_entity: {
          id: 1,
          label: 'My Config',
          type: 'linode',
          url: '/v4/linode/instances/1/configs/1',
        },
        status: 'notification',
      });

      return HttpResponse.json(
        makeResourcePage([
          ...events,
          ...dbMigrationEvents,
          ...dbMigrationFinishedEvents,
          ...dbEvents,
          ...placementGroupAssignedEvent,
          ...placementGroupCreateEvent,
          eventWithSpecialCharacters,
          ...oldEvents,
        ])
      );
    },
    {
      once: false,
    }
  ),

  http.get('*/support/tickets', () => {
    const tickets = supportTicketFactory.buildList(15, {
      severity: 1,
      status: 'open',
    });
    return HttpResponse.json(makeResourcePage(tickets));
  }),
  http.get('*/support/tickets/999', () => {
    const ticket = supportTicketFactory.build({
      closed: new Date().toISOString(),
      id: 999,
    });
    return HttpResponse.json(ticket);
  }),
  http.get('*/support/tickets/:ticketId', ({ params }) => {
    const ticket = supportTicketFactory.build({
      id: Number(params.ticketId),
      severity: 1,
    });
    return HttpResponse.json(ticket);
  }),
  http.get('*/support/tickets/:ticketId/replies', () => {
    const replies = supportReplyFactory.buildList(15);
    return HttpResponse.json(makeResourcePage(replies));
  }),
  http.put('*/longview/plan', () => {
    return HttpResponse.json({});
  }),
  http.get('*/longview/plan', () => {
    const plan = longviewActivePlanFactory.build({});
    return HttpResponse.json(plan);
  }),
  http.get('*/longview/subscriptions', () => {
    const subscriptions = longviewSubscriptionFactory.buildList(10);
    return HttpResponse.json(makeResourcePage(subscriptions));
  }),
  http.post('https://longview.linode.com/fetch', () => {
    return HttpResponse.json({});
  }),
  http.get('*/longview/clients', () => {
    const clients = longviewClientFactory.buildList(10);
    return HttpResponse.json(makeResourcePage(clients));
  }),
  http.post('*/backups/enable/*', () => {
    return HttpResponse.json({});
  }),
  http.get('*/account/settings', () => {
    return HttpResponse.json({
      backups_enabled: true,
      longview_subscription: 'longview-100',
      managed: true,
      maintenance_policy: 'linode/migrate',
      network_helper: true,
      object_storage: 'active',
    });
  }),
  http.put('*/account/settings/*', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(body as any);
  }),
  http.get('*/tags', () => {
    tagFactory.resetSequenceNumber();
    const tags = tagFactory.buildList(5);
    return HttpResponse.json(makeResourcePage(tags));
  }),
  http.get('*gravatar*', () => {
    return HttpResponse.json({}, { status: 400 });
  }),
  http.get('*linode.com/blog/feed*', () => {
    return HttpResponse.json(null, { status: 400 });
  }),
  http.get('*managed/services', () => {
    const monitors = monitorFactory.buildList(25);
    const downUnresolvedMonitor = monitorFactory.build({
      id: 998,
      status: 'problem',
    });
    const downResolvedMonitor = monitorFactory.build({
      id: 999,
      label: 'Problem',
      status: 'problem',
    });
    return HttpResponse.json(
      makeResourcePage([
        ...monitors,
        downUnresolvedMonitor,
        downResolvedMonitor,
      ])
    );
  }),

  http.post('*/managed/services', async ({ request }) => {
    const body = await request.json();
    const monitor = monitorFactory.build(body as any);
    return HttpResponse.json(monitor);
  }),
  http.put('*/managed/services/:id', async ({ params, request }) => {
    const body = await request.json();
    const payload = body as any;

    return HttpResponse.json(
      monitorFactory.build({
        ...payload,
        id: Number(params.id),
      })
    );
  }),
  http.delete('*/managed/services/:id', () => {
    return HttpResponse.json({});
  }),
  http.get('*managed/stats', () => {
    const stats = managedStatsFactory.build();
    return HttpResponse.json(stats);
  }),
  http.get('*managed/issues', () => {
    const openIssue = managedIssueFactory.build({
      created: DateTime.now().minus({ days: 2 }).toISO(),
      entity: { id: 1 },
      services: [998],
    });
    const closedIssue = managedIssueFactory.build({
      created: DateTime.now().minus({ days: 2 }).toISO(),
      entity: { id: 999 },
      services: [999],
    });
    return HttpResponse.json(makeResourcePage([openIssue, closedIssue]));
  }),
  http.get('*managed/linode-settings', () => {
    return HttpResponse.json(
      makeResourcePage(managedLinodeSettingFactory.buildList(5))
    );
  }),
  http.get('*managed/credentials/sshkey', () => {
    return HttpResponse.json(managedSSHPubKeyFactory.build());
  }),
  http.get('*managed/credentials', () => {
    return HttpResponse.json(makeResourcePage(credentialFactory.buildList(5)));
  }),
  http.post('*managed/credentials', async ({ request }) => {
    const body = await request.json();
    const response = credentialFactory.build({
      ...(body as any),
    });

    return HttpResponse.json(response);
  }),
  http.post('*managed/credentials/:id/revoke', () => {
    return HttpResponse.json({});
  }),
  http.get('*managed/contacts', () => {
    return HttpResponse.json(makeResourcePage(contactFactory.buildList(5)));
  }),
  http.delete('*managed/contacts/:id', () => {
    return HttpResponse.json({});
  }),
  http.put('*managed/contacts/:id', async ({ params, request }) => {
    const body = await request.json();
    const payload = {
      ...(body as any),
      id: Number(params.id),
    };

    return HttpResponse.json(payload);
  }),
  http.post('*managed/contacts', async ({ request }) => {
    const body = await request.json();
    const response = contactFactory.build({
      ...(body as any),
    });
    return HttpResponse.json(response);
  }),
  http.get('*stackscripts/', () => {
    return HttpResponse.json(makeResourcePage(stackScriptFactory.buildList(1)));
  }),

  http.get('*/notifications', () => {
    // pastDueBalance included here merely for ease of testing for Notifications section in the Notifications drawer.
    const pastDueBalance = notificationFactory.build({
      body: null,
      entity: null,
      label: 'past due',
      message: `You have a past due balance of $58.50. Please make a payment immediately to avoid service disruption.`,
      severity: 'critical',
      type: 'payment_due',
      until: null,
      when: null,
    });

    // const gdprNotification = gdprComplianceNotification.build();

    const generalGlobalNotice = {
      body: null,
      entity: null,
      label: "We've updated our policies.",

      message:
        "We've updated our policies. See <a href='https://cloud.linode.com/support'>this page</a> for more information.",
      severity: 'minor',
      type: 'notice',
      until: null,
      when: null,
    };

    const outageNotification = {
      body: null,
      entity: {
        id: 'us-east',
        label: null,
        type: 'region',
        url: '/regions/us-east',
      },
      label: 'There is an issue affecting service in this facility',
      message:
        'We are aware of an issue affecting service in this facility. If you are experiencing service issues in this facility, there is no need to open a support ticket at this time. Please monitor our status blog at https://status.linode.com for further information.  Thank you for your patience and understanding.',
      severity: 'major',
      type: 'outage',
      until: null,
      when: null,
    };

    // const emailBounce = notificationFactory.build({
    //   body: null,
    //   entity: null,
    //   label: 'We are unable to send emails to your billing email address!',
    //   message: 'We are unable to send emails to your billing email address!',
    //   severity: 'major',
    //   type: 'billing_email_bounce',
    //   until: null,
    //   when: null,
    // });

    // const abuseTicket = abuseTicketNotificationFactory.build();

    const migrationNotification = notificationFactory.build({
      entity: { id: 0, label: 'linode-0', type: 'linode' },
      label: 'You have a migration pending!',
      message:
        'You have a migration pending! Your Linode must be offline before starting the migration.',
      severity: 'major',
      type: 'migration_pending',
    });

    const minorSeverityNotification = notificationFactory.build({
      message: 'Testing for minor notification',
      severity: 'minor',
      type: 'notice',
    });

    const criticalSeverityNotification = notificationFactory.build({
      message: 'Testing for critical notification',
      severity: 'critical',
      type: 'notice',
    });

    const balanceNotification = notificationFactory.build({
      message: 'You have an overdue balance!',
      severity: 'major',
      type: 'payment_due',
    });

    const blockStorageMigrationScheduledNotification =
      notificationFactory.build({
        body: 'Your volumes in us-east will be upgraded to NVMe.',
        entity: {
          id: 20,
          label: 'eligibleNow',
          type: 'volume',
          url: '/volumes/20',
        },
        label: 'You have a scheduled Block Storage volume upgrade pending!',
        message:
          'The Linode that the volume is attached to will shut down in order to complete the upgrade and reboot once it is complete. Any other volumes attached to the same Linode will also be upgraded.',
        severity: 'critical',
        type: 'volume_migration_scheduled' as NotificationType,
        until: '2021-10-16T04:00:00',
        when: '2021-09-30T04:00:00',
      });

    const blockStorageMigrationScheduledNotificationUnattached =
      notificationFactory.build({
        body: 'Your volume will be upgraded to NVMe.',
        entity: {
          id: 30,
          label: 'hdd-unattached',
          type: 'volume',
          url: '/volumes/30',
        },
        label: 'You have a scheduled Block Storage volume upgrade pending!',
        message:
          'This unattached volume is scheduled to be migrated to NVMe I think.',
        severity: 'critical',
        type: 'volume_migration_scheduled' as NotificationType,
        until: '2021-10-16T04:00:00',
        when: '2021-09-30T04:00:00',
      });

    const blockStorageMigrationImminentNotification = notificationFactory.build(
      {
        body: 'Your volumes in us-east will be upgraded to NVMe.',
        entity: {
          id: 2,
          label: 'example-upgrading',
          type: 'volume',
          url: '/volumes/2',
        },
        label: 'You have a scheduled Block Storage volume upgrade pending!',
        message:
          'The Linode that the volume is attached to will shut down in order to complete the upgrade and reboot once it is complete. Any other volumes attached to the same Linode will also be upgraded.',
        severity: 'major',
        type: 'volume_migration_imminent' as NotificationType,
        until: '2021-10-16T04:00:00',
        when: '2021-09-30T04:00:00',
      }
    );

    return HttpResponse.json(
      makeResourcePage([
        pastDueBalance,
        ...notificationFactory.buildList(1),
        // gdprNotification,
        generalGlobalNotice,
        outageNotification,
        minorSeverityNotification,
        criticalSeverityNotification,
        // abuseTicket,
        // emailBounce,
        migrationNotification,
        balanceNotification,
        blockStorageMigrationScheduledNotification,
        blockStorageMigrationImminentNotification,
        blockStorageMigrationScheduledNotificationUnattached,
      ])
    );
  }),

  http.post('*/networking/vlans', () => {
    return HttpResponse.json({});
  }),
  http.post<{}, { prefix_length: number }>(
    '*/networking/ipv6/ranges',
    async ({ request }) => {
      const body = await request.json();
      const range = body?.['prefix_length'];
      return HttpResponse.json({ range, route_target: '2001:DB8::0000' });
    }
  ),
  http.post('*/networking/ips/assign', () => {
    return HttpResponse.json({});
  }),
  http.post('*/account/payments', () => {
    return HttpResponse.json(creditPaymentResponseFactory.build());
  }),
  http.get('*/profile/tokens', () => {
    return HttpResponse.json(makeResourcePage(appTokenFactory.buildList(30)));
  }),
  http.post<any, TokenRequest>('*/profile/tokens', async ({ request }) => {
    const body = await request.json();
    const data = body;
    return HttpResponse.json(appTokenFactory.build(data));
  }),
  http.put<any, Partial<TokenRequest>>(
    '*/profile/tokens/:id',
    async ({ params, request }) => {
      const body = await request.json();
      const data = body;
      return HttpResponse.json(
        appTokenFactory.build({ id: Number(params.id), ...data })
      );
    }
  ),
  http.delete('*/profile/tokens/:id', () => {
    return HttpResponse.json({});
  }),
  http.get('*/v4*/account/betas', () => {
    return HttpResponse.json(
      makeResourcePage([
        ...accountBetaFactory.buildList(5),
        accountBetaFactory.build({
          ended: DateTime.now().minus({ days: 5 }).toISO(),
          enrolled: DateTime.now().minus({ days: 20 }).toISO(),
          started: DateTime.now().minus({ days: 30 }).toISO(),
        }),
        accountBetaFactory.build({
          ended: DateTime.now().plus({ days: 5 }).toISO(),
          enrolled: undefined,
          started: DateTime.now().minus({ days: 30 }).toISO(),
        }),
      ])
    );
  }),
  http.get('*/v4*/account/betas/:id', ({ params }) => {
    if (params.id !== 'undefined') {
      return HttpResponse.json(
        accountBetaFactory.build({ id: params.id as string })
      );
    }
    return HttpResponse.json({}, { status: 404 });
  }),
  http.get('*/v4*/betas', () => {
    return HttpResponse.json(makeResourcePage(betaFactory.buildList(5)));
  }),
  http.get('*/v4*/betas/:id', ({ params }) => {
    const id = params.id.toString();
    if (params.id !== 'undefined') {
      return HttpResponse.json(betaFactory.build({ id }));
    }
    return HttpResponse.json({}, { status: 404 });
  }),
  http.get('*regions/availability', () => {
    return HttpResponse.json(
      makeResourcePage([
        regionAvailabilityFactory.build({
          plan: 'g6-standard-6',
          region: 'us-east',
        }),
        regionAvailabilityFactory.build({
          plan: 'g6-standard-7',
          region: 'us-east',
        }),
        regionAvailabilityFactory.build({
          plan: 'g6-dedicated-5',
          region: 'us-central',
        }),
        regionAvailabilityFactory.build({
          plan: 'g6-dedicated-6',
          region: 'us-central',
        }),
      ])
    );
  }),
  http.get('*regions/:regionId/availability', ({ params }) => {
    const selectedRegion = params.regionId as string;

    return HttpResponse.json([
      regionAvailabilityFactory.build({
        plan: 'g6-standard-6',
        region: selectedRegion,
      }),
      regionAvailabilityFactory.build({
        plan: 'g6-standard-7',
        region: selectedRegion,
      }),
      regionAvailabilityFactory.build({
        plan: 'premium-32',
        region: selectedRegion,
        available: false, // Mock for when a premium plan is not available or sold out in a region.
      }),
      // MTC plans are region-specific. The supported regions list below is hardcoded for testing purposes and will expand over time.
      // The availability of MTC plans is fully handled by this endpoint, which determines the plan's availability status (true/false) for the selected region.
      ...(['no-osl-1', 'us-iad', 'us-iad-2'].includes(selectedRegion)
        ? [
            regionAvailabilityFactory.build({
              available: true, // In supported regions, this can be `true` (plan available) or `false` (plan sold-out).
              plan: 'g8-premium-128-ht',
              region: selectedRegion,
            }),
          ]
        : [
            regionAvailabilityFactory.build({
              available: false, // In unsupported region, this will always be `false` (Plan not offered/not available).
              plan: 'g8-premium-128-ht',
              region: selectedRegion,
            }),
          ]),
    ]);
  }),

  // Placement Groups
  http.get('*/placement/groups', () => {
    return HttpResponse.json(
      makeResourcePage([
        placementGroupFactory.build({
          id: 1,
          is_compliant: true,
          members: [1, 2, 3, 4, 5, 6, 7, 8, 43].map((linode) => ({
            is_compliant: true,
            linode_id: linode,
          })),
          placement_group_policy: 'strict',
          placement_group_type: 'anti_affinity:local',
          region: 'us-east',
        }),
        placementGroupFactory.build({
          id: 2,
          is_compliant: true,
          members: [
            {
              is_compliant: true,
              linode_id: 9,
            },
            {
              is_compliant: true,
              linode_id: 10,
            },
            {
              is_compliant: true,
              linode_id: 11,
            },
          ],
          placement_group_policy: 'strict',
          placement_group_type: 'affinity:local',
          region: 'us-west',
        }),
        placementGroupFactory.build({
          id: 3,
          is_compliant: true,
          members: [
            {
              is_compliant: true,
              linode_id: 12,
            },
          ],
          placement_group_policy: 'strict',
          placement_group_type: 'affinity:local',
          region: 'ca-central',
        }),
      ])
    );
  }),
  http.get('*/placement/groups/:placementGroupId', ({ params }) => {
    if (params.placementGroupId === 'undefined') {
      return HttpResponse.json({}, { status: 404 });
    }

    return HttpResponse.json(
      placementGroupFactory.build({
        id: 1,
      })
    );
  }),
  http.post('*/placement/groups', async ({ request }) => {
    const reqBody = await request.json();
    const body = reqBody as any;
    const response = placementGroupFactory.build({
      ...body,
    });

    return HttpResponse.json(response);
  }),
  http.put(
    '*/placement/groups/:placementGroupId',
    async ({ params, request }) => {
      const body = await request.json();

      if (params.placementGroupId === '-1') {
        return HttpResponse.json({}, { status: 404 });
      }

      const response = placementGroupFactory.build({
        ...(body as any),
      });

      return HttpResponse.json(response);
    }
  ),
  http.delete('*/placement/groups/:placementGroupId', ({ params }) => {
    if (params.placementGroupId === '-1') {
      return HttpResponse.json({}, { status: 404 });
    }

    return HttpResponse.json({});
  }),
  http.post(
    '*/placement/groups/:placementGroupId/assign',
    async ({ params, request }) => {
      const body = await request.json();

      if (params.placementGroupId === '-1') {
        return HttpResponse.json({}, { status: 404 });
      }

      const response = placementGroupFactory.build({
        id: Number(params.placementGroupId) || -1,
        label: 'pg-1',
        members: [
          {
            is_compliant: true,
            linode_id: 1,
          },
          {
            is_compliant: true,
            linode_id: 2,
          },
          {
            is_compliant: true,
            linode_id: 3,
          },
          {
            is_compliant: true,
            linode_id: 4,
          },
          {
            is_compliant: true,
            linode_id: 5,
          },
          {
            is_compliant: true,
            linode_id: 6,
          },
          {
            is_compliant: true,
            linode_id: 7,
          },
          {
            is_compliant: true,
            linode_id: 8,
          },
          {
            is_compliant: false,
            linode_id: 43,
          },
          {
            is_compliant: true,
            linode_id: (body as any).linodes[0],
          },
        ],
        placement_group_type: 'anti_affinity:local',
      });

      return HttpResponse.json(response);
    }
  ),
  http.post('*/placement/groups/:placementGroupId/unassign', ({ params }) => {
    if (params.placementGroupId === '-1') {
      return HttpResponse.json({}, { status: 404 });
    }

    const response = placementGroupFactory.build({
      id: Number(params.placementGroupId) || -1,
      label: 'pg-1',
      members: [
        {
          is_compliant: true,
          linode_id: 1,
        },

        {
          is_compliant: true,
          linode_id: 2,
        },
        {
          is_compliant: true,
          linode_id: 3,
        },
        {
          is_compliant: true,
          linode_id: 4,
        },
        {
          is_compliant: true,
          linode_id: 5,
        },
        {
          is_compliant: true,
          linode_id: 6,
        },
        {
          is_compliant: true,
          linode_id: 7,
        },
        {
          is_compliant: true,
          linode_id: 8,
        },
        {
          is_compliant: false,
          linode_id: 43,
        },
      ],
      placement_group_type: 'anti_affinity:local',
    });

    return HttpResponse.json(response);
  }),
  http.post(
    '*/monitor/services/:service_type/alert-definitions',
    async ({ request }) => {
      const types: AlertDefinitionType[] = ['system', 'user'];
      const status: AlertStatusType[] = ['enabled', 'disabled'];
      const severity: AlertSeverityType[] = [0, 1, 2, 3];
      const users = ['user1', 'user2', 'user3'];
      const serviceTypes: CloudPulseServiceType[] = ['linode', 'dbaas'];
      const reqBody = await request.json();
      const response = alertFactory.build({
        ...(reqBody as CreateAlertDefinitionPayload),
        created_by: pickRandom(users),
        service_type: pickRandom(serviceTypes),
        severity: pickRandom(severity),
        status: pickRandom(status),
        type: pickRandom(types),
        updated_by: pickRandom(users),
      });
      return HttpResponse.json(response);
    }
  ),
  http.get(
    '*/monitor/services/:serviceType/alert-definitions',
    async ({ params }) => {
      const serviceType = params.serviceType;
      alertFactory.resetSequenceNumber();
      return HttpResponse.json({
        data: [
          ...alertFactory.buildList(18, {
            rule_criteria: {
              rules: alertRulesFactory.buildList(2),
            },
            service_type: serviceType === 'dbaas' ? 'dbaas' : 'linode',
          }),
          // Mocked 2 alert definitions associated with mock Linode ID '1004' (aclp-supported-region-linode-1)
          ...alertFactory.buildList(2, {
            rule_criteria: {
              rules: alertRulesFactory.buildList(2),
            },
            service_type: serviceType === 'dbaas' ? 'dbaas' : 'linode',
            entity_ids: ['1004'],
          }),
          ...alertFactory.buildList(6, {
            service_type: serviceType === 'dbaas' ? 'dbaas' : 'linode',
            type: 'user',
            regions: ['us-ord'],
            scope: 'account',
          }),
          ...alertFactory.buildList(6, {
            service_type: serviceType === 'dbaas' ? 'dbaas' : 'linode',
            type: 'user',
            scope: 'region',
            regions: ['us-east'],
          }),
          ...alertFactory.buildList(6, {
            service_type: serviceType === 'dbaas' ? 'dbaas' : 'linode',
            type: 'user',
            scope: 'entity',
            regions: ['us-east'],
            entity_ids: ['5', '6'],
          }),
        ],
      });
    }
  ),
  http.get('*/monitor/alert-definitions', async () => {
    const customAlerts = alertFactory.buildList(10, {
      created_by: 'user1',
      severity: 0,
      type: 'user',
      updated: '2021-10-16T04:00:00',
      updated_by: 'user1',
      scope: pickRandom(['account', 'entity', 'region']),
    });
    const customAlertsWithServiceType = alertFactory.buildList(10, {
      created_by: 'user1',
      service_type: 'dbaas',
      severity: 1,
      type: 'user',
      updated_by: 'user1',
      scope: pickRandom(['account', 'entity', 'region']),
    });
    const defaultAlerts = alertFactory.buildList(15);
    const defaultAlertsWithServiceType = alertFactory.buildList(7, {
      service_type: 'dbaas',
      severity: 3,
      scope: pickRandom(['account', 'entity', 'region']),
    });
    const alerts = [
      ...defaultAlerts,
      ...alertFactory.buildList(8, {
        created_by: 'user1',
        service_type: 'linode',
        status: 'disabled',
        type: 'user',
        updated_by: 'user1',
      }),
      ...customAlerts,
      ...defaultAlertsWithServiceType,
      ...alertFactory.buildList(3),
      ...alertFactory.buildList(36, {
        status: 'disabled',
        tags: ['tag-3'],
        updated: '2021-10-16T04:00:00',
      }),
      ...customAlertsWithServiceType,
      ...alertFactory.buildList(2, {
        created_by: 'user1',
        service_type: 'linode',
        status: 'in progress',
        tags: ['tag-1', 'tag-2'],
        type: 'user',
        updated_by: 'user1',
      }),
      ...alertFactory.buildList(2, {
        created_by: 'user1',
        service_type: 'linode',
        status: 'failed',
        tags: ['tag-1', 'tag-2'],
        type: 'user',
        updated_by: 'user1',
      }),
      alertFactory.build({
        id: 999,
        label: 'Firewall - testing',
        service_type: 'firewall',
        type: 'user',
        scope: 'account',
        created_by: 'user1',
        rule_criteria: {
          rules: [firewallMetricRulesFactory.build()],
        },
      }),
      alertFactory.build({
        id: 550,
        label: 'Object Storage - testing',
        type: 'user',
        service_type: 'objectstorage',
        entity_ids: ['obj-bucket-804.ap-west.linodeobjects.com'],
      }),
      alertFactory.build({
        id: 300,
        type: 'user',
        label: 'block-storage - testing',
        service_type: 'blockstorage',
        entity_ids: ['1', '2', '4', '3', '5', '6', '7', '8', '9', '10'],
        rule_criteria: {
          rules: [blockStorageMetricCriteria.build()],
        },
      }),
      alertFactory.build({
        id: 650,
        label: 'Firewall - nodebalancer',
        type: 'user',
        service_type: 'firewall',
        entity_ids: ['25'],
        rule_criteria: {
          rules: [firewallNodebalancerMetricCriteria.build()],
        },
      }),
    ];
    return HttpResponse.json(makeResourcePage(alerts));
  }),
  http.get(
    '*/monitor/services/:serviceType/alert-definitions/:id',
    ({ params }) => {
      if (params.id === '999' && params.serviceType === 'firewall') {
        return HttpResponse.json(
          alertFactory.build({
            scope: 'account',
            entity_ids: ['1', '2', '3'],
            id: 999,
            label: 'Firewall - testing',
            service_type: 'firewall',
            type: 'user',
            rule_criteria: {
              rules: [firewallMetricRulesFactory.build()],
            },
          })
        );
      }
      if (params.id === '550' && params.serviceType === 'objectstorage') {
        return HttpResponse.json(
          alertFactory.build({
            id: 550,
            type: 'user',
            label: 'object-storage -testing',
            service_type: 'objectstorage',
            entity_ids: [
              'obj-bucket-804.ap-west.linodeobjects.com',
              'obj-bucket-230.us-iad.linodeobjects.com',
            ],
            rule_criteria: {
              rules: [objectStorageMetricCriteria.build()],
            },
          })
        );
      }
      if (params.id === '300' && params.serviceType === 'blockstorage') {
        return HttpResponse.json(
          alertFactory.build({
            id: 300,
            type: 'user',
            label: 'block-storage - testing',
            service_type: 'blockstorage',
            entity_ids: ['1', '2', '4', '3', '5', '6', '7', '8', '9', '10'],
            rule_criteria: {
              rules: [blockStorageMetricCriteria.build()],
            },
          })
        );
      }
      if (params.id === '650' && params.serviceType === 'firewall') {
        return HttpResponse.json(
          alertFactory.build({
            id: 650,
            label: 'Firewall - nodebalancer',
            type: 'user',
            scope: 'entity',
            service_type: 'firewall',
            entity_ids: ['25'],
            rule_criteria: {
              rules: [firewallNodebalancerMetricCriteria.build()],
            },
          })
        );
      }
      if (params.id !== undefined) {
        return HttpResponse.json(
          alertFactory.build({
            id: Number(params.id),
            rule_criteria: {
              rules: [
                ...alertRulesFactory.buildList(2, {
                  dimension_filters: alertDimensionsFactory.buildList(2),
                }),
                ...alertRulesFactory.buildList(1, { dimension_filters: [] }),
              ],
            },
            service_type: params.serviceType === 'linode' ? 'linode' : 'dbaas',
            type: 'user',
            scope: pickRandom(['account', 'region', 'entity']),
          })
        );
      }
      return HttpResponse.json({}, { status: 404 });
    }
  ),
  http.put(
    '*/monitor/services/:serviceType/alert-definitions/:id',
    ({ params, request }) => {
      if (params.id === '999' && params.serviceType === 'firewall') {
        return HttpResponse.json(
          alertFactory.build({
            id: 999,
            scope: 'account',
            label: 'Firewall - testing',
            service_type: 'firewall',
            type: 'user',
            rule_criteria: {
              rules: [firewallMetricRulesFactory.build()],
            },
          })
        );
      }
      if (params.id === '650' && params.serviceType === 'firewall') {
        return HttpResponse.json(
          alertFactory.build({
            id: 650,
            label: 'Firewall - nodebalancer',
            type: 'user',
            service_type: 'firewall',
            entity_ids: ['25'],
            rule_criteria: {
              rules: [firewallNodebalancerMetricCriteria.build()],
            },
          })
        );
      }
      if (params.id === '550' && params.serviceType === 'objectstorage') {
        return HttpResponse.json(
          alertFactory.build({
            id: 550,
            label: 'object-storage -testing',
            type: 'user',
            rule_criteria: {
              rules: [objectStorageMetricCriteria.build()],
            },
            service_type: 'objectstorage',
            entity_ids: ['obj-bucket-804.ap-west.linodeobjects.com'],
          })
        );
      }
      if (params.id === '300' && params.serviceType === 'blockstorage') {
        return HttpResponse.json(
          alertFactory.build({
            id: 300,
            type: 'user',
            label: 'block-storage - testing',
            service_type: 'blockstorage',
            entity_ids: ['1', '2', '4', '3', '5', '6', '7', '8', '9', '10'],
            rule_criteria: {
              rules: [blockStorageMetricCriteria.build()],
            },
          })
        );
      }
      const body: any = request.json();
      return HttpResponse.json(
        alertFactory.build({
          id: Number(params.id),
          label: `Alert-${params.id}`,
          status: body.status === 'enabled' ? 'disabled' : 'enabled',
        }),
        {
          status: 200,
        }
      );
    }
  ),
  http.delete('*/monitor/services/:serviceType/alert-definitions/:id', () => {
    return HttpResponse.json({});
  }),
  http.get('*/monitor/alert-channels', () => {
    return HttpResponse.json(
      makeResourcePage(notificationChannelFactory.buildList(7))
    );
  }),
  http.delete('*/monitor/services/:serviceType/alert-definitions/:id', () => {
    return HttpResponse.json({});
  }),
  http.get('*/monitor/services', () => {
    const response: ServiceTypesList = {
      data: [
        serviceTypesFactory.build({
          label: 'Linodes',
          service_type: 'linode',
          alert: serviceAlertFactory.build({ scope: ['entity'] }),
        }),
        serviceTypesFactory.build({
          label: 'Databases',
          service_type: 'dbaas',
          alert: {
            evaluation_period_seconds: [300],
            polling_interval_seconds: [300],
          },
        }),
        serviceTypesFactory.build({
          label: 'Nodebalancers',
          service_type: 'nodebalancer',
          regions: 'us-iad,us-east',
          alert: serviceAlertFactory.build({ scope: ['entity'] }),
        }),
        serviceTypesFactory.build({
          label: 'Firewalls',
          service_type: 'firewall',
          regions: 'us-iad,us-east',
          alert: serviceAlertFactory.build({ scope: ['entity'] }),
        }),
        serviceTypesFactory.build({
          label: 'Object Storage',
          service_type: 'objectstorage',
          regions: 'us-iad,us-east',
          alert: serviceAlertFactory.build({
            scope: ['entity', 'account', 'region'],
          }),
        }),
        serviceTypesFactory.build({
          label: 'Block Storage',
          service_type: 'blockstorage',
          regions: 'us-iad,us-east',
          alert: serviceAlertFactory.build({
            scope: ['entity', 'account', 'region'],
          }),
        }),
        serviceTypesFactory.build({
          label: 'LKE Enterprise',
          service_type: 'lke',
          regions: 'us-iad,us-east',
          alert: serviceAlertFactory.build({
            scope: ['entity', 'account', 'region'],
          }),
        }),
      ],
    };

    return HttpResponse.json(response);
  }),

  http.get('*/monitor/services/:serviceType', ({ params }) => {
    const serviceType = params.serviceType as CloudPulseServiceType;
    const serviceTypesMap: Record<CloudPulseServiceType, string> = {
      linode: 'Linode',
      dbaas: 'Databases',
      nodebalancer: 'NodeBalancers',
      firewall: 'Firewalls',
      objectstorage: 'Object Storage',
      blockstorage: 'Block Storage',
      lke: 'LKE',
    };
    const serviceTypeScopeMap: Record<
      CloudPulseServiceType,
      AlertDefinitionScope[]
    > = {
      linode: ['entity'],
      dbaas: ['entity'],
      nodebalancer: ['entity'],
      firewall: ['entity', 'account'],
      objectstorage: ['entity', 'account', 'region'],
      blockstorage: ['entity', 'account', 'region'],
      lke: ['entity'],
    };
    const response = serviceTypesFactory.build({
      service_type: `${serviceType}`,
      label: serviceTypesMap[serviceType],
      alert: serviceAlertFactory.build({
        evaluation_period_seconds: [300],
        polling_interval_seconds: [300],
        scope: serviceTypeScopeMap[serviceType],
      }),
    });

    return HttpResponse.json(response, { status: 200 });
  }),
  http.get('*/monitor/services/:serviceType/dashboards', ({ params }) => {
    const response = {
      data: [] as Dashboard[],
    };

    if (params.serviceType === 'dbaas') {
      response.data.push(
        dashboardFactory.build({
          id: 1,
          label: 'DBaaS Dashboard',
          service_type: 'dbaas',
          widgets: [
            widgetFactory.build({
              label: 'CPU utilization',
              metric: 'system_cpu_utilization_percent',
              unit: '%',
              group_by: ['entity_id'],
              y_label: 'system_cpu_utilization_ratio',
            }),
          ],
        })
      );
    }

    if (params.serviceType === 'linode') {
      response.data.push(
        dashboardFactory.build({
          id: 2,
          label: 'Linode Dashboard',
          service_type: 'linode',
          widgets: [
            widgetFactory.build({
              label: 'CPU utilization',
              metric: 'system_cpu_utilization_percent',
              unit: '%',
              group_by: ['entity_id'],
              y_label: 'system_cpu_utilization_ratio',
            }),
          ],
        })
      );
    }

    if (params.serviceType === 'nodebalancer') {
      response.data.push(
        dashboardFactory.build({
          id: 3,
          label: 'Nodebalancer Dashboard',
          service_type: 'nodebalancer',
        })
      );
    }

    if (params.serviceType === 'firewall') {
      response.data.push(
        dashboardFactory.build({
          id: 4,
          label: 'Firewall Dashboard',
          service_type: 'firewall',
        })
      );
      response.data.push(
        dashboardFactory.build({
          id: 8,
          label: 'Firewall Nodebalancer Dashboard',
          service_type: 'firewall',
        })
      );
    }

    if (params.serviceType === 'objectstorage') {
      response.data.push(
        dashboardFactory.build({
          id: 6,
          label: 'Object Storage Dashboard',
          service_type: 'objectstorage',
        })
      );
    }

    if (params.serviceType === 'blockstorage') {
      response.data.push(
        dashboardFactory.build({
          id: 7,
          label: 'Block Storage Dashboard',
          service_type: 'blockstorage',
        })
      );
    }

    if (params.serviceType === 'lke') {
      response.data.push(
        dashboardFactory.build({
          id: 9,
          label: 'LKE Enterprise Dashboard',
          service_type: 'lke',
        })
      );
    }

    return HttpResponse.json(response);
  }),
  http.get(
    '*/monitor/services/:serviceType/metric-definitions',
    ({ params }) => {
      const response = {
        data: [
          {
            available_aggregate_functions: ['min', 'max', 'avg'],
            dimensions: [
              {
                dimension_label: 'cpu',
                label: 'CPU name',
                values: null,
              },
              {
                dimension_label: 'state',
                label: 'State of CPU',
                values: [
                  'user',
                  'system',
                  'idle',
                  'interrupt',
                  'nice',
                  'softirq',
                  'steal',
                  'wait',
                ],
              },
              {
                dimension_label: 'LINODE_ID',
                label: 'Linode ID',
                values: null,
              },
            ],
            label: 'CPU utilization',
            metric: 'system_cpu_utilization_percent',
            metric_type: 'gauge',
            scrape_interval: '2m',
            unit: 'percent',
          },
          {
            available_aggregate_functions: ['min', 'max', 'avg', 'sum'],
            dimensions: [
              {
                dimension_label: 'state',
                label: 'State of memory',
                values: [
                  'used',
                  'free',
                  'buffered',
                  'cached',
                  'slab_reclaimable',
                  'slab_unreclaimable',
                ],
              },
              {
                dimension_label: 'LINODE_ID',
                label: 'Linode ID',
                values: null,
              },
            ],
            label: 'Memory Usage',
            metric: 'system_memory_usage_by_resource',
            metric_type: 'gauge',
            scrape_interval: '30s',
            unit: 'Bps ',
          },
          {
            available_aggregate_functions: ['min', 'max', 'avg', 'sum'],
            dimensions: [
              {
                dimension_label: 'device',
                label: 'Device name',
                values: ['lo', 'eth0'],
              },
              {
                dimension_label: 'direction',
                label: 'Direction of network transfer',
                values: ['transmit', 'receive'],
              },
              {
                dimension_label: 'LINODE_ID',
                label: 'Linode ID',
                values: null,
              },
            ],
            label: 'Network Traffic',
            metric: 'system_network_io_by_resource',
            metric_type: 'counter',
            scrape_interval: '30s',
            unit: 'byte',
          },
          {
            available_aggregate_functions: ['min', 'max', 'avg', 'sum'],
            dimensions: [
              {
                dimension_label: 'device',
                label: 'Device name',
                values: ['loop0', 'sda', 'sdb'],
              },
              {
                dimension_label: 'direction',
                label: 'Operation direction',
                values: ['read', 'write'],
              },
              {
                dimension_label: 'LINODE_ID',
                label: 'Linode ID',
                values: null,
              },
            ],
            label: 'Disk I/O',
            metric: 'system_disk_OPS_total',
            metric_type: 'counter',
            scrape_interval: '30s',
            unit: 'ops_per_second',
          },
          {
            label: 'Network Traffic',
            metric: 'vm_network_bytes_total',
            unit: 'Kbps',
            metric_type: 'gauge',
            scrape_interval: '300s',
            is_alertable: true,
            available_aggregate_functions: ['avg'],
            dimensions: [
              {
                label: 'Traffic Pattern',
                dimension_label: 'pattern',
                values: ['publicin', 'publicout', 'privatein', 'privateout'],
              },
              {
                label: 'Protocol',
                dimension_label: 'protocol',
                values: ['ipv4', 'ipv6'],
              },
            ],
          },
        ],
      };

      const nodebalancerMetricsResponse = {
        data: [
          {
            label: 'Ingress Traffic Rate',
            metric: 'nb_ingress_traffic_rate',
            unit: 'bytes_per_second',
            metric_type: 'gauge',
            scrape_interval: '300s',
            is_alertable: true,
            available_aggregate_functions: ['sum'],
            dimensions: [
              {
                label: 'Port',
                dimension_label: 'port',
                values: null,
              },
              {
                label: 'Protocol',
                dimension_label: 'protocol',
                values: ['TCP', 'UDP'],
              },
              {
                label: 'Configuration',
                dimension_label: 'config_id',
                values: null,
              },
            ],
          },
          {
            label: 'Egress Traffic Rate',
            metric: 'nb_egress_traffic_rate',
            unit: 'bytes_per_second',
            metric_type: 'gauge',
            scrape_interval: '300s',
            is_alertable: true,
            available_aggregate_functions: ['sum'],
            dimensions: [
              {
                label: 'Port',
                dimension_label: 'port',
                values: null,
              },
              {
                label: 'Protocol',
                dimension_label: 'protocol',
                values: ['TCP', 'UDP'],
              },
              {
                label: 'Configuration',
                dimension_label: 'config_id',
                values: null,
              },
            ],
          },
          {
            label: 'Total Active Sessions',
            metric: 'nb_total_active_sessions',
            unit: 'count',
            metric_type: 'gauge',
            scrape_interval: '300s',
            is_alertable: true,
            available_aggregate_functions: ['max', 'min', 'avg', 'sum'],
            dimensions: [
              {
                label: 'Port',
                dimension_label: 'port',
                values: null,
              },
              {
                label: 'Protocol',
                dimension_label: 'protocol',
                values: ['TCP', 'UDP'],
              },
              {
                label: 'Configuration',
                dimension_label: 'config_id',
                values: null,
              },
            ],
          },
          {
            label: 'New Sessions',
            metric: 'nb_new_sessions_per_second',
            unit: 'sessions_per_second',
            metric_type: 'gauge',
            scrape_interval: '300s',
            is_alertable: true,
            available_aggregate_functions: ['sum'],
            dimensions: [
              {
                label: 'Port',
                dimension_label: 'port',
                values: null,
              },
              {
                label: 'Protocol',
                dimension_label: 'protocol',
                values: ['TCP', 'UDP'],
              },
              {
                label: 'Configuration',
                dimension_label: 'config_id',
                values: null,
              },
            ],
          },
          {
            label: 'Total Active Backends',
            metric: 'nb_total_active_backends',
            unit: 'count',
            metric_type: 'gauge',
            scrape_interval: '300s',
            is_alertable: true,
            available_aggregate_functions: ['max', 'min', 'avg', 'sum'],
            dimensions: [
              {
                label: 'Port',
                dimension_label: 'port',
                values: null,
              },
              {
                label: 'Protocol',
                dimension_label: 'protocol',
                values: ['TCP', 'UDP'],
              },
              {
                label: 'Configuration',
                dimension_label: 'config_id',
                values: null,
              },
            ],
          },
        ],
      };
      if (params.serviceType === 'firewall') {
        return HttpResponse.json({ data: firewallMetricDefinitionsResponse });
      }
      if (params.serviceType === 'nodebalancer') {
        return HttpResponse.json(nodebalancerMetricsResponse);
      }
      if (params.serviceType === 'objectstorage') {
        return HttpResponse.json({ data: objectStorageMetricRules });
      }
      if (params.serviceType === 'blockstorage') {
        return HttpResponse.json({ data: blockStorageMetricRules });
      }
      return HttpResponse.json(response);
    }
  ),
  http.post('*/monitor/services/:serviceType/token', () => {
    const response = {
      token: 'eyJhbGciOiAiZGlyIiwgImVuYyI6ICJBMTI4Q0JDLUhTMjU2IiwgImtpZCI6ID',
    };
    return HttpResponse.json(response);
  }),

  http.get('*/monitor/dashboards/:id', ({ params }) => {
    let serviceType: string;
    let dashboardLabel: string;
    let widgets;

    const id = params.id;

    if (id === '1') {
      serviceType = 'dbaas';
      dashboardLabel = 'DBaaS Service I/O Statistics';
      widgets = [
        {
          metric: 'cpu_usage',
          unit: '%',
          label: 'CPU Usage',
          color: 'default',
          size: 12,
          chart_type: 'area',
          y_label: 'cpu_usage',
          group_by: ['entity_id'],
          aggregate_function: 'avg',
        },
        {
          metric: 'memory_usage',
          unit: '%',
          label: 'Memory Usage',
          color: 'default',
          size: 6,
          chart_type: 'area',
          y_label: 'memory_usage',
          group_by: ['entity_id'],
          aggregate_function: 'avg',
        },
      ];
    } else if (id === '3') {
      serviceType = 'nodebalancer';
      dashboardLabel = 'NodeBalancer Service I/O Statistics';
      widgets = [
        {
          metric: 'nb_ingress_traffic_rate',
          unit: 'Bps',
          label: 'Ingress Traffic Rate',
          color: 'default',
          size: 12,
          chart_type: 'line',
          y_label: 'nb_ingress_traffic_rate',
          group_by: ['entity_id'],
          aggregate_function: 'sum',
        },
        {
          metric: 'nb_egress_traffic_rate',
          unit: 'Bps',
          label: 'Egress Traffic Rate',
          color: 'default',
          size: 12,
          chart_type: 'line',
          y_label: 'nb_egress_traffic_rate',
          group_by: ['entity_id'],
          aggregate_function: 'sum',
        },
      ];
    } else if (id === '4') {
      serviceType = 'firewall';
      dashboardLabel = 'Firewall Service I/O Statistics';
      widgets = [
        {
          metric: 'fw_active_connections',
          unit: 'Count',
          label: 'Current Connections',
          color: 'default',
          size: 12,
          chart_type: 'line',
          y_label: 'fw_active_connections',
          group_by: ['entity_id', 'linode_id', 'interface_id'],
          aggregate_function: 'avg',
        },
        {
          metric: 'fw_available_connections',
          unit: 'Count',
          label: 'Available Connections',
          color: 'default',
          size: 12,
          chart_type: 'line',
          y_label: 'fw_available_connections',
          group_by: ['entity_id', 'linode_id', 'interface_id'],
          aggregate_function: 'avg',
        },
      ];
    } else if (id === '6') {
      serviceType = 'objectstorage';
      dashboardLabel = 'Object Storage Service I/O Statistics';
    } else if (id === '7') {
      serviceType = 'blockstorage';
      dashboardLabel = 'Block Storage Dashboard';
    } else if (id === '8') {
      serviceType = 'firewall';
      dashboardLabel = 'Firewall Nodebalancer Dashboard';
      widgets = [
        {
          metric: 'fw_active_connections',
          unit: 'Count',
          label: 'Current Connections',
          color: 'default',
          size: 12,
          chart_type: 'line',
          y_label: 'fw_active_connections',
          group_by: ['entity_id', 'linode_id', 'interface_id'],
          aggregate_function: 'avg',
        },
        {
          metric: 'fw_available_connections',
          unit: 'Count',
          label: 'Available Connections',
          color: 'default',
          size: 12,
          chart_type: 'line',
          y_label: 'fw_available_connections',
          group_by: ['entity_id', 'linode_id', 'interface_id'],
          aggregate_function: 'avg',
        },
      ];
    } else if (id === '9') {
      serviceType = 'lke';
      dashboardLabel = 'Kubernetes Enterprise Dashboard';
    } else {
      serviceType = 'linode';
      dashboardLabel = 'Linode Service I/O Statistics';
      widgets = [
        {
          metric: 'vm_cpu_time_total',
          unit: '%',
          label: 'CPU Usage by Instance',
          color: 'default',
          size: 12,
          chart_type: 'area',
          y_label: 'vm_cpu_time_total',
          group_by: ['entity_id'],
          aggregate_function: 'avg',
        },
        {
          metric: 'vm_local_disk_iops_total',
          unit: 'IOPS',
          label: 'Local Disk I/O by Instance',
          color: 'default',
          size: 12,
          chart_type: 'area',
          y_label: 'vm_local_disk_iops_total',
          group_by: ['entity_id'],
          aggregate_function: 'avg',
        },
        {
          metric: 'vm_network_bytes_total',
          unit: 'Kbps',
          label: 'Network Traffic In by Instance',
          color: 'default',
          size: 12,
          chart_type: 'area',
          y_label: 'vm_network_bytes_total',
          group_by: ['entity_id'],
          aggregate_function: 'avg',
          filters: [
            {
              dimension_label: 'pattern',
              operator: 'in',
              value: 'publicin',
            },
          ],
        },
      ];
    }

    const response = {
      created: '2024-04-29T17:09:29',
      id: Number(params.id),
      label: dashboardLabel,
      service_type: serviceType,
      type: 'standard',
      updated: null,
      widgets: widgets || [
        {
          aggregate_function: 'avg',
          chart_type: 'area',
          color: 'default',
          label: 'CPU utilization',
          metric: 'system_cpu_utilization_percent',
          size: 12,
          unit: '%',
          group_by: ['entity_id'],
          y_label: 'system_cpu_utilization_ratio',
          filters: dimensionFilterFactory.buildList(5, {
            operator: pickRandom(['endswith', 'eq', 'neq', 'startswith']),
          }),
        },
        {
          aggregate_function: 'avg',
          chart_type: 'area',
          color: 'default',
          label: 'Memory Usage',
          metric: 'system_memory_usage_by_resource',
          size: 12,
          unit: 'Bps',
          group_by: ['entity_id'],
          y_label: 'system_memory_usage_bytes',
        },
        {
          aggregate_function: 'avg',
          chart_type: 'area',
          color: 'default',
          label: 'Network Traffic In By The Instance',
          metric: 'system_network_io_by_resource',
          size: 6,
          unit: 'Bytes',
          y_label: 'system_network_io_bytes_total',
          filters: dimensionFilterFactory.buildList(3, {
            operator: pickRandom(['endswith', 'eq', 'neq', 'startswith', 'in']),
          }),
          group_by: ['entity_id'],
        },
        {
          aggregate_function: 'avg',
          chart_type: 'area',
          color: 'default',
          label: 'Disk I/O',
          metric: 'system_disk_OPS_total',
          size: 6,
          unit: 'OPS',
          group_by: ['entity_id'],
          y_label: 'system_disk_operations_total',
        },
      ],
    };
    return HttpResponse.json(response);
  }),
  http.post('*/monitor/services/:serviceType/metrics', () => {
    const response = {
      data: {
        result: [
          {
            metric: {
              entity_id: '123',
              metric_name: 'average_cpu_usage',
              linode_id: '1',
              node_id: 'primary-1',
            },
            values: [
              [1721854379, '0.2744841110560275'],
              [1721857979, '0.2980357104166823'],
              [1721861579, '0.3290476561287732'],
              [1721865179, '0.32148793964961897'],
              [1721868779, '0.3269247326830727'],
              [1721872379, '0.3393055885526987'],
              [1721875979, '0.3237102833940027'],
              [1721879579, '0.3153372503472701'],
              [1721883179, '0.26811506053820466'],
              [1721886779, '0.25839295774934357'],
              [1721890379, '0.26863082415681144'],
              [1721893979, '0.26126998689934394'],
              [1721897579, '0.26164641539434685'],
            ],
          },
          // Uncomment this to add more metrics and see a scrollable legend if legendHeight is set (ex: CloudPulse)
          // ...Array.from({ length: 10 }, (_, i) => ({
          //   metric: {
          //     test: `Test${i + 2}`,
          //   },
          //   values: [
          //     [1721854379, '0.2744841110560275'],
          //     [1721857979, '0.2980357104166823'],
          //     [1721861579, '0.3290476561287732'],
          //     [1721865179, '0.32148793964961897'],
          //     [1721868779, '0.3269247326830727'],
          //     [1721872379, '0.3393055885526987'],
          //     [1721875979, '0.3237102833940027'],
          //     [1721879579, '0.3153372503472701'],
          //     [1721883179, '0.26811506053820466'],
          //     [1721886779, '0.25839295774934357'],
          //     [1721890379, '0.26863082415681144'],
          //     [1721893979, '0.26126998689934394'],
          //     [1721897579, '0.26164641539434685'],
          //   ],
          // })),
          {
            metric: {
              entity_id: '456',
              metric_name: 'average_cpu_usage',
              linode_id: '123',
              node_id: 'primary-2',
            },
            values: [
              [1721854379, '0.3744841110560275'],
              [1721857979, '0.4980357104166823'],
              [1721861579, '0.3290476561287732'],
              [1721865179, '0.42148793964961897'],
              [1721868779, '0.2269247326830727'],
              [1721872379, '0.3393055885526987'],
              [1721875979, '0.5237102833940027'],
              [1721879579, '0.3153372503472701'],
              [1721883179, '0.26811506053820466'],
              [1721886779, '0.35839295774934357'],
              [1721890379, '0.36863082415681144'],
              [1721893979, '0.46126998689934394'],
              [1721897579, '0.56164641539434685'],
            ],
          },
          {
            metric: {
              entity_id: 'obj-bucket-383.ap-west.linodeobjects.com',
              metric_name: 'average_cpu_usage',
            },
            values: [
              [1721854379, '0.3744841110560275'],
              [1721857979, '0.4980357104166823'],
              [1721861579, '0.3290476561287732'],
              [1721865179, '0.4148793964961897'],
              [1721868779, '0.4269247326830727'],
              [1721872379, '0.3393055885526987'],
              [1721875979, '0.6237102833940027'],
              [1721879579, '0.3153372503472701'],
              [1721883179, '0.26811506053820466'],
              [1721886779, '0.45839295774934357'],
              [1721890379, '0.36863082415681144'],
              [1721893979, '0.56126998689934394'],
              [1721897579, '0.66164641539434685'],
            ],
          },
        ],
        resultType: 'matrix',
      },
      isPartial: false,
      stats: {
        executionTimeMsec: 23,
        seriesFetched: '14',
      },
      status: 'success',
    };

    return HttpResponse.json(response);
  }),
  http.get('*/src/routes/*LazyRoutes', ({ request }) => {
    return new Response('export const module = {};', {
      headers: {
        'Content-Type': 'application/javascript',
      },
    });
  }),
  ...entityTransfers,
  ...statusPage,
  ...databases,
  ...vpc,
  ...entities,
  http.get('*/v4beta/maintenance/policies', () => {
    return HttpResponse.json(
      makeResourcePage(maintenancePolicyFactory.buildList(2))
    );
  }),
];
