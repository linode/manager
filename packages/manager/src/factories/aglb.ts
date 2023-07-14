import * as Factory from 'factory.ts';
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

// ********************
// Entrypoint endpoints
// ********************
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

// ***********************
// Loadbalancers endpoints
// ***********************

export const getLoadbalancerFactory = Factory.Sync.makeFactory<Loadbalancer>({
  id: Factory.each((i) => i),
  tags: ['tag1', 'tag2'],
  label: 'loadbalancer1',
  regions: ['us-west'],
  entrypoints: ['entrypoint1'],
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

export const updateLoadbalancerFactory = Factory.Sync.makeFactory<UpdateLoadbalancerPayload>(
  {
    label: Factory.each((i) => `loadbalancer${i}`),
    regions: ['us-west'],
    entrypoints: [1],
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
  id: Factory.each((i) => i),
  label: Factory.each((i) => `images-backend-aws-${i}`),
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
});

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
