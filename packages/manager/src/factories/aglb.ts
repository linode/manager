import * as Factory from 'factory.ts';
import {
  CreateEntrypointPayload,
  CreateLoadbalancerPayload,
  Entrypoint,
  EntrypointPayload,
  Loadbalancer,
  Route2,
  RoutePayload2,
  ServiceTarget,
  ServiceTargetPayload,
  UpdateLoadbalancerPayload,
} from '@linode/api-v4/lib/aglb/types';

// ********************
// Entrypoint endpoints
// ********************

/**
 * GET /v4/aglb/entrypoints
 */
export const getEntrypointsFactory = Factory.Sync.makeFactory<Entrypoint[]>([
  {
    id: 1,
    label: 'entrypoint1',
    port: 80,
    protocol: 'HTTP',
    certificate_table: [
      {
        sni_hostname: 'example.com',
        certificate_id: 'cert-12345',
      },
    ],
    routes: ['images-route'],
  },
  {
    id: 1,
    label: 'entrypoint2',
    port: 80,
    protocol: 'TCP',
    certificate_table: [
      {
        sni_hostname: 'anotherexample.com',
        certificate_id: 'cert-12345',
      },
    ],
    routes: ['images-route'],
  },
]);

/**
 * GET /v4/aglb/entrypoints/{entrypointId}
 */
export const getEntrypointFactory = Factory.Sync.makeFactory<Entrypoint>({
  id: Factory.each((i) => i),
  label: Factory.each((i) => `entrypoint${i}`),
  port: 80,
  protocol: 'HTTP',
  certificate_table: [
    {
      sni_hostname: 'example.com',
      certificate_id: 'cert-12345',
    },
  ],
  routes: ['images-route'],
});

/**
 * POST /v4/aglb/entrypoints
 */
export const createEntrypointFactory = Factory.Sync.makeFactory<CreateEntrypointPayload>(
  {
    label: Factory.each((i) => `entrypoint${i}`),
    port: 80,
    protocol: 'HTTP',
    certificate_table: [
      {
        sni_hostname: 'example.com',
        certificate_id: 'cert-12345',
      },
    ],
  }
);

/**
 * PUT /v4/aglb/entrypoints/{entrypointId}
 */
export const updateEntrypointFactory = Factory.Sync.makeFactory<EntrypointPayload>(
  {
    label: Factory.each((i) => `entrypoint${i}`),
    port: 80,
    protocol: 'TCP',
    certificate_table: [
      {
        sni_hostname: 'updatedexample.com',
        certificate_id: 'cert-12345',
      },
    ],
    routes: [1],
  }
);

/**
 * DELETE /v4/aglb/entrypoints/{entrypointId}
 */
export const deleteEntrypointFactory = Factory.Sync.makeFactory<{}>({});

// ***********************
// Loadbalancers endpoints
// ***********************

/**
 * GET /v4/aglb/loadbalancers
 */
export const getLoadbalancersFactory = Factory.Sync.makeFactory<Loadbalancer[]>(
  [
    {
      id: 1,
      tags: ['tag1', 'tag2'],
      label: 'loadbalancer1',
      regions: ['us-west'],
      entrypoints: ['entrypoint1'],
    },
    {
      id: 1,
      tags: ['tag1', 'tag3'],
      label: 'loadbalancer2',
      regions: ['us-east'],
      entrypoints: ['entrypoint2'],
    },
  ]
);

/**
 * GET /v4/aglb/loadbalancers/{load-balancer-id}
 */
export const getLoadbalancerFactory = Factory.Sync.makeFactory<Loadbalancer>({
  id: 1,
  tags: ['tag1', 'tag2'],
  label: 'loadbalancer1',
  regions: ['us-west'],
  entrypoints: ['entrypoint1'],
});

/**
 * POST /v4/aglb/loadbalancers
 */
