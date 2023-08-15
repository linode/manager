import {
  CreateEntrypointPayload,
  CreateLoadbalancerPayload,
  Entrypoint,
  Loadbalancer,
  Route2,
  RoutePayload2,
  ServiceTarget,
  ServiceTargetPayload,
  UpdateLoadbalancerPayload,
} from '@linode/api-v4/lib/aglb/types';
import * as Factory from 'factory.ts';

// ********************
// Entrypoint endpoints
// ********************
export const getEntrypointFactory = Factory.Sync.makeFactory<Entrypoint>({
  certificate_table: [
    {
      certificate_id: 'cert-12345',
      sni_hostname: 'example.com',
    },
  ],
  id: Factory.each((i) => i),
  label: Factory.each((i) => `entrypoint${i}`),
  port: 80,
  protocol: 'HTTP',
  routes: ['images-route'],
});

export const createEntrypointFactory = Factory.Sync.makeFactory<CreateEntrypointPayload>(
  {
    certificate_table: [
      {
        certificate_id: 'cert-12345',
        sni_hostname: 'example.com',
      },
    ],
    label: Factory.each((i) => `entrypoint${i}`),
    port: 80,
    protocol: 'HTTP',
  }
);

// ***********************
// Loadbalancers endpoints
// ***********************

export const getLoadbalancerFactory = Factory.Sync.makeFactory<Loadbalancer>({
  entrypoints: ['entrypoint1'],
  id: Factory.each((i) => i),
  label: Factory.each((i) => `aglb-${i}`),
  regions: ['us-west'],
  tags: ['tag1', 'tag2'],
});

export const createLoadbalancerFactory = Factory.Sync.makeFactory<CreateLoadbalancerPayload>(
  {
    label: Factory.each((i) => `loadbalancer${i}`),
    regions: ['us-west'],
    tags: ['tag1', 'tag2'],
  }
);

export const createLoadbalancerWithAllChildrenFactory = Factory.Sync.makeFactory<CreateLoadbalancerPayload>(
  {
    entrypoints: [
      {
        certificate_table: [
          {
            certificate_id: 'cert-12345',
            sni_hostname: 'example.com',
          },
        ],
        label: 'myentrypoint1',
        port: 80,
        protocol: 'HTTP',
        routes: [
          {
            default_target: {
              ca_certificate: 'my-cms-certificate',
              endpoints: [
                {
                  capacity: 100,
                  hard_rate_limit: 1000,
                  ip: '192.168.0.101',
                  port: 8080,
                },
              ],
              health_check_healthy_thresh: 2,
              health_check_host: 'example.com',
              health_check_interval: 10,
              health_check_path: '/health',
              health_check_timeout: 5,
              health_check_unhealthy_thresh: 3,
              label: 'my-default-service-target',
              load_balancing_policy: 'ROUND_ROBIN',
            },
            label: 'my-route',
            rules: [
              {
                match_condition: {
                  host: 'example.com',
                  path: '/images',
                },
                service_targets: [
                  {
                    ca_certificate: 'my-cms-certificate',
                    endpoints: [
                      {
                        capacity: 100,
                        hard_rate_limit: 1000,
                        ip: '192.168.0.100',
                        port: 8080,
                      },
                    ],
                    health_check_healthy_thresh: 2,
                    health_check_host: 'example.com',
                    health_check_interval: 10,
                    health_check_path: '/health',
                    health_check_timeout: 5,
                    health_check_unhealthy_thresh: 3,
                    label: 'my-service-target',
                    load_balancing_policy: 'ROUND_ROBIN',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    label: Factory.each((i) => `loadbalancer${i}`),
    regions: ['us-west'],
  }
);

export const updateLoadbalancerFactory = Factory.Sync.makeFactory<UpdateLoadbalancerPayload>(
  {
    entrypoints: [1],
    label: Factory.each((i) => `loadbalancer${i}`),
    regions: ['us-west'],
  }
);

// ****************
// Routes endpoints
// ****************

export const getRouteFactory = Factory.Sync.makeFactory<Route2>({
  id: Factory.each((i) => i),
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

// *************************
// Service Targets endpoints
// *************************

export const getServiceTargetFactory = Factory.Sync.makeFactory<ServiceTarget>({
  ca_certificate: 'my-cms-certificate',
  endpoints: [
    {
      capacity: 100,
      hard_rate_limit: 1000,
      ip: '192.168.0.100',
      port: 8080,
    },
  ],
  health_check_healthy_thresh: 2,
  health_check_host: 'example1.com',
  health_check_interval: 10,
  health_check_path: '/health',
  health_check_timeout: 5,
  health_check_unhealthy_thresh: 3,
  id: Factory.each((i) => i),
  label: Factory.each((i) => `images-backend-aws-${i}`),
  load_balancing_policy: 'ROUND_ROBIN',
});

export const createServiceTargetFactory = Factory.Sync.makeFactory<ServiceTargetPayload>(
  {
    ca_certificate: 'my-cms-certificate',
    endpoints: [
      {
        capacity: 100,
        hard_rate_limit: 1000,
        ip: '192.168.0.100',
        port: 8080,
      },
    ],
    health_check_healthy_thresh: 2,
    health_check_host: 'example1.com',
    health_check_interval: 10,
    health_check_path: '/health',
    health_check_timeout: 5,
    health_check_unhealthy_thresh: 3,
    label: 'images-backend-aws',
    load_balancing_policy: 'ROUND_ROBIN',
  }
);
