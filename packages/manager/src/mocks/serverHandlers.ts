import {
  NotificationType,
  SecurityQuestionsPayload,
  TokenRequest,
  VolumeStatus,
} from '@linode/api-v4';
import { DateTime } from 'luxon';
import { rest } from 'msw';

import cachedRegions from 'src/cachedData/regions.json';
import {
  VLANFactory,
  abuseTicketNotificationFactory,
  accountAvailabilityFactory,
  accountBetaFactory,
  accountFactory,
  accountMaintenanceFactory,
  accountTransferFactory,
  appTokenFactory,
  betaFactory,
  certificateFactory,
  configurationFactory,
  contactFactory,
  createRouteFactory,
  createServiceTargetFactory,
  credentialFactory,
  creditPaymentResponseFactory,
  databaseBackupFactory,
  databaseEngineFactory,
  databaseFactory,
  databaseInstanceFactory,
  databaseTypeFactory,
  dedicatedTypeFactory,
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
  kubernetesVersionFactory,
  linodeConfigFactory,
  linodeDiskFactory,
  linodeFactory,
  linodeIPFactory,
  linodeStatsFactory,
  linodeTransferFactory,
  linodeTypeFactory,
  loadbalancerFactory,
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
  nodeBalancerConfigFactory,
  nodeBalancerConfigNodeFactory,
  nodeBalancerFactory,
  nodePoolFactory,
  notificationFactory,
  objectStorageBucketFactory,
  objectStorageClusterFactory,
  objectStorageKeyFactory,
  paymentFactory,
  paymentMethodFactory,
  possibleMySQLReplicationTypes,
  possiblePostgresReplicationTypes,
  proDedicatedTypeFactory,
  profileFactory,
  promoFactory,
  regionAvailabilityFactory,
  routeFactory,
  securityQuestionsFactory,
  serviceTargetFactory,
  stackScriptFactory,
  staticObjects,
  subnetFactory,
  supportReplyFactory,
  supportTicketFactory,
  tagFactory,
  volumeFactory,
  vpcFactory,
} from 'src/factories';
import { accountAgreementsFactory } from 'src/factories/accountAgreements';
import { accountUserFactory } from 'src/factories/accountUsers';
import { grantFactory, grantsFactory } from 'src/factories/grants';
import { pickRandom } from 'src/utilities/random';

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
        class: 'nanode',
        id: 'g6-standard-0',
        label: `Nanode 1 GB`,
        memory: 1024,
      }),
      ...databaseTypeFactory.buildList(7, { class: 'standard' }),
    ];
    const dedicatedTypes = databaseTypeFactory.buildList(7, {
      class: 'dedicated',
    });
    const premiumTypes = databaseTypeFactory.buildList(7, {
      class: 'premium',
    });
    return res(
      ctx.json(
        makeResourcePage([...standardTypes, ...dedicatedTypes, ...premiumTypes])
      )
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
      compression_type: req.params.engine === 'mongodb' ? 'none' : undefined,
      engine: req.params.engine as 'mysql',
      id: Number(req.params.id),
      label: `database-${req.params.id}`,
      replication_commit_type:
        req.params.engine === 'postgresql' ? 'local' : undefined,
      replication_type:
        req.params.engine === 'mysql'
          ? pickRandom(possibleMySQLReplicationTypes)
          : req.params.engine === 'postgresql'
          ? pickRandom(possiblePostgresReplicationTypes)
          : (undefined as any),
      ssl_connection: true,
      storage_engine:
        req.params.engine === 'mongodb' ? 'wiredtiger' : undefined,
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
          password: 'password123',
          username: 'lnroot',
        })
      );
    }
  ),

  rest.get('*/databases/:engine/instances/:databaseId/ssl', (req, res, ctx) => {
    return res(
      ctx.json({
        certificate: 'testcertificate',
        public_key: 'testkey',
      })
    );
  }),

  rest.post('*/databases/:engine/instances', (req, res, ctx) => {
    const payload: any = req.body;
    return res(
      ctx.json({
        ...databaseFactory.build({
          engine: req.params.engine as 'mysql',
          label: payload?.label ?? 'Database',
        }),
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

const aglb = [
  // Configurations
  rest.get('*/v4beta/aglb/:id/configurations', (req, res, ctx) => {
    const configurations = configurationFactory.buildList(3);
    return res(ctx.json(makeResourcePage(configurations)));
  }),
  rest.get('*/v4beta/aglb/:id/configurations/:configId', (req, res, ctx) => {
    return res(ctx.json(configurationFactory.build()));
  }),
  rest.post('*/v4beta/aglb/:id/configurations', (req, res, ctx) => {
    return res(ctx.json(configurationFactory.build()));
  }),
  rest.put('*/v4beta/aglb/:id/configurations/:configId', (req, res, ctx) => {
    const id = Number(req.params.configId);
    const body = req.body as any;
    return res(ctx.json(configurationFactory.build({ id, ...body })));
  }),
  rest.delete('*/v4beta/aglb/:id/configurations/:configId', (req, res, ctx) => {
    return res(ctx.json({}));
  }),
  // Load Balancers
  rest.get('*/v4beta/aglb', (req, res, ctx) => {
    return res(ctx.json(makeResourcePage(loadbalancerFactory.buildList(3))));
  }),
  rest.get('*/v4beta/aglb/:loadbalancerId', (req, res, ctx) => {
    return res(
      ctx.json(
        loadbalancerFactory.build({
          id: Number(req.params.loadbalancerId),
          label: `aglb-${req.params.loadbalancerId}`,
        })
      )
    );
  }),
  rest.post('*/v4beta/aglb', (req, res, ctx) => {
    return res(ctx.json(loadbalancerFactory.build()));
  }),
  rest.put('*/v4beta/aglb/:id', (req, res, ctx) => {
    const id = Number(req.params.id);
    const body = req.body as any;
    // The payload to update a loadbalancer is not the same as the payload to create a loadbalancer
    // In one instance we have a list of entrypoints objects, in the other we have a list of entrypoints ids
    // TODO: AGLB - figure out if this is still accurate
    return res(ctx.json(loadbalancerFactory.build({ id, ...body })));
  }),
  rest.delete('*/v4beta/aglb/:id', (req, res, ctx) => {
    return res(ctx.json({}));
  }),
  // Routes
  rest.get('*/v4beta/aglb/:id/routes', (req, res, ctx) => {
    const headers = JSON.parse(req.headers.get('x-filter') || '{}');
    if (headers['+or']) {
      return res(
        ctx.json(
          makeResourcePage(routeFactory.buildList(headers['+or'].length))
        )
      );
    }
    return res(ctx.json(makeResourcePage(routeFactory.buildList(5))));
  }),
  rest.post('*/v4beta/aglb/:id/routes', (req, res, ctx) => {
    return res(ctx.json(createRouteFactory.buildList(4)));
  }),
  rest.put('*/v4beta/aglb/:id/routes/:routeId', (req, res, ctx) => {
    const id = Number(req.params.routeId);
    const body = req.body as any;
    return res(
      ctx.delay(1000),
      ctx.json(createRouteFactory.build({ id, ...body }))
    );
  }),
  rest.delete('*/v4beta/aglb/:id/routes/:routeId', (req, res, ctx) => {
    return res(ctx.json({}));
  }),
  // Service Targets
  rest.get('*/v4beta/aglb/:id/service-targets', (req, res, ctx) => {
    return res(ctx.json(makeResourcePage(serviceTargetFactory.buildList(5))));
  }),
  rest.post('*/v4beta/aglb/:id/service-targets', (req, res, ctx) => {
    return res(ctx.json(createServiceTargetFactory.build()));
  }),
  rest.put(
    '*/v4beta/aglb/:id/service-targets/:serviceTargetId',
    (req, res, ctx) => {
      const id = Number(req.params.serviceTargetId);
      const body = req.body as any;
      return res(ctx.json(createServiceTargetFactory.build({ id, ...body })));
    }
  ),
  rest.delete(
    '*/v4beta/aglb/:id/service-targets/:serviceTargetId',
    (req, res, ctx) => {
      return res(ctx.json({}));
    }
  ),
  // Certificates
  rest.get('*/v4beta/aglb/:id/certificates', (req, res, ctx) => {
    const tlsCertificate = certificateFactory.build({
      label: 'tls-certificate',
      type: 'downstream',
    });
    const certificates = certificateFactory.buildList(3);
    return res(ctx.json(makeResourcePage([tlsCertificate, ...certificates])));
  }),
  rest.get('*/v4beta/aglb/:id/certificates/:certId', (req, res, ctx) => {
    const id = Number(req.params.certId);
    const body = req.body as any;
    return res(ctx.json(certificateFactory.build({ id, ...body })));
  }),
  rest.post('*/v4beta/aglb/:id/certificates', (req, res, ctx) => {
    return res(ctx.json(certificateFactory.build()));
  }),
  rest.put('*/v4beta/aglb/:id/certificates/:certId', (req, res, ctx) => {
    const id = Number(req.params.certId);
    const body = req.body as any;
    return res(ctx.json(certificateFactory.build({ id, ...body })));
  }),
  rest.delete('*/v4beta/aglb/:id/certificates/:certId', (req, res, ctx) => {
    return res(ctx.json({}));
  }),
];

const vpc = [
  rest.get('*/v4beta/vpcs', (req, res, ctx) => {
    const vpcsWithSubnet1 = vpcFactory.buildList(5, {
      subnets: subnetFactory.buildList(Math.floor(Math.random() * 10) + 1),
    });
    const vpcsWithSubnet2 = vpcFactory.buildList(5, {
      region: 'eu-west',
      subnets: subnetFactory.buildList(Math.floor(Math.random() * 20) + 1),
    });
    const vpcsWithoutSubnet = vpcFactory.buildList(20);
    return res(
      ctx.json(
        makeResourcePage([
          ...vpcsWithSubnet1,
          ...vpcsWithSubnet2,
          ...vpcsWithoutSubnet,
        ])
      )
    );
  }),
  rest.get('*/v4beta/vpcs/:vpcId', (req, res, ctx) => {
    return res(
      ctx.json(
        vpcFactory.build({
          description: `VPC for webserver and database. VPC for webserver and database. VPC for webserver and database. VPC for webserver and database. VPC for webserver VPC for webserver VPC for webserver VPC for webserver VPC for webserver.VPC for webserver and database!!! VPC`,
          subnets: subnetFactory.buildList(Math.floor(Math.random() * 10) + 1),
        })
      )
    );
  }),
  rest.get('*/v4beta/vpcs/:vpcId/subnets', (req, res, ctx) => {
    return res(ctx.json(makeResourcePage(subnetFactory.buildList(30))));
  }),
  rest.delete('*/v4beta/vpcs/:vpcId/subnets/:subnetId', (req, res, ctx) => {
    return res(ctx.json({}));
  }),
  rest.delete('*/v4beta/vpcs/:vpcId', (req, res, ctx) => {
    return res(ctx.json({}));
  }),
  rest.put('*/v4beta/vpcs/:vpcId', (req, res, ctx) => {
    return res(ctx.json(vpcFactory.build({ description: 'testing' })));
  }),
  rest.get('*/v4beta/vpcs/:vpcID', (req, res, ctx) => {
    const id = Number(req.params.id);
    return res(ctx.json(vpcFactory.build({ id })));
  }),
  rest.post('*/v4beta/vpcs', (req, res, ctx) => {
    const vpc = vpcFactory.build({ ...(req.body as any) });
    return res(ctx.json(vpc));
  }),
  rest.post('*/v4beta/vpcs/:vpcId/subnets', (req, res, ctx) => {
    const subnet = subnetFactory.build({ ...(req.body as any) });
    return res(ctx.json(subnet));
  }),
];

const nanodeType = linodeTypeFactory.build({ id: 'g6-nanode-1' });
const standardTypes = linodeTypeFactory.buildList(7);
const dedicatedTypes = dedicatedTypeFactory.buildList(7);
const proDedicatedType = proDedicatedTypeFactory.build();

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
    return res(
      // Parent/Child: switch out the return statement if you want to mock a restricted parent user with access to child accounts.
      // ctx.json(grantsFactory.build({ global: { child_account_access: true } }))
      ctx.json(grantsFactory.build())
    );
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
    return res(ctx.json(cachedRegions));
  }),
  rest.get('*/images', async (req, res, ctx) => {
    const privateImages = imageFactory.buildList(5, {
      status: 'available',
      type: 'manual',
    });
    const cloudinitCompatableDistro = imageFactory.build({
      capabilities: ['cloud-init'],
      id: 'metadata-test-distro',
      is_public: true,
      label: 'metadata-test-distro',
      status: 'available',
      type: 'manual',
    });
    const cloudinitCompatableImage = imageFactory.build({
      capabilities: ['cloud-init'],
      id: 'metadata-test-image',
      label: 'metadata-test-image',
      status: 'available',
      type: 'manual',
    });
    const creatingImages = imageFactory.buildList(2, {
      status: 'creating',
      type: 'manual',
    });
    const pendingImages = imageFactory.buildList(5, {
      status: 'pending_upload',
      type: 'manual',
    });
    const automaticImages = imageFactory.buildList(5, {
      expiry: '2021-05-01',
      type: 'automatic',
    });
    const publicImages = imageFactory.buildList(4, { is_public: true });
    const images = [
      cloudinitCompatableDistro,
      cloudinitCompatableImage,
      ...automaticImages,
      ...privateImages,
      ...publicImages,
      ...pendingImages,
      ...creatingImages,
    ];
    return res(ctx.json(makeResourcePage(images)));
  }),
  rest.get('*/linode/types', (req, res, ctx) => {
    return res(
      ctx.json(
        makeResourcePage([
          nanodeType,
          ...standardTypes,
          ...dedicatedTypes,
          proDedicatedType,
        ])
      )
    );
  }),
  rest.get('*/linode/types-legacy', (req, res, ctx) => {
    return res(ctx.json(makeResourcePage(linodeTypeFactory.buildList(0))));
  }),
  ...[nanodeType, ...standardTypes, ...dedicatedTypes, proDedicatedType].map(
    (type) =>
      rest.get(`*/linode/types/${type.id}`, (req, res, ctx) => {
        return res(ctx.json(type));
      })
  ),
  rest.get('*/linode/instances', async (req, res, ctx) => {
    linodeFactory.resetSequenceNumber();
    const metadataLinodeWithCompatibleImage = linodeFactory.build({
      image: 'metadata-test-image',
      label: 'metadata-test-image',
    });
    const metadataLinodeWithCompatibleImageAndRegion = linodeFactory.build({
      image: 'metadata-test-image',
      label: 'metadata-test-region',
      region: 'eu-west',
    });
    const onlineLinodes = linodeFactory.buildList(40, {
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
    const linodes = [
      metadataLinodeWithCompatibleImage,
      metadataLinodeWithCompatibleImageAndRegion,
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
        label: 'bare-metal',
        type: 'g1-metal-c2',
      }),
      linodeFactory.build({
        backups: { enabled: false },
        label: 'shadow-plan-with-tags',
        tags: ['test1', 'test2', 'test3'],
        type: 'g5-standard-20-s1',
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
    ];
    return res(ctx.json(makeResourcePage(linodes)));
  }),
  rest.get('*/linode/instances/:id', async (req, res, ctx) => {
    const id = Number(req.params.id);
    return res(
      ctx.json(
        linodeFactory.build({
          backups: { enabled: false },
          id,
          label: 'DC-Specific Pricing Linode',
          region: 'id-cgk',
        })
      )
    );
  }),
  rest.get('*/linode/instances/:id/firewalls', async (req, res, ctx) => {
    const firewalls = firewallFactory.buildList(10);
    firewallFactory.resetSequenceNumber();
    return res(ctx.json(makeResourcePage(firewalls)));
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
  rest.put('*/instances/*/disks/:id', async (req, res, ctx) => {
    const id = Number(req.params.id);
    const disk = linodeDiskFactory.build({ id });
    // If you want to mock an error
    // return res(ctx.status(400), ctx.json({ errors: [{ field: 'label', reason: 'OMG!' }] }));
    return res(ctx.json(disk));
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
  rest.post('*/linode/instances', async (req, res, ctx) => {
    const payload = req.body as any;
    const linode = linodeFactory.build({
      image: payload?.image ?? 'linode/debian-10',
      label: payload?.label ?? 'new-linode',
      region: payload?.region ?? 'us-east',
      type: payload?.type ?? 'g6-standard-1',
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
  rest.get('*/lke/versions', async (req, res, ctx) => {
    const versions = kubernetesVersionFactory.buildList(1);
    return res(ctx.json(makeResourcePage(versions)));
  }),
  rest.get('*/lke/clusters/:clusterId', async (req, res, ctx) => {
    const id = Number(req.params.clusterId);
    const cluster = kubernetesAPIResponse.build({ id, k8s_version: '1.16' });
    return res(ctx.json(cluster));
  }),
  rest.put('*/lke/clusters/:clusterId', async (req, res, ctx) => {
    const id = Number(req.params.clusterId);
    const k8s_version = req.params.k8s_version as string;
    const cluster = kubernetesAPIResponse.build({
      id,
      k8s_version,
    });
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
  rest.get('*/v4beta/networking/firewalls', (req, res, ctx) => {
    const firewalls = firewallFactory.buildList(10);
    firewallFactory.resetSequenceNumber();
    return res(ctx.json(makeResourcePage(firewalls)));
  }),
  rest.get('*/v4beta/networking/firewalls/*/devices', (req, res, ctx) => {
    const devices = firewallDeviceFactory.buildList(10);
    return res(ctx.json(makeResourcePage(devices)));
  }),
  rest.get('*/v4beta/networking/firewalls/:firewallId', (req, res, ctx) => {
    const firewall = firewallFactory.build();
    return res(ctx.json(firewall));
  }),
  rest.put('*/v4beta/networking/firewalls/:firewallId', (req, res, ctx) => {
    const firewall = firewallFactory.build({
      status: req.body?.['status'] ?? 'disabled',
    });
    return res(ctx.json(firewall));
  }),
  // rest.post('*/account/agreements', (req, res, ctx) => {
  //   return res(ctx.status(500), ctx.json({ reason: 'Unknown error' }));
  // }),
  rest.post('*/v4beta/networking/firewalls', (req, res, ctx) => {
    const payload = req.body as any;
    const newFirewall = firewallFactory.build({
      label: payload.label ?? 'mock-firewall',
    });
    return res(ctx.json(newFirewall));
  }),
  rest.get('*/v4/nodebalancers', (req, res, ctx) => {
    const nodeBalancers = nodeBalancerFactory.buildList(1);
    return res(ctx.json(makeResourcePage(nodeBalancers)));
  }),
  rest.get('*/v4/nodebalancers/:nodeBalancerID', (req, res, ctx) => {
    const nodeBalancer = nodeBalancerFactory.build({
      id: Number(req.params.nodeBalancerID),
    });
    return res(ctx.json(nodeBalancer));
  }),
  rest.get('*/nodebalancers/:nodeBalancerID/configs', (req, res, ctx) => {
    const configs = nodeBalancerConfigFactory.buildList(2, {
      nodebalancer_id: Number(req.params.nodeBalancerID),
    });
    return res(ctx.json(makeResourcePage(configs)));
  }),
  rest.get(
    '*/nodebalancers/:nodeBalancerID/configs/:configID/nodes',
    (req, res, ctx) => {
      const configs = [
        nodeBalancerConfigNodeFactory.build({ status: 'UP' }),
        nodeBalancerConfigNodeFactory.build({ status: 'DOWN' }),
        nodeBalancerConfigNodeFactory.build({ status: 'unknown' }),
      ];
      return res(ctx.json(makeResourcePage(configs)));
    }
  ),
  rest.get('*object-storage/buckets/*/*/ssl', async (req, res, ctx) => {
    await sleep(2000);
    return res(ctx.json({ ssl: false }));
  }),
  rest.post('*object-storage/buckets/*/*/ssl', async (req, res, ctx) => {
    await sleep(2000);
    return res(ctx.json({ ssl: true }));
  }),
  rest.delete('*object-storage/buckets/*/*/ssl', async (req, res, ctx) => {
    await sleep(2000);
    return res(ctx.json({}));
  }),
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

    const buckets = objectStorageBucketFactory.buildList(1);

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
  rest.post('*/object-storage/buckets', (req, res, ctx) => {
    return res(ctx.json(objectStorageBucketFactory.build()));
  }),
  rest.get('*object-storage/clusters', (req, res, ctx) => {
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
    return res(
      ctx.json(
        makeResourcePage([
          jakartaCluster,
          saoPauloCluster,
          basePricingCluster,
          ...clusters,
        ])
      )
    );
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
        linodes: 8,
        volumes: 953,
      })
    );
  }),
  rest.get('*/volumes', (req, res, ctx) => {
    const statuses: VolumeStatus[] = [
      'active',
      'creating',
      'migrating',
      'offline',
      'resizing',
    ];
    const volumes = statuses.map((status) => volumeFactory.build({ status }));
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
  rest.get('*invoices/555/items', (req, res, ctx) => {
    return res(
      ctx.json(
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
      )
    );
  }),
  rest.get('*invoices/:invoiceId/items', (req, res, ctx) => {
    const items = invoiceItemFactory.buildList(10);
    return res(ctx.json(makeResourcePage(items, { page: 1, pages: 4 })));
  }),
  rest.get('*/account', (req, res, ctx) => {
    const account = accountFactory.build({
      active_promotions: promoFactory.buildList(1),
      active_since: '2022-11-30',
      balance: 50,
    });
    return res(ctx.json(account));
  }),
  rest.get('*/account/availability', (req, res, ctx) => {
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
    return res(
      ctx.json(makeResourcePage([atlanta, newarkStorage, singapore, tokyo]))
    );
  }),
  rest.get('*/account/availability/:regionId', (req, res, ctx) => {
    return res(ctx.json(accountAvailabilityFactory.build()));
  }),
  rest.put('*/account', (req, res, ctx) => {
    return res(ctx.json({ ...accountFactory.build(), ...(req.body as any) }));
  }),
  rest.get('*/account/transfer', (req, res, ctx) => {
    const transfer = accountTransferFactory.build();
    return res(ctx.delay(5000), ctx.json(transfer));
  }),
  rest.get('*/account/payments', (req, res, ctx) => {
    const paymentWithLargeId = paymentFactory.build({
      id: 123_456_789_123_456,
    });
    const payments = paymentFactory.buildList(5);
    return res(ctx.json(makeResourcePage([paymentWithLargeId, ...payments])));
  }),
  rest.get('*/account/invoices', (req, res, ctx) => {
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
    return res(
      ctx.json(
        makeResourcePage([linodeInvoice, akamaiInvoice, invoiceWithLargerId])
      )
    );
  }),
  rest.get('*/account/invoices/:invoiceId', (req, res, ctx) => {
    const linodeInvoice = invoiceFactory.build({
      date: '2022-12-01T18:04:01',
      id: 1234,
      label: 'LinodeInvoice',
    });
    return res(ctx.json(linodeInvoice));
  }),
  rest.get('*/account/maintenance', (req, res, ctx) => {
    accountMaintenanceFactory.resetSequenceNumber();
    const page = Number(req.url.searchParams.get('page') || 1);
    const pageSize = Number(req.url.searchParams.get('page_size') || 25);
    const headers = JSON.parse(req.headers.get('x-filter') || '{}');

    const accountMaintenance =
      headers.status === 'completed'
        ? accountMaintenanceFactory.buildList(30, { status: 'completed' })
        : [
            ...accountMaintenanceFactory.buildList(90, { status: 'pending' }),
            ...accountMaintenanceFactory.buildList(3, { status: 'started' }),
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
  rest.get('*/account/child-accounts', (req, res, ctx) => {
    const childAccounts = [
      accountFactory.build({
        company: 'Child Company 0',
        euuid: '0',
      }),
      accountFactory.build({
        company: 'Child Company 1',
        euuid: '1',
      }),
      accountFactory.build({
        company: 'Child Company 2',
        euuid: '2',
      }),
    ];
    return res(ctx.json(makeResourcePage(childAccounts)));
  }),
  rest.get('*/account/child-accounts/:euuid', (req, res, ctx) => {
    const childAccount = accountFactory.build({
      company: 'Child Company 1',
      euuid: '1',
    });
    return res(ctx.json(childAccount));
  }),
  rest.post('*/account/child-accounts/:euuid/token', (req, res, ctx) => {
    // Proxy tokens expire in 15 minutes.
    const now = new Date();
    const expiry = new Date(now.setMinutes(now.getMinutes() + 15));

    const proxyToken = appTokenFactory.build({
      expiry: expiry.toISOString(),
      token: `Bearer ${import.meta.env.REACT_APP_PROXY_PAT}`,
    });
    return res(ctx.json(proxyToken));
  }),
  rest.get('*/account/users', (req, res, ctx) => {
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
    ];
    return res(ctx.json(makeResourcePage(accountUsers)));
  }),
  rest.get(`*/account/users/${childAccountUser.username}`, (req, res, ctx) => {
    return res(ctx.json(childAccountUser));
  }),
  rest.get(`*/account/users/${proxyAccountUser.username}`, (req, res, ctx) => {
    return res(ctx.json(proxyAccountUser));
  }),
  rest.get(`*/account/users/${parentAccountUser.username}`, (req, res, ctx) => {
    return res(ctx.json(parentAccountUser));
  }),
  rest.get('*/account/users/:user', (req, res, ctx) => {
    // Parent/Child: switch the `user_type` depending on what account view you need to mock.
    return res(ctx.json(accountUserFactory.build({ user_type: 'parent' })));
  }),
  rest.get(
    `*/account/users/${childAccountUser.username}/grants`,
    (req, res, ctx) => {
      return res(
        ctx.json(
          grantsFactory.build({
            global: {
              cancel_account: false,
            },
          })
        )
      );
    }
  ),
  rest.get(
    `*/account/users/${proxyAccountUser.username}/grants`,
    (req, res, ctx) => {
      return res(
        ctx.json(
          grantsFactory.build({
            global: {
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
        )
      );
    }
  ),
  rest.get(
    `*/account/users/${parentAccountUser.username}/grants`,
    (req, res, ctx) => {
      return res(
        ctx.json(
          grantsFactory.build({
            global: {
              cancel_account: false,
              child_account_access: true,
            },
          })
        )
      );
    }
  ),
  rest.get('*/account/users/:user/grants', (req, res, ctx) => {
    return res(
      ctx.json(
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
      data: {
        email: 'test@example.com',
        paypal_id: '6781945682',
      },
      type: 'paypal',
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
      entity: { id: 999, label: 'linode-1', type: 'linode' },
      message:
        'Rebooting this thing and showing an extremely long event message for no discernible reason other than the fairly obvious reason that we want to do some testing of whether or not these messages wrap.',
      percent_complete: 15,
    });
    const dbEvents = eventFactory.buildList(1, {
      action: 'database_low_disk_space',
      entity: { id: 999, label: 'database-1', type: 'database' },
      message: 'Low disk space.',
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
    return res.once(
      ctx.json(
        makeResourcePage([
          ...events,
          ...dbEvents,
          ...oldEvents,
          eventWithSpecialCharacters,
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
      closed: new Date().toISOString(),
      id: 999,
    });
    return res(ctx.json(ticket));
  }),
  rest.get('*/support/tickets/:ticketId', (req, res, ctx) => {
    const ticket = supportTicketFactory.build({
      id: Number(req.params.ticketId),
    });
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
    return res(ctx.json(req.body as any));
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
      created: DateTime.now().minus({ days: 2 }).toISO(),
      entity: { id: 1 },
      services: [998],
    });
    const closedIssue = managedIssueFactory.build({
      created: DateTime.now().minus({ days: 2 }).toISO(),
      entity: { id: 999 },
      services: [999],
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
      // eslint-disable-next-line xss/no-mixed-html
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

    const emailBounce = notificationFactory.build({
      body: null,
      entity: null,
      label: 'We are unable to send emails to your billing email address!',
      message: 'We are unable to send emails to your billing email address!',
      severity: 'major',
      type: 'billing_email_bounce',
      until: null,
      when: null,
    });

    const abuseTicket = abuseTicketNotificationFactory.build();

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

    const blockStorageMigrationScheduledNotification = notificationFactory.build(
      {
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
      }
    );

    const blockStorageMigrationScheduledNotificationUnattached = notificationFactory.build(
      {
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
      }
    );

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
  rest.get('*/profile/tokens', (req, res, ctx) => {
    return res(ctx.json(makeResourcePage(appTokenFactory.buildList(30))));
  }),
  rest.post('*/profile/tokens', (req, res, ctx) => {
    const data = req.body as TokenRequest;
    return res(ctx.json(appTokenFactory.build(data)));
  }),
  rest.put('*/profile/tokens/:id', (req, res, ctx) => {
    const data = req.body as Partial<TokenRequest>;
    return res(
      ctx.json(appTokenFactory.build({ id: Number(req.params.id), ...data }))
    );
  }),
  rest.delete('*/profile/tokens/:id', (req, res, ctx) => {
    return res(ctx.json({}));
  }),
  rest.get('*/account/betas', (_req, res, ctx) => {
    return res(
      ctx.json(
        makeResourcePage([
          ...accountBetaFactory.buildList(5),
          accountBetaFactory.build({
            ended: DateTime.now().minus({ days: 5 }).toISO(),
            enrolled: DateTime.now().minus({ days: 20 }).toISO(),
            started: DateTime.now().minus({ days: 30 }).toISO(),
          }),
        ])
      )
    );
  }),
  rest.get('*/account/betas/:id', (req, res, ctx) => {
    if (req.params.id !== 'undefined') {
      return res(
        ctx.json(accountBetaFactory.build({ id: req.params.id as string }))
      );
    }
    return res(ctx.status(404));
  }),
  rest.post('*/account/betas', (_req, res, ctx) => {
    return res(ctx.json({}));
  }),
  rest.get('*/betas/:id', (req, res, ctx) => {
    if (req.params.id !== 'undefined') {
      return res(ctx.json(betaFactory.build({ id: req.params.id as string })));
    }
    return res(ctx.status(404));
  }),
  rest.get('*/betas', (_req, res, ctx) => {
    return res(ctx.json(makeResourcePage(betaFactory.buildList(5))));
  }),
  rest.get('*regions/availability', (_req, res, ctx) => {
    return res(
      ctx.json(makeResourcePage(regionAvailabilityFactory.buildList(10)))
    );
  }),
  rest.get('*regions/:regionId/availability', (_req, res, ctx) => {
    return res(
      ctx.json(regionAvailabilityFactory.buildList(5, { region: 'us-east' }))
    );
  }),
  ...entityTransfers,
  ...statusPage,
  ...databases,
  ...aglb,
  ...vpc,
];