export const createLoadbalancerFactory = Factory.Sync.makeFactory<CreateLoadbalancerPayload>(
  {
    label: Factory.each((i) => `loadbalancer${i}`),
    regions: ['us-west'],
    tags: ['tag1', 'tag2'],
  }
);

/**
 * POST /v4/aglb/loadbalancers with all children
 */
export const createLoadbalancerWithAllChildrenFactory = Factory.Sync.makeFactory<CreateLoadbalancerPayload>(
  {
    label: Factory.each((i) => `loadbalancer${i}`),
    regions: ['us-west'],
    entrypoints: [
      {
        label: 'myentrypoint1',
        port: 80,
        protocol: 'HTTP',
        certificate_table: [
          {
            sni_hostname: 'example.com',
            certificate_id: 'cert-12345',
          },
        ],
        routes: [
          {
            label: 'my-route',
            rules: [
              {
                match_condition: {
                  host: 'example.com',
                  path: '/images',
                },
                service_targets: [
                  {
                    label: 'my-service-target',
                    endpoints: [
                      {
                        ip: '192.168.0.100',
                        port: 8080,
                        capacity: 100,
                        hard_rate_limit: 1000,
                      },
                    ],
                    ca_certificate: 'my-cms-certificate',
                    load_balancing_policy: 'ROUND_ROBIN',
                    health_check_interval: 10,
                    health_check_timeout: 5,
                    health_check_unhealthy_thresh: 3,
                    health_check_healthy_thresh: 2,
                    health_check_path: '/health',
                    health_check_host: 'example.com',
                  },
                ],
              },
            ],
            default_target: {
              label: 'my-default-service-target',
              endpoints: [
                {
                  ip: '192.168.0.101',
                  port: 8080,
                  capacity: 100,
                  hard_rate_limit: 1000,
                },
              ],
              ca_certificate: 'my-cms-certificate',
              load_balancing_policy: 'ROUND_ROBIN',
              health_check_interval: 10,
              health_check_timeout: 5,
              health_check_unhealthy_thresh: 3,
              health_check_healthy_thresh: 2,
              health_check_path: '/health',
              health_check_host: 'example.com',
            },
          },
        ],
      },
    ],
  }
);

/**
 * PUT /v4/aglb/loadbalancers/{load-balancer-id}
 */
export const updateLoadbalancerFactory = Factory.Sync.makeFactory<UpdateLoadbalancerPayload>(
  {
    label: Factory.each((i) => `loadbalancer${i}`),
    regions: ['us-west'],
    entrypoints: [1],
  }
);

/**
 * DELETE /v4/aglb/loadbalancers/{load-balancer-id}
 */
export const deleteLoadbalancerFactory = Factory.Sync.makeFactory<{}>({});

// ****************
// Routes endpoints
// ****************

/**
 * GET /v4/aglb/routes
 */
export const getRoutesFactory = Factory.Sync.makeFactory<Route2[]>([
  {
    id: 1,
    label: 'images-route',
    rules: [
      {
        match_condition: {
          host: 'www.acme.com',
          path: '/images/*',
        },
        service_targets: [
          {
            service_target_name: 'images-backend-aws',
            service_target_percentage: 70,
          },
          {
            service_target_name: 'images-backend-linode',
            service_target_percentage: 30,
          },
        ],
      },
    ],
  },
  {
    id: 2,
    label: 'foo-route',
    rules: [
      {
        match_condition: {
          host: 'www.acme.com',
          path: '/foo/*',
        },
        service_targets: [
          {
            service_target_name: 'foo-backend-aws',
            service_target_percentage: 50,
          },
          {
            service_target_name: 'foo-backend-linode',
            service_target_percentage: 50,
          },
        ],
      },
    ],
  },
]);

/**
 * POST /v4/aglb/routes
 */
export const createRouteFactory = Factory.Sync.makeFactory<RoutePayload2>({
  label: 'images-route',
  rules: [
    {
      match_condition: {
        host: 'www.acme.com',
        path: '/images/*',
      },
      service_targets: [
        {
          service_target_name: 'images-backend-aws',
          service_target_percentage: 70,
        },
        {
          service_target_name: 'images-backend-linode',
          service_target_percentage: 30,
        },
      ],
    },
  ],
});

/**
 * PUT /v4/aglb/routes/{route-id}
 */
export const updateRouteFactory = Factory.Sync.makeFactory<RoutePayload2>({
  label: 'images-route',
  rules: [
    {
      match_condition: {
        host: 'www.anotherdomain.com',
        path: '/anotherpath/',
      },
      service_targets: [
        {
          service_target_name: 'images-backend-aws',
          service_target_percentage: 50,
        },
        {
          service_target_name: 'images-backend-linode',
          service_target_percentage: 50,
        },
      ],
    },
  ],
});

/**
 * DELETE /v4/aglb/routes/{route-id}
 */
export const deleteRouteFactory = Factory.Sync.makeFactory<{}>({});

// *************************
// Service Targets endpoints
// *************************

/**
 * GET /v4/aglb/service-targets
 */
export const getServiceTargetsFactory = Factory.Sync.makeFactory<
  ServiceTarget[]
>([
  {
    id: 1,
    label: 'images-backend-aws',
    endpoints: [
      {
        ip: '192.168.0.100',
        port: 8080,
        capacity: 100,
        hard_rate_limit: 1000,
      },
    ],
    ca_certificate: 'my-cms-certificate',
    load_balancing_policy: 'ROUND_ROBIN',
    health_check_interval: 10,
    health_check_timeout: 5,
    health_check_unhealthy_thresh: 3,
    health_check_healthy_thresh: 2,
    health_check_path: '/health',
    health_check_host: 'example1.com',
  },
  {
    id: 2,
    label: 'images-backend-linode',
    endpoints: [
      {
        ip: '192.168.0.200',
        port: 8080,
        capacity: 50,
        hard_rate_limit: 2000,
      },
    ],
    ca_certificate: 'my-cms-certificate',
    load_balancing_policy: 'ROUND_ROBIN',
    health_check_interval: 10,
    health_check_timeout: 5,
    health_check_unhealthy_thresh: 3,
    health_check_healthy_thresh: 2,
    health_check_path: '/health',
    health_check_host: 'example2.com',
  },
]);

/**
 * POST /v4/aglb/service-targets
 */
export const createServiceTargetFactory = Factory.Sync.makeFactory<ServiceTargetPayload>(
  {
    label: 'images-backend-aws',
    endpoints: [
      {
        ip: '192.168.0.100',
        port: 8080,
        capacity: 100,
        hard_rate_limit: 1000,
      },
    ],
    ca_certificate: 'my-cms-certificate',
    load_balancing_policy: 'ROUND_ROBIN',
    health_check_interval: 10,
    health_check_timeout: 5,
    health_check_unhealthy_thresh: 3,
    health_check_healthy_thresh: 2,
    health_check_path: '/health',
    health_check_host: 'example1.com',
  }
);

/**
 * PUT /v4/aglb/service-targets/{service-target-id}
 */
export const updateServiceTargetFactory = Factory.Sync.makeFactory<ServiceTargetPayload>(
  {
    label: 'images-backend-aws',
    endpoints: [
      {
        ip: '192.168.0.200',
        port: 6060,
        capacity: 100,
        hard_rate_limit: 1000,
      },
    ],
    ca_certificate: 'another-certificate',
    load_balancing_policy: 'ROUND_ROBIN',
    health_check_interval: 10,
    health_check_timeout: 5,
    health_check_unhealthy_thresh: 3,
    health_check_healthy_thresh: 2,
    health_check_path: '/health',
    health_check_host: 'anotherexample1.com',
  }
);

/**
 * DELETE /v4/aglb/service-targets/{service-target-id}
 */
export const deleteServiceTargetFactory = Factory.Sync.makeFactory<{}>({});
